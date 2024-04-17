"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchModule = void 0;
const common_1 = require("@nestjs/common");
const match_controller_1 = require("./controller/match.controller");
const match_service_1 = require("./service/match.service");
const typeorm_1 = require("@nestjs/typeorm");
const match_entity_1 = require("./database/entity/match.entity");
const users_module_1 = require("../users/users.module");
const match_repository_1 = require("./database/repository/match.repository");
const chat_module_1 = require("../chat/chat.module");
const match_dev_entity_1 = require("./database/entity/match.dev.entity");
const app_module_1 = require("../app.module");
const auth_module_1 = require("../auth/auth.module");
const match_profile_service_1 = require("./service/match.profile.service");
const match_chat_service_1 = require("./service/match.chat.service");
const match_chat_box_service_1 = require("./service/match.chat.box.service");
const recognize_module_1 = require("../recognize/recognize.module");
const redis_module_1 = require("../redis/redis.module");
let MatchModule = class MatchModule {
};
exports.MatchModule = MatchModule;
exports.MatchModule = MatchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([match_entity_1.Match, match_dev_entity_1.DevMatch]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => chat_module_1.ChatModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => recognize_module_1.RecognizeModule),
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
            (0, common_1.forwardRef)(() => redis_module_1.RedisModule),
        ],
        exports: [match_service_1.MatchService, match_profile_service_1.MatchProfileService, match_repository_1.MatchRepository],
        controllers: [match_controller_1.MatchController],
        providers: [match_service_1.MatchService, match_profile_service_1.MatchProfileService, match_chat_service_1.MatchChatService, match_chat_box_service_1.MatchBoxService, match_repository_1.MatchRepository],
    })
], MatchModule);
//# sourceMappingURL=match.module.js.map