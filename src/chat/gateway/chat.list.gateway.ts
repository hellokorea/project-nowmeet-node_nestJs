import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatsRepository } from "../database/repository/chat.repository";
import { MatchChatService } from "src/match/service/match.chat.service";
import { ChatRoom, ChatState } from "../database/entity/chat.entity";
import { ChatMessagesRepository } from "../database/repository/chat.message.repository";

@WebSocketGateway({ namespace: "chatList" })
export class ChatListGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatsRepository: ChatsRepository,
    @Inject(forwardRef(() => RecognizeService))
    private readonly recognizeService: RecognizeService,
    private readonly matchChatService: MatchChatService
  ) {}

  async handleConnection(client: Socket) {
    console.log("챗 리스트 소켓 연결");
  }

  async handleDisconnect(client: Socket) {
    console.log("챗 리스트 소켓 연결 끊김");
  }

  async notifynewChatRoom(chatRoom: ChatRoom) {
    const userIds = [chatRoom.receiverId, chatRoom.senderId];

    userIds.forEach((userId) => {
      console.log("new_chat_room userId : ", userId);
      this.server.to(userId.toString()).emit("new_chat_room", chatRoom);
    });
  }

  async notifyExitChatRoom(chatStatus: string, userId: number) {
    console.log("exit_chat_room userId : ", userId);
    this.server.to(userId.toString()).emit("exit_chat_room", chatStatus);
  }

  async notifyDeleteChatRoom(chatId: number, userId: number) {
    console.log("delete_chat_room userId : ", userId);
    this.server.to(userId.toString()).emit("delete_chat_room", chatId);
  }

  async notifyNewMessage(chatId: number, senderId: number, messageCount: number, lastMessage: string) {
    const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);

    if (!chat) {
      return;
    }

    let receiverId: number = senderId === chat.senderId ? chat.receiverId : chat.senderId;

    const messageUpdate = { chatId: chat.id, messageCount, lastMessage };
    console.log("countUpdateData", messageUpdate);
    console.log("message_update", receiverId);

    this.server.to(receiverId.toString()).emit("message_update", messageUpdate);
  }

  @SubscribeMessage("request_chat_list")
  async handleRequestChatList(client: Socket) {
    const token = client.handshake?.auth?.token;
    const user = await this.recognizeService.verifyWebSocketToken(token);

    try {
      const chatList = await this.matchChatService.getChatRoomsAllList(user.id);
      console.log("request_chat_list", chatList);

      if (!Array.isArray(chatList) || chatList.length === 0) {
        return;
      }

      client.join(user.id.toString());

      chatList.forEach((chat) => {
        if (chat && chat.chatId) {
          client.join(chat.chatId.toString());
          console.log(`Client joined room: ${chat.chatId}`);
        }
      });

      client.emit("request_chat_list", chatList);
    } catch (e) {
      console.error(e);
      throw new NotFoundException("채팅방 리스트 조회에 실패 했습니다.");
    }
  }
}
