import { Injectable } from "@nestjs/common";
import { MatchService } from "./match/service/match.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class AppService {
  constructor(private readonly matchService: MatchService) {}

  //Expire Matches Delete
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //EVERY_DAY_AT_MIDNIGHT ; EVERY_5_MINUTES
  async handleExpiredMatches() {
    await this.matchService.removeExpireMatches();
  }

  getHello(): string {
    return "Hello World!";
  }
}
