import { MatchRepository } from "../database/repository/match.repository";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UsersRepository } from "../../users/database/repository/users.repository";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatService } from "./../../chat/service/chat.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";
export declare class MatchService {
    private readonly matchRepository;
    private readonly usersRepository;
    private readonly chatsRepository;
    private readonly chatService;
    private readonly recognizeService;
    constructor(matchRepository: MatchRepository, usersRepository: UsersRepository, chatsRepository: ChatsRepository, chatService: ChatService, recognizeService: RecognizeService);
    sendLike(receiverNickname: string, req: UserRequestDto): Promise<{
        matchId: number;
        me: number;
        myNickname: string;
        receiverId: number;
        receiverNickname: string;
        matchStatus: string;
    }>;
    private updateMatchStatus;
    matchAccept(matchId: number, req: UserRequestDto): Promise<{
        match: {
            matchStatus: string;
            senderId: number;
            senderNickname: string;
            myNickname: string;
        };
        chatRoom: {
            chatRoomId: number;
            chatStatus: string;
            matchId: number;
        };
    }>;
    matchReject(matchId: number, req: UserRequestDto): Promise<{
        match: {
            matchStatus: string;
            senderId: number;
        };
    }>;
}
