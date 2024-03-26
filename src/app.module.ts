import { BadRequestException, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { LoggerMiddleware } from "./common/middleware/logging.middleware";
import { User } from "./users/database/entity/users.entity";
import { MatchModule } from "./match/match.module";
import { Match } from "./match/database/entity/match.entity";
import { ChatModule } from "./chat/chat.module";
import { ChatRoom } from "./chat/database/entity/chat.entity";
import { ChatMessage } from "./chat/database/entity/chat.message.entity";
import { DevMatch } from "./match/database/entity/match.dev.entity";
import { DevChatRoom } from "./chat/database/entity/chat.dev.entity";
import { AwsService } from "./aws.service";
import { ScheduleModule } from "@nestjs/schedule";
import { InAppModule } from "./in-app/in-app.module";
import { ScheduleSearchModule } from "./schedule/schedule.module";
import { RecognizeModule } from "./recognize/recognize.module";
import { FirebaseModule } from "./firebase/firebase.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        return new Promise((res, rej) => {
          setTimeout(async () => {
            try {
              const isDevMode = process.env.MODE === "dev";
              const hostKey = isDevMode ? "DB_DEV_HOST" : "DB_PROD_HOST";
              const hostDb = isDevMode ? "DB_DEV_DATABASE" : "DB_PROD_DATABASE";

              res({
                type: "mysql",
                host: configService.getOrThrow(hostKey),
                port: configService.getOrThrow("DB_PORT"),
                username: configService.getOrThrow("DB_USERNAME"),
                password: configService.getOrThrow("DB_PASSWORD"),
                database: configService.getOrThrow(hostDb),
                entities: [User, Match, DevMatch, ChatRoom, DevChatRoom, ChatMessage],
                synchronize: true, //^ TODO: prod => false
              });
            } catch (e) {
              console.error("ConfigModule :", e);
              rej(new BadRequestException(`db 연결에 실패했습니다.`));
            }
          }, 3000);
        });
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MatchModule,
    ChatModule,
    InAppModule,
    ScheduleSearchModule,
    RecognizeModule,
    ScheduleModule.forRoot(),
    FirebaseModule,
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
