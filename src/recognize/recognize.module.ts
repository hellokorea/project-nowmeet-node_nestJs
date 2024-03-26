import { Module, forwardRef } from "@nestjs/common";
import { RecognizeService } from "./recognize.service";
import { UsersModule } from "src/users/users.module";
import { MatchModule } from "src/match/match.module";
import { ChatModule } from "src/chat/chat.module";
import { AppModule } from "src/app.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => MatchModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AppModule),
    forwardRef(() => AuthModule),
  ],
  exports: [RecognizeService],
  controllers: [],
  providers: [RecognizeService],
})
export class RecognizeModule {}
