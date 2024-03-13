import { InternalServerErrorException, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MatchState } from "src/match/database/entity/match.entity";
import { MatchRepository } from "src/match/database/repository/match.repository";

@Injectable()
export class ScheduleService {
  constructor(private readonly matchRepository: MatchRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM) //EVERY_DAY_AT_MIDNIGHT ; EVERY_5_MINUTES
  async handleExpiredMatches() {
    try {
      const expireMatches = await this.matchRepository.findExpiredMatches();

      if (!expireMatches.length) {
        return;
      }

      expireMatches.forEach(async (match) => {
        console.log(`삭제된 matchId: ${match.id}, matchStatus: ${match.status} ... match data remove`);
        await this.matchRepository.removeExpireMatch(match);
      });
    } catch (e) {
      console.error("handleExpiredMatches error :", e);
      throw new InternalServerErrorException("만료된 매치 데이터 삭제에 실패 했습니다.");
    }

    return;
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async checkAndExpireMatches() {
    try {
      const matchesToExpire = await this.matchRepository.findExpiredMatches();

      if (!matchesToExpire.length) {
        return;
      }

      for (const match of matchesToExpire) {
        match.status = MatchState.EXPIRE;
        await this.matchRepository.saveMatch(match);
      }
    } catch (e) {
      console.error("checkAndExpireMatches error :", e);
      throw new InternalServerErrorException("만료된 매치 상태 반영에 실패 했습니다.");
    }
    return;
  }
}
