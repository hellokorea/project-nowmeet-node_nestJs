import { Match } from "../entity/match.entity";
import { EntityManager, Repository } from "typeorm";
import { DevMatch } from "../entity/match.dev.entity";
export declare class MatchRepository {
    private matchRepository;
    private devMatchRepository;
    constructor(matchRepository: Repository<Match>, devMatchRepository: Repository<DevMatch>);
    findOneMatchById(matchId: number): Promise<Match>;
    isMatchFind(senderId: number, receiverId: number): Promise<Match[] | null>;
    findOneMatchByUserIds(profileId: number, loggedId: number): Promise<Match | null>;
    findExpiredMatches(): Promise<Match[]>;
    getSendMatches(userId: number): Promise<Match[]>;
    getReceiveMatches(userId: number): Promise<Match[]>;
    createMatch(senderId: number, receiverId: number): Promise<Match>;
    saveMatch(match: Match): Promise<Match>;
    removeExpireMatch(match: Match): Promise<void>;
    findOneDevMatchById(matchId: number): Promise<DevMatch>;
    createDevMatch(senderId: number, receiverId: number): Promise<DevMatch>;
    saveDevMatch(match: DevMatch): Promise<DevMatch>;
    deleteMatchesByUserId(txManager: EntityManager, userId: number): Promise<void>;
    deleteDevMatchesByUserId(txManager: EntityManager, userId: number): Promise<void>;
}
