import { OnModuleInit } from "@nestjs/common";
import { ChatsRepository } from "../database/repository/chat.repository";
export declare class ChatStatusUpdaterService implements OnModuleInit {
    private readonly chatsRepository;
    constructor(chatsRepository: ChatsRepository);
    onModuleInit(): Promise<void>;
}
