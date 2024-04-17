import { Match } from "src/match/database/entity/match.entity";
export declare class User {
    id: number;
    email: string;
    nickname: string;
    sex: string;
    birthDate: string;
    tall: string;
    job: string;
    introduce: string;
    preference: string[];
    gem: number;
    ghostMode: boolean;
    longitude: number;
    latitude: number;
    profileImages: string[];
    sub: string;
    fcmToken: string;
    createdAt: string;
    sendMatches: Match[];
    receivedMatches: Match[];
}
