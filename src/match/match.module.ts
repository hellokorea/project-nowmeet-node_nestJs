import { Module, forwardRef } from "@nestjs/common";
import { MatchController } from "./controller/match.controller";
import { MatchService } from "./service/match.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from "./entity/match.entity";
import { UsersModule } from "src/users/users.module";
import { MatchRepository } from "./match.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Match]), forwardRef(() => UsersModule)],
  exports: [MatchService],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository],
})
export class MatchModule {}
