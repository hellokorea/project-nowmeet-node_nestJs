import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UserProfileResponseDto } from "src/users/dtos/response/user.profile.dto";
import { MatchRepository } from "../database/repository/match.repository";
import { AwsService } from "src/aws.service";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";
export declare class MatchProfileService {
    private readonly usersRepository;
    private readonly matchRepository;
    private readonly chatsRepository;
    private readonly awsService;
    private readonly recognizeService;
    constructor(usersRepository: UsersRepository, matchRepository: MatchRepository, chatsRepository: ChatsRepository, awsService: AwsService, recognizeService: RecognizeService);
    getUserProfile(nickname: string, req: UserRequestDto): Promise<{
        user: UserProfileResponseDto;
        matchStatus: string;
        PreSignedUrl: string[];
    }>;
    getMatchStatus(oppUserId: number, loggedId: number): Promise<string>;
}
