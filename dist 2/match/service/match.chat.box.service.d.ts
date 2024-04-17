import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { MatchRepository } from "../database/repository/match.repository";
import { AwsService } from "src/aws.service";
import { RecognizeService } from "../../recognize/recognize.service";
export declare class MatchBoxService {
    private readonly recognizeService;
    private readonly matchRepository;
    private readonly awsService;
    constructor(recognizeService: RecognizeService, matchRepository: MatchRepository, awsService: AwsService);
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
}
