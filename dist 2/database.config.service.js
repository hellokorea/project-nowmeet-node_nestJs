"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_entity_1 = require("./users/database/entity/users.entity");
const match_entity_1 = require("./match/database/entity/match.entity");
const match_dev_entity_1 = require("./match/database/entity/match.dev.entity");
const chat_entity_1 = require("./chat/database/entity/chat.entity");
const chat_dev_entity_1 = require("./chat/database/entity/chat.dev.entity");
const chat_message_entity_1 = require("./chat/database/entity/chat.message.entity");
let DatabaseConfigService = class DatabaseConfigService {
    constructor(configService) {
        this.configService = configService;
        this.DELAY_TIME = 800;
    }
    async createTypeOrmOptions() {
        try {
            const isDevMode = process.env.MODE === "dev";
            const hostKey = isDevMode ? "DB_DEV_HOST" : "DB_PROD_HOST";
            const hostDb = isDevMode ? "DB_DEV_DATABASE" : "DB_PROD_DATABASE";
            return new Promise((res) => {
                setTimeout(() => {
                    res({
                        type: "mysql",
                        host: this.configService.get(hostKey),
                        port: this.configService.get("DB_PORT"),
                        username: this.configService.get("DB_USERNAME"),
                        password: this.configService.get("DB_PASSWORD"),
                        database: this.configService.get(hostDb),
                        entities: [users_entity_1.User, match_entity_1.Match, match_dev_entity_1.DevMatch, chat_entity_1.ChatRoom, chat_dev_entity_1.DevChatRoom, chat_message_entity_1.ChatMessage],
                        synchronize: true,
                    });
                }, this.DELAY_TIME);
            });
        }
        catch (e) {
            console.error(e);
            throw new common_1.InternalServerErrorException("DB Connect Failed");
        }
    }
};
exports.DatabaseConfigService = DatabaseConfigService;
exports.DatabaseConfigService = DatabaseConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfigService);
//# sourceMappingURL=database.config.service.js.map