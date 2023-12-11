import { Module, forwardRef } from "@nestjs/common";
import { UsersController } from "./controllers/users.controller";
import { UsersService } from "./service/users.service";
import { UsersRepository } from "./users.repository";
import { AuthModule } from "src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/users.entity";
import { MulterModule } from "@nestjs/platform-express";
import { multerOptions } from "src/common/utils/multer.options";
import { MatchModule } from "src/match/match.module";
import { ChatModule } from "src/chat/chat.module";
import { AppModule } from "src/app.module";

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
  ],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
