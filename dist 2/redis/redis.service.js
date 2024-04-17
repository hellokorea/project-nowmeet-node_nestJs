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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = require("ioredis");
const chat_entity_1 = require("../chat/database/entity/chat.entity");
const chat_repository_1 = require("../chat/database/repository/chat.repository");
let RedisService = class RedisService {
    constructor(redis, chatsRepository) {
        this.redis = redis;
        this.chatsRepository = chatsRepository;
        this.PROD_TIME = 24 * 60 * 60 * 1000;
        this.TEST_TIME = 120;
        this.subscriber = new ioredis_2.default();
        this.publisher = redis;
    }
    async onModuleInit() {
        const messageHandler = {
            "__keyevent@0__:expired": this.handlerSubChatExpire,
        };
        this.publisher.config("SET", "notify-keyspace-events", "Ex");
        this.subscriber.subscribe("__keyevent@0__:expired");
        this.subscriber.on("message", async (channel, message) => {
            const handler = messageHandler[channel];
            if (handler) {
                await handler.call(this, message);
            }
        });
    }
    async handlerSubChatExpire(message) {
        const chatId = parseInt(message.split(":")[1]);
        const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);
        try {
            if (chat.status === chat_entity_1.ChatState.PENDING) {
                if (chat) {
                    chat.status = chat_entity_1.ChatState.EXPIRE_END;
                    await this.chatsRepository.saveChatData(chat);
                    console.log("expire end로 변경 완료!");
                }
            }
            if (chat.status === chat_entity_1.ChatState.OPEN) {
                if (chat) {
                    chat.status = chat_entity_1.ChatState.DISCONNECT_END;
                    await this.chatsRepository.saveChatData(chat);
                    console.log("disconnect 로 변경 완료!");
                }
            }
            return;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException("레디스 Expire 구독에 실패 했습니다.");
        }
    }
    async publishChatStatus(chatId, status) {
        const key = `chat:${chatId}`;
        try {
            await this.redis.setex(key, this.TEST_TIME, status);
            console.log("레디스 키 세팅 :", key, status, this.TEST_TIME);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException("publishChatStatus 실패", e);
        }
    }
    async deleteChatKey(chatId) {
        const key = `chat:${chatId}`;
        await this.redis.del(key);
        console.log("삭제 된 redis chatId :", key);
        return;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [ioredis_2.default,
        chat_repository_1.ChatsRepository])
], RedisService);
//# sourceMappingURL=redis.service.js.map