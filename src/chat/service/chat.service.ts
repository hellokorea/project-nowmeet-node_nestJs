import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ChatsRepository } from "../database/repository/chat.repository";
import { ChatMessagesRepository } from "../database/repository/chat.message.repository";
import * as moment from "moment";
import { ChatState } from "../database/entity/chat.entity";
import { RedisService } from "src/redis/redis.service";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { ChatListGateway } from "../gateway/chat.list.gateway";

@Injectable()
export class ChatService {
  private PROD_TIMER: number = 24 * 60 * 60 * 1000;
  private TEST_TIMER: number = 180 * 1000;

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatMessagesRepository: ChatMessagesRepository,
    private readonly redisService: RedisService,
    private readonly usersRepository: UsersRepository,
    private readonly chatListGateway: ChatListGateway
  ) {}

  async createChatRoom(userId: number, matchId: number, senderId: number, receiverId: number) {
    const findChat = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);
    const currentUser = await this.usersRepository.findOneById(userId);

    if (findChat) {
      throw new BadRequestException("이미 해당 매칭의 채팅방이 존재합니다");
    }

    const expireTime = moment().add(this.TEST_TIMER, "milliseconds").tz("Asia/Seoul").toDate();

    const createChatRoom = await this.chatsRepository.createChatRoom(matchId, senderId, receiverId, expireTime);
    const createDevChatRoom = await this.chatsRepository.createDevChatRoom(matchId, senderId, receiverId); // Dev

    const newChatRooms = await this.chatsRepository.saveChatData(createChatRoom);
    await this.chatsRepository.saveDevChatData(createDevChatRoom); // Dev

    await this.redisService.publishChatStatus(newChatRooms.id, newChatRooms.status);

    let oppUserId = currentUser.id === senderId ? receiverId : senderId;

    await this.chatListGateway.notifyNewChatRoom(newChatRooms, oppUserId);

    return newChatRooms;
  }

  async openChat(matchId: number) {
    const chatRoom = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);
    chatRoom.disconnectTime = moment().add(this.TEST_TIMER, "milliseconds").tz("Asia/Seoul").toDate();
    chatRoom.status = ChatState.OPEN;
    const openChatRoom = await this.chatsRepository.saveChatData(chatRoom);

    // Dev
    const devChatRoom = await this.chatsRepository.findOneDevChatRoomsByMatchId(matchId);
    devChatRoom.status = ChatState.OPEN;
    await this.chatsRepository.saveDevChatData(devChatRoom);

    await this.redisService.publishChatStatus(openChatRoom.id, openChatRoom.status);

    return openChatRoom;
  }

  async removeUserChatRoom(chatId: number) {
    try {
      const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);
      const chatMsg = await this.chatMessagesRepository.findChatMsgByChatId(chatId);

      if (!chat) {
        throw new NotFoundException("삭제할 채팅방이 존재하지 않습니다.");
      }
      await this.chatMessagesRepository.removeChatMessage(chatMsg);
      await this.chatsRepository.removeChatRoom(chat);
      return;
    } catch (e) {
      console.error("removeUserChatRoom :", e);
      throw new BadRequestException("채팅방 삭제 도중 문제가 발생했습니다.");
    }
  }
}
