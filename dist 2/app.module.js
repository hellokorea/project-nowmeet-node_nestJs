"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const typeorm_1 = require("@nestjs/typeorm");
const logging_middleware_1 = require("./common/middleware/logging.middleware");
const match_module_1 = require("./match/match.module");
const chat_module_1 = require("./chat/chat.module");
const aws_service_1 = require("./aws.service");
const schedule_1 = require("@nestjs/schedule");
const in_app_module_1 = require("./in-app/in-app.module");
const schedule_module_1 = require("./schedule/schedule.module");
const recognize_module_1 = require("./recognize/recognize.module");
const firebase_module_1 = require("./firebase/firebase.module");
const database_config_service_1 = require("./database.config.service");
const ioredis_1 = require("@nestjs-modules/ioredis");
const redis_config_service_1 = require("./redis.config.service");
const redis_module_1 = require("./redis/redis.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logging_middleware_1.LoggerMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: database_config_service_1.DatabaseConfigService,
                inject: [config_1.ConfigService],
            }),
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: redis_config_service_1.RedisConfigService,
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            match_module_1.MatchModule,
            chat_module_1.ChatModule,
            in_app_module_1.InAppModule,
            schedule_module_1.ScheduleSearchModule,
            recognize_module_1.RecognizeModule,
            schedule_1.ScheduleModule.forRoot(),
            firebase_module_1.FirebaseModule,
            redis_module_1.RedisModule,
        ],
        exports: [aws_service_1.AwsService],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, aws_service_1.AwsService, database_config_service_1.DatabaseConfigService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map