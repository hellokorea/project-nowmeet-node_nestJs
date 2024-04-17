import { ChatsRepository } from "../database/repository/chat.repository";
import { ChatMessagesRepository } from "../database/repository/chat.message.repository";
import { RedisService } from "src/redis/redis.service";
export declare class ChatService {
    private readonly chatsRepository;
    private readonly chatMessagesRepository;
    private readonly redisService;
    private PROD_TIMER;
    private TEST_TIMER;
    constructor(chatsRepository: ChatsRepository, chatMessagesRepository: ChatMessagesRepository, redisService: RedisService);
    createChatRoom(matchId: number, senderId: number, receiverId: number): Promise<import("../database/entity/chat.entity").ChatRoom>;
    openChat(matchId: number): Promise<import("../database/entity/chat.entity").ChatRoom>;
    removeUserChatRoom(chatId: number): Promise<void>;
}
