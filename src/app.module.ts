import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerMiddleware } from "./common/middleware/logging.middleware";
import { MatchModule } from "./match/match.module";
import { ChatModule } from "./chat/chat.module";
import { AwsService } from "./aws.service";
import { ScheduleModule } from "@nestjs/schedule";
import { InAppModule } from "./in-app/in-app.module";
import { ScheduleSearchModule } from "./schedule/schedule.module";
import { RecognizeModule } from "./recognize/recognize.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { DatabaseConfigService } from "./database.config.service";
import { RedisModule as CustomRedisModule } from "@nestjs-modules/ioredis";
import { RedisConfigService } from "./redis.config.service";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
      inject: [ConfigService],
    }),
    CustomRedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
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
    RedisModule,
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
