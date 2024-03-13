import { Module, forwardRef } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { MatchModule } from "src/match/match.module";
import { AppModule } from "src/app.module";

@Module({
  imports: [forwardRef(() => MatchModule), forwardRef(() => AppModule)],
  exports: [ScheduleService],
  controllers: [],
  providers: [ScheduleService],
})
export class ScheduleSearchModule {}
