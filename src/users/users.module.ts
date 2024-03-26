import { Module, forwardRef } from "@nestjs/common";
import { UsersController } from "./controllers/users.controller";
import { UserAccountService } from "./service/user.account.service";
import { UsersRepository } from "./database/repository/users.repository";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./database/entity/users.entity";
import { MulterModule } from "@nestjs/platform-express";
import { multerOptions } from "src/common/utils/multer.options";
import { MatchModule } from "src/match/match.module";
import { ChatModule } from "src/chat/chat.module";
import { AppModule } from "src/app.module";
import { UserSignupService } from "./service/user.signup.service";
import { UserMapService } from "./service/user.map.service";
import { RecognizeModule } from "src/recognize/recognize.module";
import { FirebaseModule } from "src/firebase/firebase.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.registerAsync({
      useFactory: multerOptions,
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => MatchModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AppModule),
    forwardRef(() => RecognizeModule),
    forwardRef(() => FirebaseModule),
  ],
  exports: [UserAccountService, UsersRepository],
  controllers: [UsersController],
  providers: [UserAccountService, UserSignupService, UserMapService, UsersRepository],
})
export class UsersModule {}
