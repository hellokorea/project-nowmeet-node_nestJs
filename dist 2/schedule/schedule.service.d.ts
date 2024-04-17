import { MatchRepository } from "src/match/database/repository/match.repository";
export declare class ScheduleService {
    private readonly matchRepository;
    constructor(matchRepository: MatchRepository);
    handleExpiredMatches(): Promise<void>;
    checkAndExpireMatches(): Promise<void>;
}
