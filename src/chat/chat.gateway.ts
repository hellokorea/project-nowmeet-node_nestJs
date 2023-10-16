import { InjectRepository } from "@nestjs/typeorm";
import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { ChatRoom, ChatState } from "./entity/chats.entity";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
import { ChatMessage } from "./entity/chatmessage.entity";
import { UseGuards, Req, InternalServerErrorException, BadRequestException, NotFoundException } from "@nestjs/common";
import { SendMessageDto } from "./dtos/chat.dto";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";
import { UserRequestDto } from "src/users/dtos/users.request.dto";
import { UsersRepository } from "src/users/users.repository";
import { DevChatRoom } from "./entity/devchats.entity";

@WebSocketGateway({ namespace: "chat" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() socket: Socket;
  chatRoomTimers: Record<number, NodeJS.Timeout> = {};

  constructor(
    @InjectRepository(ChatRoom) private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(DevChatRoom) private devChatRoomRepository: Repository<DevChatRoom>,
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
    private readonly userRepository: UsersRepository
  ) {}

  async handleConnection() {
    console.log("매칭된 상대와 채팅방 오픈"); //채팅방 열기 클라 이벤트 받아야함
    this.socket.on("openchatroom", (data) => {
      const chat = data;

      const matchId = chat.id;

      if (chat) {
        chat.isOpen = ChatState.OPEN;
        //dev_chat_room에도 반영 되어야함

        this.setChatRoomDisconnectTimer(matchId);
      } else {
        throw new NotFoundException(`${matchId}번의 매치가 존재하지 않습니다`);
      }
    });
  }

  async handleDisconnect(matchId: number) {
    console.log("채팅방 데이터 삭제 로직 시작");

    const chat = await this.chatRoomRepository.find({ where: { matchId: matchId } });

    await this.chatRoomRepository.remove(chat);

    console.log("채팅방 데이터 삭제 완료");
  }

  async createChatRoom(matchId: number, senderId: number, receiverId: number) {
    const findChat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

    if (findChat) {
      throw new BadRequestException("이미 해당 매칭의 채팅방이 존재합니다");
    }

    const createChatRoom = this.chatRoomRepository.create({
      matchId: matchId,
      senderId: senderId,
      receiverId: receiverId,
    });

    const createDevChatRoom = this.devChatRoomRepository.create({
      matchId: matchId,
      senderId: senderId,
      receiverId: receiverId,
    }); //Dev

    const newChatRooms = await this.chatRoomRepository.save(createChatRoom);

    await this.devChatRoomRepository.save(createDevChatRoom); //Dev

    await this.setChatRoomExpireTimer(matchId);

    return newChatRooms;
  }

  async setChatRoomExpireTimer(matchId: number) {
    const CHAT_EXPIRE_TIMER = 12 * 60 * 60 * 1000;
    const TEST = 40 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
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

      await this.handleDisconnect(matchId);
    }, CHAT_EXPIRE_TIMER);
  }

  async setChatRoomDisconnectTimer(matchId: number) {
    const CHAT_DISCONNECT_TIMER = 12 * 60 * 60 * 1000;
    const TEST = 30 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
      }

      this.socket.to(String(matchId)).emit("chatRoomDisconnect", {
        matchId: matchId,
        chatId: chat.id,
        reason: "chatRoomDisconnect",
        message: "채팅 가능 제한 시간이 종료 되어 연결이 끊깁니다",
      });
      console.log(`채팅 가능 시간이 종료되어 ${matchId}의 채팅방 연결이 끊깁니다`);

      delete this.chatRoomTimers[matchId];

      await this.handleDisconnect(matchId);
    }, CHAT_DISCONNECT_TIMER);
  }

  /*
 ^^--------------------------Message Rogic
  */
  @SubscribeMessage("message")
  @UseGuards(JwtAuthGuard)
  async handleMessage(
    @MessageBody() messageDto: SendMessageDto,
    @ConnectedSocket() socket: Socket,
    @Req() req: UserRequestDto
  ) {
    const userId = req.user.id;
    const findUser = await this.userRepository.findById(userId);

    if (!findUser) {
      throw new NotFoundException("해당 유저가 존재하지 않습니다");
    }

    const chatRoom = await this.chatRoomRepository.findOne({ where: { id: messageDto.chatRoomId } });

    if (!chatRoom) {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }

    const message = new ChatMessage();
    message.sender = findUser;
    message.chatRoom = chatRoom;
    message.content = messageDto.content;

    try {
      await this.chatMessageRepository.save(message);
    } catch (error) {
      throw new InternalServerErrorException("메시지 저장 도중 오류 발생 했습니다");
    }

    socket.broadcast.to(messageDto.chatRoomId.toString()).emit("new_message", message);
  }

  /*
 ^^--------------------------Repository Rogic
  */
  async findChatsByUserId(userId: number): Promise<ChatRoom[]> {
    const chats = await this.chatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    return chats;
  }

  async findChatsByUserIds(profileId: number, loggedId: number): Promise<ChatRoom | null> {
    const option: FindOneOptions<ChatRoom> = {
      where: [
        { senderId: loggedId, receiverId: profileId },
        { senderId: profileId, receiverId: loggedId },
      ],
    };

    return await this.chatRoomRepository.findOne(option);
  }

  async findChatRoomsByChatId(chatId: number): Promise<ChatRoom> {
    return await this.chatRoomRepository.findOne({ where: { id: chatId } });
  }

  async deleteChatDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const chatRoomRepository = txManager.getRepository(ChatRoom);
    const chats = await chatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    await chatRoomRepository.remove(chats);
  }

  /*
  ^^--------------- dev rogic
   */
  async deleteDevChatDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const devChatRoomRepository = txManager.getRepository(DevChatRoom);
    const chats = await devChatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    await devChatRoomRepository.remove(chats);
  }
}
