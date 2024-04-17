/// <reference types="multer" />
import { UsersRepository } from "../database/repository/users.repository";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { MatchRepository } from "../../match/database/repository/match.repository";
import { Connection } from "typeorm";
import { AwsService } from "src/aws.service";
import { UpdateIntroduceDto, UpdateJobDto, UpdatePreferenceDto } from "../dtos/request/user.putMyInfo.dto";
import { RecognizeService } from "../../recognize/recognize.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";
import { ChatMessagesRepository } from "./../../chat/database/repository/chat.message.repository";
export declare class UserAccountService {
    private readonly recognizeService;
    private readonly usersRepository;
    private readonly matchRepository;
    private readonly chatsRepository;
    private readonly chatMessagesRepository;
    private readonly connection;
    private readonly awsService;
    constructor(recognizeService: RecognizeService, usersRepository: UsersRepository, matchRepository: MatchRepository, chatsRepository: ChatsRepository, chatMessagesRepository: ChatMessagesRepository, connection: Connection, awsService: AwsService);
    getMyUserInfo(req: UserRequestDto): Promise<{
        user: import("../database/entity/users.entity").User;
        PreSignedUrl: string[];
    }>;
    putMyJobInfo(body: UpdateJobDto, req: UserRequestDto): Promise<string>;
    putMyIntroduceInfo(body: UpdateIntroduceDto, req: UserRequestDto): Promise<string>;
    putMyPreferenceInfo(body: UpdatePreferenceDto, req: UserRequestDto): Promise<string[]>;
    putMyProfileImageAtIndex(index: number, req: UserRequestDto, files: Array<Express.Multer.File>): Promise<{
        updatedUser: string[];
        PreSignedUrl: string[];
    }>;
    deleteUserProfilesKey(index: number, req: UserRequestDto): Promise<{
        message: string;
        deleteKey: string;
        userProfileImages: string[];
    }>;
    deleteAccount(req: UserRequestDto): Promise<{
        message: string;
    }>;
    deleteMatchChats(req: UserRequestDto): Promise<{
        message: string;
    }>;
}
