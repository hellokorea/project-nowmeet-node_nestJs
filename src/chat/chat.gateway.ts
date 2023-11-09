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
import { SendMessageDto } from "./dtos/response/chat.dto";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
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

  async handleConnection(matchId: number) {
    console.log("매칭된 상대와 채팅방 오픈"); //채팅방 열기 클라 이벤트 받아야함
    this.socket.on("openchatroom", async (data) => {
      try {
        console.log(data);
        // await this.setChatRoomDisconnectTimer(matchId);
      } catch (error) {
        console.error(error);
        throw new BadRequestException("채팅방 오픈에 실패 했습니다.");
      }
    });
  }

  // 아예 삭제시켜버리는 로직과 일단 논리적 삭제 하는 것을 둬야 할듯 안그러면 걍 쥐도새도 모르게 채팅방이 날아가기 때문에
  async handleDisconnect(matchId: number) {
    try {
      console.log("채팅방 데이터 삭제 로직 시작");

      const chat = await this.chatRoomRepository.find({ where: { matchId: matchId } });
      await this.chatRoomRepository.remove(chat);
      console.log("채팅방 데이터 삭제 완료");
    } catch (error) {
      console.error(error);
    }
  }

  async createChatRoom(matchId: number, senderId: number, receiverId: number) {
    const findChat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

    if (findChat) {
      throw new BadRequestException("이미 해당 매칭의 채팅방이 존재합니다");
    }

    const PROD_TIMER: number = 12 * 60 * 60 * 1000;
    const TEST_TIMER: number = 30 * 1000;

    const createChatRoom = this.chatRoomRepository.create({
      matchId: matchId,
      senderId: senderId,
      receiverId: receiverId,
      expireTime: new Date(Date.now() + TEST_TIMER),
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
    const PROD_TIMER = 24 * 60 * 60 * 1000;
    const TEST_TIMER = 40 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
      }

      if (chat.status === ChatState.OPEN) {
        console.log(`해당 채팅방은 OPEN 상태이기 때문에 matchId: ${matchId}는 expireTimer에 삭제 되지 않습니다.`);
        return;
      }

      //Chat Status PENDING..
      this.socket.to(String(matchId)).emit("chatRoomExpired", {
        matchId: matchId,
        chatId: chat.id,
        chatStatus: chat.status,
        reason: "chatRoomExpired",
        message: "유저가 12시간 내 채팅방을 오픈하지 않아 소멸 됩니다",
      });
      console.log(`채팅 오픈 가능 시간이 종료되어 ${matchId}의 채팅방이 소멸 됩니다`);

      delete this.chatRoomTimers[matchId];

      await this.handleDisconnect(matchId);
    }, TEST_TIMER);
  }

  async setChatRoomDisconnectTimer(matchId: number) {
    console.log(matchId);
    const PROD_TIMER = 24 * 60 * 60 * 1000;
    const TEST_TIMER = 90 * 1000;

    // DisconnectTime 필드 추가, status OPEN으로 저장
    const chatRoom = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });
    chatRoom.disconnectTime = new Date(Date.now() + TEST_TIMER);
    chatRoom.status = ChatState.OPEN;
    const addDisconnectTime = await this.chatRoomRepository.save(chatRoom);

    //& Dev
    const devChatRoom = await this.devChatRoomRepository.findOne({ where: { matchId: matchId } });
    devChatRoom.status = ChatState.OPEN;
    await this.devChatRoomRepository.save(devChatRoom);
    //

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
      }

      this.socket.to(String(matchId)).emit("chatRoomDisconnect", {
        matchId: matchId,
        chatId: chat.id,
        reason: "chatRoomDisconnect",
        message: "채팅 가능한 시간이 종료 되어 연결이 끊깁니다",
      });

      delete this.chatRoomTimers[matchId];

      console.log(`채팅 가능 시간이 종료되어 ${matchId}의 채팅방 연결이 끊깁니다`);

      await this.handleDisconnect(matchId);
    }, TEST_TIMER);

    return addDisconnectTime;
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
