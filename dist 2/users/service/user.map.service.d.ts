import { UsersRepository } from "../database/repository/users.repository";
import { AwsService } from "src/aws.service";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { UserProfileResponseDto } from "../dtos/response/user.profile.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";
import { RecognizeService } from "src/recognize/recognize.service";
import { MatchProfileService } from "src/match/service/match.profile.service";
export declare class UserMapService {
    private readonly usersRepository;
    private readonly awsService;
    private readonly recognizeService;
    private readonly matchProfileService;
    constructor(usersRepository: UsersRepository, awsService: AwsService, recognizeService: RecognizeService, matchProfileService: MatchProfileService);
    refreshUserLocation(lon: string, lat: string, req: UserRequestDto, request: Request): Promise<{
        myId: number;
        myLongitude: number;
        myLatitude: number;
        nearbyUsers: UserProfileResponseDto[];
    }>;
    validatePosition(lon: string, lat: string): Promise<{
        lonNumber: number;
        latNumber: number;
    }>;
    putGhostMode(setting: GhostModeDto, req: UserRequestDto): Promise<boolean>;
}
