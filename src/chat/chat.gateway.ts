import { InjectRepository } from "@nestjs/typeorm";
import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatRoom, ChatState } from "./entity/chats.entity";
import { FindOneOptions, Repository } from "typeorm";
import { ChatMessage } from "./entity/chatmessage.entity";
import { UnauthorizedException } from "@nestjs/common";

@WebSocketGateway({ namespace: "chat" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() socket: Socket;
  chatRoomTimers: Record<number, NodeJS.Timeout> = {};

  constructor(
    @InjectRepository(ChatRoom) private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>
  ) {}

  async handleConnection() {
    console.log("매칭된 상대와 채팅방 오픈"); //채팅방 열기 클라 이벤트 받아야함
    this.socket.on("openchatroom", (data) => {
      const chat = data;
      const matchId = chat.id;

      if (chat) {
        chat.isOpen = ChatState.OPEN;
        this.setChatRoomDisconnectTimer(matchId);
      } else {
        throw new UnauthorizedException(`${matchId}번의 매치가 존재하지 않습니다`);
      }
    });
  }

  async handleDisconnect() {
    console.log("연결 끊김 커넥션");
    // db 삭제 로직 추가
  }

  async createChatRoom(matchId: number, senderId: number, receiverId: number) {
    const createChatRoom = this.chatRoomRepository.create({
      matchId: matchId,
      senderId: senderId,
      receiverId: receiverId,
    });

    const newChatRooms = await this.chatRoomRepository.save(createChatRoom);
    console.log(newChatRooms);

    await this.setChatRoomExpireTimer(matchId);

    return newChatRooms;
  }

  async setChatRoomExpireTimer(matchId: number) {
    const CHAT_DISCONNECT_TIMER = 24 * 60 * 60 * 1000;
    const TEST = 40 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new UnauthorizedException("존재하지 않은 매치 입니다.");
      }

      if (chat.status !== ChatState.PENDING) {
        return;
      }

      this.socket.to(String(matchId)).emit("chatRoomExpired", {
        matchId: matchId,
        chatId: chat.id,
        chatStatus: chat.status,
        reason: "chatRoomExpired",
        message: "유저가 24시간 내 채팅방을 오픈하지 않아 소멸 됩니다",
      });
      console.log(`채팅 오픈 가능 시간이 종료되어 ${matchId}의 채팅방이 소멸 됩니다`);

      delete this.chatRoomTimers[matchId];
    }, TEST);
  }

  async setChatRoomDisconnectTimer(matchId: number) {
    const CHAT_DISCONNECT_TIMER = 24 * 60 * 60 * 1000;
    const TEST = 30 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new UnauthorizedException("존재하지 않은 매치 입니다.");
      }

      this.socket.to(String(matchId)).emit("chatRoomDisconnect", {
        matchId: matchId,
        chatId: chat.id,
        reason: "chatRoomDisconnect",
        message: "채팅 가능 제한 시간이 종료 되어 연결이 끊깁니다",
      });
      console.log(`채팅 가능 시간이 종료되어 ${matchId}의 채팅방 연결이 끊깁니다`);

      delete this.chatRoomTimers[matchId];
    }, TEST);
  }

  /*
 --------------메시지
  */

  @SubscribeMessage("message")
  handleMessage(client: any, payload: any): string {
    return "Hello world!";
  }

  /*
 --------------레파지토리
  */
  async findChatsByUserId(userId: number): Promise<ChatRoom[]> {
    const chats = await this.chatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    return chats;
  }

  async findChatsByUserIds(profileId: number, loggedId: number): Promise<ChatRoom | null> {
    const option: FindOneOptions<ChatRoom> = {
      where: [{ senderId: loggedId }, { receiverId: profileId }, { senderId: profileId }, { receiverId: loggedId }],
    };

    return await this.chatRoomRepository.findOne(option);
  }
}
