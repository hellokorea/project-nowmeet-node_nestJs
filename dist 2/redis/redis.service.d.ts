import { OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { ChatsRepository } from "src/chat/database/repository/chat.repository";
export declare class RedisService implements OnModuleInit {
    private readonly redis;
    private readonly chatsRepository;
    private subscriber;
    private publisher;
    private PROD_TIME;
    private TEST_TIME;
    constructor(redis: Redis, chatsRepository: ChatsRepository);
    onModuleInit(): Promise<void>;
    handlerSubChatExpire(message: string): Promise<void>;
    publishChatStatus(chatId: number, status: string): Promise<void>;
    deleteChatKey(chatId: number): Promise<void>;
}
