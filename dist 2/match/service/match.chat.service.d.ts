import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { RecognizeService } from "../../recognize/recognize.service";
import { AwsService } from "src/aws.service";
import { ChatService } from "./../../chat/service/chat.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";
import { ChatMessagesRepository } from "./../../chat/database/repository/chat.message.repository";
import { RedisService } from "src/redis/redis.service";
export declare class MatchChatService {
    private readonly usersRepository;
    private readonly chatsRepository;
    private readonly chatMessagesRepository;
    private readonly chatService;
    private readonly recognizeService;
    private readonly awsService;
    private readonly redisService;
    constructor(usersRepository: UsersRepository, chatsRepository: ChatsRepository, chatMessagesRepository: ChatMessagesRepository, chatService: ChatService, recognizeService: RecognizeService, awsService: AwsService, redisService: RedisService);
    getChatRoomsAllList(req: UserRequestDto): Promise<{
        chatId: number;
        matchId: number;
        me: number;
        matchUserId: number;
        lastMessage: string;
        matchUserNickname: string;
        chatStatus: string;
        preSignedUrl: string[];
    }[]>;
    getUserChatRoom(chatId: number, req: UserRequestDto): Promise<{
        chatUserData: {
            id: number;
            matchId: number;
            chatStatus: string;
            message: {
                id: number;
                roomId: number;
                content: string;
                senderId: number;
                senderNickname: string;
                createdAt: string;
            }[];
            chathUserId: number;
            chatUserNickname: string;
            myNickname: string;
            preSignedUrl: string[];
        };
        chatTime: string;
    }>;
    openChatRoom(chatId: number, req: UserRequestDto): Promise<{
        chatId: number;
        matchId: number;
        chatStatus: string;
        disconnectTime: Date;
    }>;
    exitChatRoom(chatId: number, req: UserRequestDto): Promise<{
        message: string;
    }>;
    deleteChatRoom(chatId: number, req: UserRequestDto): Promise<{
        message: string;
    }>;
}
