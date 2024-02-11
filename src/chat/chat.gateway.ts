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
import { Req, InternalServerErrorException, BadRequestException, NotFoundException, UseGuards } from "@nestjs/common";
import { SendMessageDto } from "./dtos/response/chat.dto";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { DevChatRoom } from "./entity/devchats.entity";
import * as moment from "moment-timezone";
import { CustomJwtGuards } from "src/auth/jwt/jwt.guard";
import { UsersService } from "./../users/service/users.service";
import { MatchRepository } from "./../match/match.repository";

@WebSocketGateway({ namespace: "chats" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() socket: Socket;
  chatRoomTimers: Record<number, NodeJS.Timeout> = {};

  constructor(
    @InjectRepository(ChatRoom) private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(DevChatRoom) private devChatRoomRepository: Repository<DevChatRoom>,
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
    private readonly usersService: UsersService,
    private readonly matchRepository: MatchRepository
  ) {}

  //-----Connect Chat Logic
  async handleConnection(matchId: number, req: UserRequestDto) {
    console.log(`${matchId}번 매칭 Id와 채팅방 연결`);
    const loggedId = req.user.id;

    const match = await this.matchRepository.findMatchById(matchId);

    if (!match) {
      throw new NotFoundException("연결 된 채팅 매칭 정보가 없습니다");
    }

    const chat = await this.findChatRoomsByMatchId(match.id);

    if (!chat) {
      throw new NotFoundException("연결 된 채팅 채팅 정보가 없습니다");
    }

    let oppUserNickname: string;

    if (loggedId === match.sender.id) oppUserNickname = match.receiver.nickname;
    else if (loggedId === match.receiver.id) oppUserNickname = match.sender.nickname;

    const message = `${oppUserNickname}님과 채팅이 시작 되었습니다.`;

    this.socket.to(chat.id.toString()).emit("openChatRoomStart", { messageType: "system", message });
    return;
  }

  //-----Delete Chat Logic
  async handleDisconnect(matchId: number) {
    try {
      const chat = await this.findChatRoomsByMatchId(matchId);
      await this.removeChatRoom(chat);
      return;
    } catch (error) {
      console.error(error);
    }
  }

  //-----Alert User Exit
  async alertUserExit(chatId: number, userNickname: string) {
    const message = `${userNickname}님이 채팅방을 나갔습니다.`;
    this.socket.to(chatId.toString()).emit("chatRoomUserExit", { messageType: "system", message });
    return;
  }

  //-----Chat Logic
  //Create Chat Room
  async createChatRoom(matchId: number, senderId: number, receiverId: number) {
    const findChat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

    if (findChat) {
      throw new BadRequestException("이미 해당 매칭의 채팅방이 존재합니다");
    }

    const PROD_TIMER: number = 12 * 60 * 60 * 1000;
    const TEST_TIMER: number = 60 * 1000;

    const expireTime = moment().add(PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();

    const createChatRoom = this.chatRoomRepository.create({
      matchId: matchId,
      senderId: senderId,
      receiverId: receiverId,
      expireTime,
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

  //ExpireEnd Chat Room Logic
  async setChatRoomExpireTimer(matchId: number) {
    const PROD_TIMER = 24 * 60 * 60 * 1000;
    const TEST_TIMER = 60 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
      }

      if (
        chat.status === ChatState.OPEN ||
        chat.status === ChatState.RECEIVER_EXIT ||
        chat.status === ChatState.SENDER_EXIT
      ) {
        console.log(
          `해당 채팅방은 ${chat.status} 상태이기 때문에 matchId: ${matchId}는 EXIPRE_END 상태가 되지 않습니다.`
        );
        return;
      }

      //^Chat Status PENDING..
      this.socket.to(String(matchId)).emit("chatRoomExpired", {
        matchId: matchId,
        chatId: chat.id,
        chatStatus: chat.status,
        reason: "chatRoomExpired",
        message: "유저가 12시간 내 채팅방을 오픈하지 않아 소멸 됩니다",
      });
      console.log(`채팅 오픈 가능 시간이 종료되어 ${matchId}의 채팅방이 EXIPRE_END 상태가 됩니다.`);

      //^Chat Status Field Data Save
      chat.status = ChatState.EXIPRE_END;
      await this.chatRoomRepository.save(chat);
      //

      delete this.chatRoomTimers[matchId];
    }, PROD_TIMER);
  }

  //DisconnectEnd Chat Room Logic
  async setChatRoomDisconnectTimer(matchId: number) {
    const PROD_TIMER = 24 * 60 * 60 * 1000;
    const TEST_TIMER = 60 * 1000;

    //^DisconnectTime Field Data Active, status OPEN Save
    const chatRoom = await this.chatRoomRepository.findOne({ where: { matchId: matchId } });
    chatRoom.disconnectTime = moment().add(PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();
    chatRoom.status = ChatState.OPEN;
    const openStatusChatRoom = await this.chatRoomRepository.save(chatRoom);

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

      if (chat.status === ChatState.RECEIVER_EXIT || chat.status === ChatState.SENDER_EXIT) {
        console.log(
          `해당 채팅방은 ${chat.status} 상태이기 때문에 matchId: ${matchId}는 DISCONNECT_END 상태가 되지 않습니다.`
        );
        return;
      }

      this.socket.to(String(matchId)).emit("chatRoomDisconnect", {
        matchId: matchId,
        chatId: chat.id,
        reason: "chatRoomDisconnect",
        message: "채팅 가능한 시간이 종료 되어 연결이 끊깁니다",
      });
      console.log(`채팅 가능 시간이 종료되어 ${matchId}의 채팅방이 DISCONNECT_END 상태가 됩니다.`);

      //^Chat Status Field Data Save
      chat.status = ChatState.DISCONNECT_END;
      await this.chatRoomRepository.save(chat);
      //

      delete this.chatRoomTimers[matchId];
    }, PROD_TIMER);

    return openStatusChatRoom;
  }

  //*--------------------------Message Logic
  @SubscribeMessage("message")
  @UseGuards(CustomJwtGuards)
  async handleMessage(
    @MessageBody() messageDto: SendMessageDto,
    @ConnectedSocket() socket: Socket,
    @Req() req: UserRequestDto
  ) {
    const loggedId = req.user.id;
    const user = await this.usersService.validateUser(loggedId);

    const chatRoom = await this.chatRoomRepository.findOne({ where: { id: messageDto.chatRoomId } });

    console.log(chatRoom);

    if (!chatRoom) {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }

    const message = new ChatMessage();
    message.sender = user;
    message.chatRoom = chatRoom;
    message.content = messageDto.content;

    try {
      await this.chatMessageRepository.save(message);
    } catch (error) {
      throw new InternalServerErrorException("메시지 저장 도중 오류 발생 했습니다");
    }

    socket.to(messageDto.chatRoomId.toString()).emit("new_message", message);
  }

  //*--------------------------Repository Logic
  async findChatsByUserId(userId: number): Promise<ChatRoom[]> {
    const chats = await this.chatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    return chats;
  }

  async findChatsByUserIds(profileId: number, loggedId: number): Promise<ChatRoom[] | null> {
    const option: FindOneOptions<ChatRoom> = {
      where: [
        { senderId: loggedId, receiverId: profileId },
        { senderId: profileId, receiverId: loggedId },
      ],
    };

    return await this.chatRoomRepository.find(option);
  }

  async findChatRoomsByChatId(chatId: number): Promise<ChatRoom> {
    return await this.chatRoomRepository.findOne({ where: { id: chatId } });
  }

  async findChatRoomsByMatchId(matchId: number): Promise<ChatRoom> {
    return await this.chatRoomRepository.findOne({ where: { matchId: matchId } });
  }

  async removeChatRoom(chat: ChatRoom) {
    return await this.chatRoomRepository.remove(chat);
  }

  async saveChatData(chat: ChatRoom): Promise<ChatRoom> {
    return this.chatRoomRepository.save(chat);
  }

  async deleteChatDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const chatRoomRepository = txManager.getRepository(ChatRoom);
    const chats = await chatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    await chatRoomRepository.remove(chats);
  }

  //*---------------Dev Logic
  async deleteDevChatDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const devChatRoomRepository = txManager.getRepository(DevChatRoom);
    const chats = await devChatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    await devChatRoomRepository.remove(chats);
  }
}
