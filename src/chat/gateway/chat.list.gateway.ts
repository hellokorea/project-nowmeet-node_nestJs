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
    console.log("챗 리스트 소켓 연결");
  }

  async handleDisconnect(client: Socket) {
    console.log("챗 리스트 소켓 연결 끊김");
  }

  // async notifynewChatRoom(chatRoom: ChatRoom, userId: number) {
  //   this.server.to(userId.toString()).emit("new_chat_room", chatRoom);
  // }

  // @SubscribeMessage("request_chat_list")
  // async handleRequestChatList(client: Socket) {
  //   const token = client.handshake?.auth?.token;
  //   const user = await this.recognizeService.verifyWebSocketToken(token);

  //   try {
  //     const chatList = await this.matchChatService.getChatRoomsAllList(user.id);
  //     console.log("request_chat_list", chatList);

  //     if (!Array.isArray(chatList) || chatList.length === 0) {
  //       return;
  //     }

  //     client.join(user.id.toString());

  //     chatList.forEach((chat) => {
  //       if (chat && chat.chatId) {
  //         client.join(chat.chatId.toString());
  //         console.log(`Client joined room: ${chat.chatId}`);
  //       }
  //     });

  //     client.emit("request_chat_list", chatList);
  //   } catch (e) {
  //     console.error(e);
  //     throw new NotFoundException("채팅방 리스트 조회에 실패 했습니다.");
  //   }
  // }

  // async notifyNewMessage(chatId: number, messageCount: number, content: string) {
  //   const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);

  //   if (!chat) {
  //     return;
  //   }

  //   const countUpdateData = { chatId: chat.id, messageCount, content };
  //   console.log("countUpdateData", countUpdateData);

  //   this.server.to(chat.id.toString()).emit("message_count_update", countUpdateData);
  // }
}
