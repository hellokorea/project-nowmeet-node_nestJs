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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
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
  providers: [AppService, AwsService, DatabaseConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
