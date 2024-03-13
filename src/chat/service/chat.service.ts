import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ChatsRepository } from "../database/repository/chat.repository";
import { ChatMessagesRepository } from "../database/repository/chat.message.repository";
import * as moment from "moment";
import { ChatTimerService } from "./chat.timer.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatMessagesRepository: ChatMessagesRepository,
    private readonly chatTimerService: ChatTimerService
  ) {}

  async createChatRoom(matchId: number, senderId: number, receiverId: number) {
    const findChat = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);

    if (findChat) {
      throw new BadRequestException("이미 해당 매칭의 채팅방이 존재합니다");
    }

    const PROD_TIMER: number = 12 * 60 * 60 * 1000;
    const TEST_TIMER: number = 60 * 1000;

    const expireTime = moment().add(PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();

    const createChatRoom = await this.chatsRepository.createChatRoom(matchId, senderId, receiverId, expireTime);
    const createDevChatRoom = await this.chatsRepository.createDevChatRoom(matchId, senderId, receiverId); // Dev

    const newChatRooms = await this.chatsRepository.saveChatData(createChatRoom);
    await this.chatsRepository.saveDevChatData(createDevChatRoom); // Dev

    await this.chatTimerService.setChatRoomExpireTimer(matchId);

    return newChatRooms;
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
