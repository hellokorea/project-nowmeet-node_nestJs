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
import { ChatRoom } from "../database/entity/chat.entity";

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
    console.log("챗 리스트 소켓 연결 client.id : ", client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log("챗 리스트 소켓 연결 끊김 client.id : ", client.id);
  }

  async notifyStatusChatRoom(chatRoom: ChatRoom) {
    const userIds = [chatRoom.receiverId, chatRoom.senderId];
    const status = chatRoom.status;

    userIds.forEach((userId) => {
      this.server.to(userId.toString()).emit("status_chat_room", status);
      console.log("status_chat_room userId : ", userId.toString());
      console.log("status_chat_room chatRoomStatus : ", status);
    });
  }

  async notifyNewChatRoom(
    chatRoom: ChatRoom //, userId: number
  ) {
    const userIds = [chatRoom.receiverId, chatRoom.senderId];

    userIds.forEach((userId) => {
      this.server.to(userId.toString()).emit("new_chat_room", chatRoom);
      console.log("new_chat_room userId : ", userId.toString());
      console.log("new_chat_room chatRoom : ", chatRoom);
    });
  }

  async notifyExitChatRoom(chatStatus: string, userId: number) {
    this.server.to(userId.toString()).emit("exit_chat_room", chatStatus);
    console.log("exit_chat_room userId : ", userId);
  }

  async notifyDeleteChatRoom(chatId: number, userId: number) {
    this.server.to(userId.toString()).emit("delete_chat_room", chatId);
    console.log("delete_chat_room userId : ", userId);
  }

  async notifyNewMessage(chatId: number, receiverId: number, lastMessage: string) {
    const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);

    if (!chat) {
      return;
    }

    const messageUpdate = { chatId: chat.id, isRead: chat.isRead, lastMessage };

    this.server.to(receiverId.toString()).emit("message_update", messageUpdate);

    console.log("countUpdateData", messageUpdate);
    console.log("message_update", receiverId);
  }

  @SubscribeMessage("notify_chat_info")
  async handleRequestChatList(client: Socket) {
    const token = client.handshake?.auth?.token;
    const user = await this.recognizeService.verifyWebSocketToken(token);

    try {
      const chatList = await this.matchChatService.getChatRoomsAllList(user.id);

      if (!Array.isArray(chatList) || chatList.length === 0) {
        return null;
      }

      client.join(user.id.toString());

      chatList.forEach((chat) => {
        if (chat && chat.chatId) {
          client.join(chat.chatId.toString());
          console.log(`채팅 리스트에 연결 된 roomIds: ${chat.chatId}`);
        }
      });

      const chatInfoList = chatList.map((chat) => ({
        lastMessage: chat.lastMessage,
        isRead: chat.isRead,
        status: chat.chatStatus,
      }));

      client.emit("notify_chat_info", chatInfoList);
      console.log("notify_chat_info", chatInfoList);
    } catch (e) {
      console.error(e);
      throw new NotFoundException("채팅방 리스트 조회에 실패 했습니다.");
    }
  }
}
