// typeorm-config.service.ts

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { User } from "./users/database/entity/users.entity";
import { Match } from "./match/database/entity/match.entity";
import { DevMatch } from "./match/database/entity/match.dev.entity";
import { ChatRoom } from "./chat/database/entity/chat.entity";
import { DevChatRoom } from "./chat/database/entity/chat.dev.entity";
import { ChatMessage } from "./chat/database/entity/chat.message.entity";

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  private DELAY_TIME = 800;

  constructor(private configService: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    try {
      const isDevMode = process.env.MODE === "dev";
      const hostKey = isDevMode ? "DB_DEV_HOST" : "DB_PROD_HOST";
      const hostDb = isDevMode ? "DB_DEV_DATABASE" : "DB_PROD_DATABASE";

      return new Promise((res) => {
        setTimeout(() => {
          res({
            type: "mysql",
            host: this.configService.get<string>(hostKey),
            port: this.configService.get<number>("DB_PORT"),
            username: this.configService.get<string>("DB_USERNAME"),
            password: this.configService.get<string>("DB_PASSWORD"),
            database: this.configService.get<string>(hostDb),
            entities: [User, Match, DevMatch, ChatRoom, DevChatRoom, ChatMessage],
            synchronize: true, // 개발 환경에서만 true로 설정
            logging: ["query", "error"],
          });
        }, this.DELAY_TIME);
      });
    } catch (e) {
      console.error(e);

      throw new InternalServerErrorException("DB Connect Failed");
    }
  }
}
