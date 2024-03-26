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

@WebSocketGateway({ namespace: "chats" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatMessagesRepository: ChatMessagesRepository,
    @Inject(forwardRef(() => RecognizeService))
    private readonly recognizeService: RecognizeService
  ) {}

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

  private statusMessagesId = {
    [ChatState.PENDING]: 1,
    [ChatState.OPEN]: 2,
    //
    [ChatState.SENDER_EXIT]: 3,
    [ChatState.RECEIVER_EXIT]: 4,
    //
    [ChatState.EXPIRE_END]: 5,
    [ChatState.DISCONNECT_END]: 6,
  };

  async handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId;
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
    const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));

    if (!chatRoom) {
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

  @SubscribeMessage("message")
  async handleMessage(@MessageBody() msg: socketMessageReqDto, @ConnectedSocket() client: Socket) {
    const token = client.handshake?.auth?.token;
    const user = await this.recognizeService.verifyWebSocketToken(token);

    const roomId = client.handshake.query.roomId;
    const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));

    if (!chatRoom) {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }

    try {
      const savedMessage = await this.chatMessagesRepository.saveChatMsgData(user, chatRoom, msg.message, msg.date);

      const messageData = {
        id: savedMessage.id,
        chatRoomId: savedMessage.chatRoom.id,
        content: savedMessage.content,
        senderId: savedMessage.sender.id,
        senderNickname: savedMessage.sender.nickname,
        createdAt: moment(savedMessage.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      };

      this.server.to(messageData.chatRoomId.toString()).emit("message", messageData);
    } catch (e) {
      console.error("handleMessage :", e);
      throw new InternalServerErrorException("메시지 저장 도중 오류 발생 했습니다");
    }
  }

  // System Message Common Logic
  async combineMessageToClient(chatMessage: ChatMessage[], status: string) {
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
      const systemMessageId: number = this.statusMessagesId[status] || "채팅방 상태 확인 불가능";

      const systemMessage = {
        id: systemMessageId,
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