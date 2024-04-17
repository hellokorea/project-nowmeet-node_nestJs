import { MatchService } from "../service/match.service";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { MatchProfileService } from "src/match/service/match.profile.service";
import { MatchBoxService } from "../service/match.chat.box.service";
import { MatchChatService } from "../service/match.chat.service";
export declare class MatchController {
    private readonly matchProfileService;
    private readonly matchService;
    private readonly matchBoxService;
    private readonly matchChatService;
    constructor(matchProfileService: MatchProfileService, matchService: MatchService, matchBoxService: MatchBoxService, matchChatService: MatchChatService);
    getUserProfile(nickname: string, req: UserRequestDto): Promise<{
        user: import("../../users/dtos/response/user.profile.dto").UserProfileResponseDto;
        matchStatus: string;
        PreSignedUrl: string[];
    }>;
    userLikeSend(nickname: string, req: UserRequestDto): Promise<{
        matchId: number;
        me: number;
        myNickname: string;
        receiverId: number;
        receiverNickname: string;
        matchStatus: string;
    }>;
    acceptLike(matchId: number, req: UserRequestDto): Promise<{
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
    rejectLike(matchId: number, req: UserRequestDto): Promise<{
        match: {
            matchStatus: string;
            senderId: number;
        };
    }>;
    getLikeSendBox(req: UserRequestDto): Promise<{
        matchId: number;
        matchStatus: string;
        receiverId: number;
        receiverNickname: string;
        expireMatch: string;
        profileImages: {
            ProfileImages: string[];
            PreSignedUrl: string[];
        };
    }[]>;
    getLikeReceiveBox(req: UserRequestDto): Promise<{
        matchId: number;
        matchStatus: string;
        senderId: number;
        senderNickname: string;
        expireMatch: string;
        profileImages: {
            ProfileImages: string[];
            PreSignedUrl: string[];
        };
    }[]>;
    getChatRommsList(req: UserRequestDto): Promise<{
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
