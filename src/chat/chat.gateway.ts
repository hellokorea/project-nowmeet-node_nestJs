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
import { Server, Socket } from "socket.io";
import { ChatRoom, ChatState } from "./entity/chats.entity";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
import { ChatMessage } from "./entity/chatmessage.entity";
import {
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { DevChatRoom } from "./entity/devchats.entity";
import * as moment from "moment-timezone";
import { UsersService } from "./../users/service/users.service";
import { MatchRepository } from "./../match/match.repository";
import * as jwt from "jsonwebtoken";
import { UsersRepository } from "src/users/users.repository";
import { User } from "src/users/entity/users.entity";

@WebSocketGateway({ namespace: "chats" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  chatRoomTimers: Record<number, NodeJS.Timeout> = {};

  constructor(
    @InjectRepository(ChatRoom) private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(DevChatRoom) private devChatRoomRepository: Repository<DevChatRoom>,
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly matchRepository: MatchRepository
  ) {}

  async handleConnection(client: Socket) {
    //여기서 클라가 쏴줘야함 chatId를
    const roomId = client.handshake.query.roomId;
    const chatRoom = await this.findChatRoomsByChatId(Number(roomId));

    if (chatRoom) {
      client.join(roomId);
      console.log(`ChatRoom Socket Connect! clientId : ${client.id}`);
      console.log(`ChatRoom Socket Connect! roomId : ${roomId}`);
    } else {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`ChatRoom Socket Disconnect! clientId : ${client.id}`);
  }

  //-----Delete Chat Logic
  async removeUserChatRoom(chatId: number) {
    try {
      const chat = await this.findChatRoomsByChatId(chatId);
      if (!chat) {
        throw new NotFoundException("연결을 종료할 채팅방이 존재하지 않습니다.");
      }
      await this.removeChatRoom(chat);
      //!여기서 chatMessage data 삭제
      return;
    } catch (error) {
      console.error(error);
    }
  }

  //-----Alert User Exit
  async alertUserExit(chatId: number, userNickname: string) {
    const message = `${userNickname}님이 채팅방을 나갔습니다.`;
    this.server.to(chatId.toString()).emit("chatRoomUserExit", { messageType: "system", message });
    return;
  }

  //*------------Chat Logic
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
    const PROD_TIMER = 12 * 60 * 60 * 1000;
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

      // Chat Status Field Data Save
      chat.status = ChatState.EXIPRE_END;
      await this.chatRoomRepository.save(chat);

      delete this.chatRoomTimers[matchId];

      // Socket Emit
      this.server.to(chat.id.toString()).emit("chatRoomExpired", {
        matchId: matchId,
        chatId: chat.id,
        chatStatus: chat.status,
        reason: "chatRoomExpired",
        messageType: "system",
        message: "유저가 12시간 내 채팅방을 오픈하지 않아 소멸 됩니다",
      });
      console.log(`채팅 오픈 가능 시간이 종료되어 matchId : ${matchId}의 채팅방이 EXIPRE_END 상태가 됩니다.`);
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
          `해당 채팅방은 ${chat.status} 상태이기 때문에 matchId : ${matchId}는 DISCONNECT_END 상태가 되지 않습니다.`
        );
        return;
      }

      // Chat Status Field Data Save
      chat.status = ChatState.DISCONNECT_END;
      await this.chatRoomRepository.save(chat);

      delete this.chatRoomTimers[matchId];

      // Socket Emit
      this.server.to(chat.id.toString()).emit("chatRoomDisconnect", {
        matchId: matchId,
        chatId: chat.id,
        reason: "chatRoomDisconnect",
        messageType: "system",
        message: "채팅 가능한 시간이 종료 되어 연결이 끊깁니다",
      });
      console.log(`채팅 가능 시간이 종료되어  matchId : ${matchId}의 채팅방이 DISCONNECT_END 상태가 됩니다.`);
    }, PROD_TIMER);

    return openStatusChatRoom;
  }

  //*--------------------------Message Logic
  @SubscribeMessage("message")
  async handleMessage(@MessageBody() msg: string, @ConnectedSocket() client: Socket) {
    // User Verify
    const token = client.handshake?.auth?.token;
    const user = await this.verifyWebSocketToken(token);

    // Chat Data
    const roomId = client.handshake.query.roomId;

    const chatRoom = await this.findChatRoomsByChatId(Number(roomId));

    if (!chatRoom) {
      throw new NotFoundException("존재하지 않는 채팅방 입니다");
    }

    console.log("클라이언트로부터 메시지를 수신했습니다:", msg);

    try {
      // Chat Data Save
      const savedMessage = await this.chatMessageRepository.save({
        sender: user,
        chatRoom: chatRoom,
        content: msg,
      });

      // Response Data
      const messageData = {
        id: savedMessage.id,
        chatRoomId: savedMessage.chatRoom.id,
        content: savedMessage.content,
        senderId: savedMessage.sender.id,
        senderNickname: savedMessage.sender.nickname,
      };

      console.log(messageData);

      this.server.to(messageData.chatRoomId.toString()).emit("message", messageData);
      // this.server.emit("message", messageData);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("메시지 저장 도중 오류 발생 했습니다");
    }
  }

  //*--------------------------Web Socket Token Verify Logic
  async verifyWebSocketToken(token: string): Promise<User> {
    if (!token) throw new UnauthorizedException("WebSocket token is missing");

    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object") {
      throw new UnauthorizedException("WebSocket Invalid token");
    }

    const issuer = (decoded as jwt.JwtPayload).iss;
    if (!issuer) throw new UnauthorizedException("WebSocket Issuer is missing in token");

    try {
      let user: User;
      if (issuer.includes("accounts.google.com")) {
        user = await this.usersRepository.findOneGetByEmail(decoded.email);
      } else if (issuer.includes("appleid.apple.com")) {
        user = await this.usersRepository.findAppleSub(decoded.sub);
      }

      const result = await this.usersService.validateUser(user.id);

      return result;
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException("CustomJwtGuards 작동 실패");
    }
  }

  //*--------------------------Repository Logic
  async findChatsByUserId(userId: number): Promise<ChatRoom[]> {
    const chats = await this.chatRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      relations: ["message"],
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
    return await this.chatRoomRepository.findOne({ where: { id: chatId }, relations: ["message"] });
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

  async findOneLastMessage(chatId: number): Promise<ChatMessage> {
    const option: FindOneOptions<ChatMessage> = {
      where: { chatRoom: { id: chatId } },
      order: { createdAt: "DESC" },
    };
    return await this.chatMessageRepository.findOne(option);
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
