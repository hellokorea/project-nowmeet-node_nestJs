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
          entities: [User, Match],
          synchronize: true, // prob - false
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MatchModule,
  ],
  exports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // private readonly isDev: boolean = process.env.MODE === "dev" ? true : false;
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*"); //all endPoint
  }
}