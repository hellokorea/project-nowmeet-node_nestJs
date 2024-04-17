/// <reference types="multer" />
import { UserCreateDto } from "../dtos/request/users.create.dto";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { UpdateIntroduceDto, UpdateJobDto, UpdatePreferenceDto } from "../dtos/request/user.putMyInfo.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";
import { UserSignupService } from "../service/user.signup.service";
import { UserMapService } from "../service/user.map.service";
import { UserAccountService } from "../service/user.account.service";
export declare class UsersController {
    private readonly userSignupService;
    private readonly userMapSerivce;
    private readonly userAccountService;
    constructor(userSignupService: UserSignupService, userMapSerivce: UserMapService, userAccountService: UserAccountService);
    createUser(body: UserCreateDto, files: Array<Express.Multer.File>, request: Request): Promise<import("../database/entity/users.entity").User>;
    nicknameDuplicate(nickname: string): Promise<boolean>;
    UserLocationRefresh(lon: string, lat: string, req: UserRequestDto, request: Request): Promise<{
        myId: number;
        myLongitude: number;
        myLatitude: number;
        nearbyUsers: import("../dtos/response/user.profile.dto").UserProfileResponseDto[];
    }>;
    putGhostMode(setting: GhostModeDto, req: UserRequestDto): Promise<boolean>;
    getMyUserInfo(req: UserRequestDto): Promise<{
        user: import("../database/entity/users.entity").User;
        PreSignedUrl: string[];
    }>;
    putMyJobInfo(body: UpdateJobDto, req: UserRequestDto): Promise<string>;
    putMyIntroInfo(body: UpdateIntroduceDto, req: UserRequestDto): Promise<string>;
    putMyPreInfo(body: UpdatePreferenceDto, req: UserRequestDto): Promise<string[]>;
    putMyProfileSecond(index: number, req: UserRequestDto, files: Array<Express.Multer.File>): Promise<{
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
