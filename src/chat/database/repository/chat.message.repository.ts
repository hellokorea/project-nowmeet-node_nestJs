import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatMessage } from "../entity/chat.message.entity";
import { DeepPartial, EntityManager, FindOneOptions, Repository } from "typeorm";
import { User } from "src/users/database/entity/users.entity";
import { ChatRoom } from "../entity/chat.entity";

@Injectable()
export class ChatMessagesRepository {
  constructor(@InjectRepository(ChatMessage) private chatMessagesRepository: Repository<ChatMessage>) {}

  async findChatMsgByChatId(roomId: number): Promise<ChatMessage[]> {
    if (isNaN(roomId)) {
      console.error("Invalid chat ID:", roomId);
      throw new Error("유효하지 않은 채팅방 ID입니다.");
    }

    return await this.chatMessagesRepository.find({
      where: { chatRoom: { id: roomId } },
      relations: ["sender", "chatRoom"],
    });
  }

  async txsaveChatMsgData(
    txManager: EntityManager,
    user: User,
    chatRoom: ChatRoom,
    content: string,
    createdAt: string
  ): Promise<ChatMessage> {
    const chatMessageRepository = txManager.getRepository(ChatMessage);

    const savedMessage = new ChatMessage();
    savedMessage.sender = user;
    savedMessage.chatRoom = chatRoom;
    savedMessage.content = content;
    savedMessage.createdAt = createdAt;

    console.log("디비에 저장하는 메시지 데이터 :", savedMessage);
    return chatMessageRepository.save(savedMessage);
  }

  async findOneLastMessage(roomId: number): Promise<ChatMessage> {
    const option: FindOneOptions<ChatMessage> = {
      where: { chatRoom: { id: roomId } },
      order: { createdAt: "DESC" },
    };
    return await this.chatMessagesRepository.findOne(option);
  }

  async removeChatMessage(chatMsgs: ChatMessage[]) {
    return await this.chatMessagesRepository.remove(chatMsgs);
  }

  // Delete Account tx
  async deleteMsgDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    await txManager
      .createQueryBuilder()
      .delete()
      .from(ChatMessage)
      .where("chatRoomId IN (SELECT id FROM chat_room WHERE senderId = :userId OR receiverId = :userId)", { userId })
      .execute();
  }
}
