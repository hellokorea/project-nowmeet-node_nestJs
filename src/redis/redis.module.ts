import { forwardRef, Module } from "@nestjs/common";
import { ChatModule } from "src/chat/chat.module";
import { MatchModule } from "src/match/match.module";
import { RedisService } from "./redis.service";

@Module({
  imports: [forwardRef(() => ChatModule), forwardRef(() => MatchModule)],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
