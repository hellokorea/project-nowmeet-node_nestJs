import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ChatsRepository } from "../database/repository/chat.repository";
import { ChatState } from "../database/entity/chat.entity";

@Injectable()
export class ChatStatusUpdaterService implements OnModuleInit {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async onModuleInit() {
    const expireChats = await this.chatsRepository.findExpireChats();
    const disconnectChats = await this.chatsRepository.findDisconnectChats();

    try {
      await Promise.all(
        expireChats.map(async (chat) => {
          chat.status = ChatState.EXPIRE_END;
          await this.chatsRepository.saveChatData(chat);
        })
      );

      await Promise.all(
        disconnectChats.map(async (chat) => {
          chat.status = ChatState.DISCONNECT_END;
          await this.chatsRepository.saveChatData(chat);
        })
      );

      return;
    } catch (e) {
      throw new NotFoundException("만료 된 채팅 데이터 변경 도중 문제가 발생 했습니다.");
    }
  }
}
