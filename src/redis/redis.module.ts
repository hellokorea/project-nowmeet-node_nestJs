import { forwardRef, Module } from "@nestjs/common";
import { ChatModule } from "src/chat/chat.module";
import { MatchModule } from "src/match/match.module";
import { UsersModule } from "src/users/users.module";
import { RedisService } from "./redis.service";

@Module({
  imports: [forwardRef(() => ChatModule), forwardRef(() => MatchModule), forwardRef(() => UsersModule)],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
