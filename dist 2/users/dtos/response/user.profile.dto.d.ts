import { User } from "../../database/entity/users.entity";
export declare class UserProfileResponseDto {
    nickname: string;
    sex: string;
    birthDate: string;
    tall: string;
    job: string;
    introduce: string;
    preference: string[];
    ghostMode: boolean;
    longitude: number;
    latitude: number;
    matchStatus: string;
    profileImages: string[];
    PreSignedUrl: string[];
    constructor(user: User);
}
