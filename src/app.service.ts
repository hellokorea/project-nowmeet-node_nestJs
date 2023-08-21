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
    }, TEST_CYCLE);
  }

  getHello(): string {
    return "Hello World!";
  }
}
