"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const chat_entity_1 = require("./database/entity/chat.entity");
const typeorm_1 = require("@nestjs/typeorm");
const chat_gateway_1 = require("./gateway/chat.gateway");
const chat_message_entity_1 = require("./database/entity/chat.message.entity");
const users_module_1 = require("../users/users.module");
const chat_dev_entity_1 = require("./database/entity/chat.dev.entity");
const auth_module_1 = require("../auth/auth.module");
const match_module_1 = require("../match/match.module");
const recognize_module_1 = require("../recognize/recognize.module");
const chat_status_update_service_1 = require("./service/chat.status.update.service");
const chat_service_1 = require("./service/chat.service");
const chat_message_repository_1 = require("./database/repository/chat.message.repository");
const chat_repository_1 = require("./database/repository/chat.repository");
const redis_module_1 = require("../redis/redis.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([chat_entity_1.ChatRoom, chat_dev_entity_1.DevChatRoom, chat_message_entity_1.ChatMessage]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => match_module_1.MatchModule),
            (0, common_1.forwardRef)(() => recognize_module_1.RecognizeModule),
            (0, common_1.forwardRef)(() => redis_module_1.RedisModule),
        ],
        exports: [chat_status_update_service_1.ChatStatusUpdaterService, chat_service_1.ChatService, chat_message_repository_1.ChatMessagesRepository, chat_repository_1.ChatsRepository],
        controllers: [],
        providers: [chat_gateway_1.ChatGateway, chat_status_update_service_1.ChatStatusUpdaterService, chat_service_1.ChatService, chat_message_repository_1.ChatMessagesRepository, chat_repository_1.ChatsRepository],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map