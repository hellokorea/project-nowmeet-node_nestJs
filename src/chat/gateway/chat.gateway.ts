import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatState } from "../database/entity/chat.entity";
import { ChatMessage } from "../database/entity/chat.message.entity";
import { InternalServerErrorException, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import * as moment from "moment-timezone";
import { socketMessageReqDto } from "../dtos/request/chat.socekr.message.dto";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatMessagesRepository } from "../database/repository/chat.message.repository";
import { ChatsRepository } from "../database/repository/chat.repository";
import { MatchChatService } from "src/match/service/match.chat.service";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";

@WebSocketGateway({ namespace: "chats" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Send Message Status
  private statusMessages = {
    [ChatState.PENDING]: "채팅이 연결 되었습니다",
    [ChatState.OPEN]: "채팅이 시작 되었습니다",
    //
    [ChatState.SENDER_EXIT]: "상대방이 채팅을 종료하였습니다",
    [ChatState.RECEIVER_EXIT]: "상대방이 채팅을 종료하였습니다",
    //
    [ChatState.EXPIRE_END]: "채팅방 오픈 가능 시간이 만료되어 종료 되었습니다",
    [ChatState.DISCONNECT_END]: "채팅방 사용 시간이 만료되어 종료 되었습니다",
  };

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatMessagesRepository: ChatMessagesRepository,
    @Inject(forwardRef(() => RecognizeService))
    private readonly recognizeService: RecognizeService,
    private readonly matchChatService: MatchChatService
  ) {}

  async handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId;

    if (roomId === null) {
      console.log("roomId가 없어서 핸들 커넥션 로직 발생 안함");
      return;
    }

    const numericRoomId = Number(roomId);
    if (isNaN(numericRoomId)) {
      console.error("Invalid room ID:", roomId);
      throw new NotFoundException("유효하지 않은 채팅방 ID입니다.");
    }

    const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));

    if (!chatRoom) {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }

    try {
      client.join(roomId);
      console.log(`ChatRoom Socket Connect! clientId : ${client.id}`);
      console.log(`ChatRoom Socket Connect! rommId : ${roomId}`);

      const messagesArray = await this.chatMessagesRepository.findChatMsgByChatId(chatRoom.id);
      const emitMessage = await this.combineMessageToClient(messagesArray, chatRoom.status);

      console.log(emitMessage);

      this.server.to(chatRoom.id.toString()).emit("message_list", emitMessage);
    } catch (e) {
      console.error("handleConnection :", e);
      throw new NotFoundException("채팅방 입장에 실패 했습니다");
    }
  }

  async handleDisconnect(client: Socket) {
    const roomId = client.handshake.query.roomId;

    if (roomId === null) {
      console.log(`Client disconnected: ${client.id}, but no roomId found.`);
      return;
    }

    const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));

    if (!chatRoom) {
      console.log(`ChatRoom not found for roomId: ${roomId}`);
      return;
    }

    try {
      console.log(`ChatRoom Socket Disconnect! clientId : ${client.id}`);
      console.log(`ChatRoom Socket Disconnect! roomId : ${roomId}`);

      const messagesArray = await this.chatMessagesRepository.findChatMsgByChatId(chatRoom.id);
      const emitMessage = await this.combineMessageToClient(messagesArray, chatRoom.status);

      console.log("디스커넥트 된 status : ", chatRoom.status);

      this.server.to(chatRoom.id.toString()).emit("message_list", emitMessage);
      this.server.to(chatRoom.id.toString()).emit("status", chatRoom.status);
    } catch (e) {
      console.error("handleDisconnect :", e);
      throw new NotFoundException("채팅방 종료에 실패 했습니다");
    }
  }

  @SubscribeMessage("request_chat_list")
  async handleRequestChatList(client: Socket) {
    const token = client.handshake?.auth?.token;
    console.log("채팅 리스트 토큰", token);
    console.log("챗 리스트 요청 했드앙!~!!");
    const user = await this.recognizeService.verifyWebSocketToken(token);

    console.log("채팅방 리스트에 접속한 현재 유저 ", user);

    try {
      const chatList = await this.matchChatService.getChatRoomsAllList(user.id);
      console.log("request_chat_list", chatList);

      chatList.forEach((chat) => {
        client.join(chat.chatId.toString());
      });

      client.emit("request_chat_list", chatList);
    } catch (e) {
      console.error(e);
      throw new NotFoundException("채팅방 리스트 조회에 실패 했습니다.");
    }
  }

  async notifyNewMessage(chatId: number, messageCount: number, content: string) {
    const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);

    if (!chat) {
      return;
    }

    const countUpdateData = { chatId: chat.id, messageCount, content };
    console.log("countUpdateData", countUpdateData);

    this.server.to(chat.id.toString()).emit("message_count_update", countUpdateData);
  }

  @SubscribeMessage("message")
  async handleMessage(@MessageBody() msg: socketMessageReqDto, @ConnectedSocket() client: Socket) {
    const token = client.handshake?.auth?.token;
    const user = await this.recognizeService.verifyWebSocketToken(token);

    const roomId = client.handshake.query.roomId;

    if (roomId === null) {
      console.log("roomId가 없어서 메시지 로직 커넥션 로직 발생 안함");
      return;
    }

    const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));

    if (!chatRoom) {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }

    try {
      const savedMessage = await this.chatMessagesRepository.saveChatMsgData(user, chatRoom, msg.message, msg.date);

      chatRoom.messageCount += 1;
      await this.chatsRepository.saveChatData(chatRoom);

      const messageData = {
        id: savedMessage.id,
        chatRoomId: savedMessage.chatRoom.id,
        content: savedMessage.content,
        senderId: savedMessage.sender.id,
        senderNickname: savedMessage.sender.nickname,
        createdAt: moment(savedMessage.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      };

      this.server.to(messageData.chatRoomId.toString()).emit("message", messageData);
      this.notifyNewMessage(chatRoom.id, chatRoom.messageCount, savedMessage.content);
    } catch (e) {
      console.error("handleMessage :", e);
      throw new InternalServerErrorException("메시지 저장 도중 오류 발생 했습니다");
    }
  }

  // System Message Common Logic
  private async combineMessageToClient(chatMessage: ChatMessage[], status: string) {
    try {
      const regularmessages = chatMessage.map((msg) => {
        return {
          id: msg.id,
          roomId: msg.chatRoom.id,
          content: msg.content,
          senderId: msg.sender.id,
          senderNickname: msg.sender.nickname,
          createdAt: moment(msg.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        };
      });

      const statusSystemMessage: string = this.statusMessages[status] || "채팅방 상태 확인 불가능";

      const systemMessage = {
        type: "system",
        content: statusSystemMessage,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      let emitMessage;
      if (status === ChatState.OPEN || status === ChatState.PENDING) {
        emitMessage = [systemMessage, ...regularmessages];
      } else {
        emitMessage = [...regularmessages, systemMessage];
      }

      return emitMessage;
    } catch (e) {
      console.error("combineMessageToClient :", e);
      throw new InternalServerErrorException("채팅 메시지 배열 결합에 실패했습니다");
    }
  }
}
