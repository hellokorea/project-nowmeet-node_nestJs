import { Injectable, OnModuleInit } from "@nestjs/common";
import { MatchService } from "./match/service/match.service";

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly matchService: MatchService) {}

  async onModuleInit() {
    const CHECK_CYCLE: number = 24 * 60 * 60 * 1000;
    const TEST_CYCLE: number = 10 * 1000;

    setInterval(async () => {
      await this.matchService.removeExpireMatches();
    }, CHECK_CYCLE);
  }

  //앱 실행 시 주변 유저 정보 Get

  getHello(): string {
    return "Hello World!";
  }
}
