import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { LoggerMiddleware } from "./common/middleware/logging.middleware";
import { User } from "./users/entity/users.entity";
import { MatchModule } from "./match/match.module";
import { Match } from "./match/entity/match.entity";
import { ChatModule } from "./chat/chat.module";
import { ChatRoom } from "./chat/entity/chats.entity";
import { ChatMessage } from "./chat/entity/chatmessage.entity";
import { DevMatch } from "./match/entity/devmatch.entity";
import { DevChatRoom } from "./chat/entity/devchats.entity";
import { AwsService } from "./aws.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        return {
          type: "mysql",
          host: configService.getOrThrow("DB_HOST"),
          port: configService.getOrThrow("DB_PORT"),
          username: configService.getOrThrow("DB_USERNAME"),
          password: configService.getOrThrow("DB_PASSWORD"),
          database: configService.getOrThrow("DB_DATABASE"),
          entities: [User, Match, DevMatch, ChatRoom, DevChatRoom, ChatMessage],
          synchronize: true, // prob - false
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MatchModule,
    ChatModule,
  ],
  exports: [AwsService],
  controllers: [AppController],
  providers: [AppService, AwsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
