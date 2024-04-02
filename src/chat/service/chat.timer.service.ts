import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ChatsRepository } from "../database/repository/chat.repository";
import { ChatState } from "../database/entity/chat.entity";

@Injectable()
export class ChatTimerService {
  chatRoomTimers: Record<number, NodeJS.Timeout> = {};

  private PROD_TIMER: number = 24 * 60 * 60 * 1000;
  private TEST_TIMER: number = 60 * 1000;

  constructor(private readonly chatsRepository: ChatsRepository) {}

  async setChatRoomExpireTimer(matchId: number) {
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
    }, this.PROD_TIMER);
  }

  async setChatRoomDisconnectTimer(matchId: number) {
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
    }, this.PROD_TIMER);
  }
}
