import { Module, forwardRef } from "@nestjs/common";
import { MatchController } from "./controller/match.controller";
import { MatchService } from "./service/match.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from "./database/entity/match.entity";
import { UsersModule } from "src/users/users.module";
import { MatchRepository } from "./database/repository/match.repository";
import { ChatModule } from "src/chat/chat.module";
import { DevMatch } from "./database/entity/match.dev.entity";
import { AppModule } from "src/app.module";
import { AuthModule } from "src/auth/auth.module";
import { MatchProfileService } from "./service/match.profile.service";
import { MatchChatService } from "./service/match.chat.service";
import { MatchBoxService } from "./service/match.chat.box.service";
import { RecognizeModule } from "src/recognize/recognize.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, DevMatch]),
    forwardRef(() => UsersModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RecognizeModule),
    forwardRef(() => AppModule),
  ],
  exports: [MatchService, MatchProfileService, MatchRepository],
  controllers: [MatchController],
  providers: [MatchService, MatchProfileService, MatchChatService, MatchBoxService, MatchRepository],
})
export class MatchModule {}
