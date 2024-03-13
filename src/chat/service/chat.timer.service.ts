import { Injectable, NotFoundException } from "@nestjs/common";
import { ChatsRepository } from "../database/repository/chat.repository";
import { ChatState } from "../database/entity/chat.entity";
import * as moment from "moment";

@Injectable()
export class ChatTimerService {
  chatRoomTimers: Record<number, NodeJS.Timeout> = {};
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async setChatRoomExpireTimer(matchId: number) {
    const PROD_TIMER = 24 * 60 * 60 * 1000;
    const TEST_TIMER = 60 * 1000;

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
      }

      if (
        chat.status === ChatState.OPEN ||
        chat.status === ChatState.RECEIVER_EXIT ||
        chat.status === ChatState.SENDER_EXIT
      ) {
        console.log(
          `해당 채팅방은 ${chat.status} 상태이기 때문에 matchId: ${matchId}는 EXPIRE_END 상태가 되지 않습니다.`
        );
        return;
      }

      chat.status = ChatState.EXPIRE_END;
      await this.chatsRepository.saveChatData(chat);

      delete this.chatRoomTimers[matchId];

      console.log(`채팅 오픈 가능 시간이 종료되어 matchId : ${matchId}의 채팅방이 EXPIRE_END 상태가 됩니다.`);
    }, TEST_TIMER);
  }

  async setChatRoomDisconnectTimer(matchId: number) {
    const PROD_TIMER = 24 * 60 * 60 * 1000;
    const TEST_TIMER = 60 * 1000;

    //^DisconnectTime Field Data Active, status OPEN Save
    const chatRoom = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);
    chatRoom.disconnectTime = moment().add(PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();
    chatRoom.status = ChatState.OPEN;
    const openStatusChatRoom = await this.chatsRepository.saveChatData(chatRoom);

    //& Dev
    const devChatRoom = await this.chatsRepository.findOneDevChatRoomsByMatchId(matchId);
    devChatRoom.status = ChatState.OPEN;
    await this.chatsRepository.saveDevChatData(devChatRoom);
    //

    this.chatRoomTimers[matchId] = setTimeout(async () => {
      const chat = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);

      if (!chat) {
        throw new NotFoundException("존재하지 않은 매치 입니다.");
      }

      if (chat.status === ChatState.RECEIVER_EXIT || chat.status === ChatState.SENDER_EXIT) {
        console.log(
          `해당 채팅방은 ${chat.status} 상태이기 때문에 matchId : ${matchId}는 DISCONNECT_END 상태가 되지 않습니다.`
        );
        return;
      }

      chat.status = ChatState.DISCONNECT_END;
      await this.chatsRepository.saveChatData(chat);

      delete this.chatRoomTimers[matchId];

      console.log(`채팅 가능 시간이 종료되어  matchId : ${matchId}의 채팅방이 DISCONNECT_END 상태가 됩니다.`);
    }, TEST_TIMER);

    return openStatusChatRoom;
  }
}
