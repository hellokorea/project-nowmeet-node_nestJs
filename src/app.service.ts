import { Injectable } from "@nestjs/common";
import { MatchService } from "./match/service/match.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MatchRepository } from "./match/match.repository";
import { MatchState } from "./match/entity/match.entity";

@Injectable()
export class AppService {
  constructor(
    private readonly matchService: MatchService,
    private readonly matchRepository: MatchRepository
  ) {}

  //Expire Matches Delete
  @Cron(CronExpression.EVERY_DAY_AT_2AM) //EVERY_DAY_AT_MIDNIGHT ; EVERY_5_MINUTES
  async handleExpiredMatches() {
    try {
      await this.matchService.removeExpireMatches();
    } catch (e) {
      console.error("매치 삭제 처리 중 오류 발생", e);
    }
    return;
  }

  //Expire Matches Chnage
  @Cron(CronExpression.EVERY_3_HOURS)
  async checkAndExpireMatches() {
    try {
      const matchesToExpire = await this.matchRepository.findExpiredMatches();

      if (!matchesToExpire.length) {
        console.log("만료 된 매치 데이터가 없습니다");
        return;
      }

      for (const match of matchesToExpire) {
        match.status = MatchState.EXPIRE;
        await this.matchRepository.saveMatch(match);
      }
    } catch (e) {
      console.error("매치 만료 처리 중 오류 발생:", e);
    }
    return;
  }

  getHello(): string {
    return "Hello World!";
  }
}
