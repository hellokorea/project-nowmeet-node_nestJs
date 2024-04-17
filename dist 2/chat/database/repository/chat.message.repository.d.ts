import { ChatMessage } from "../entity/chat.message.entity";
import { EntityManager, Repository } from "typeorm";
import { User } from "src/users/database/entity/users.entity";
import { ChatRoom } from "../entity/chat.entity";
export declare class ChatMessagesRepository {
    private chatMessagesRepository;
    constructor(chatMessagesRepository: Repository<ChatMessage>);
    findChatMsgByChatId(roomId: number): Promise<ChatMessage[]>;
    saveChatMsgData(user: User, chatRoom: ChatRoom, content: string, createdAt: string): Promise<ChatMessage>;
    findOneLastMessage(roomId: number): Promise<ChatMessage>;
    removeChatMessage(chatMsgs: ChatMessage[]): Promise<ChatMessage[]>;
    deleteMsgDataByUserId(txManager: EntityManager, userId: number): Promise<void>;
}
