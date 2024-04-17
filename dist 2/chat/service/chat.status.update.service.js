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
exports.ChatStatusUpdaterService = void 0;
const common_1 = require("@nestjs/common");
const chat_repository_1 = require("../database/repository/chat.repository");
const chat_entity_1 = require("../database/entity/chat.entity");
let ChatStatusUpdaterService = class ChatStatusUpdaterService {
    constructor(chatsRepository) {
        this.chatsRepository = chatsRepository;
    }
    async onModuleInit() {
        const expireChats = await this.chatsRepository.findExpireChats();
        const disconnectChats = await this.chatsRepository.findDisconnectChats();
        try {
            await Promise.all(expireChats.map(async (chat) => {
                chat.status = chat_entity_1.ChatState.EXPIRE_END;
                await this.chatsRepository.saveChatData(chat);
            }));
            await Promise.all(disconnectChats.map(async (chat) => {
                chat.status = chat_entity_1.ChatState.DISCONNECT_END;
                await this.chatsRepository.saveChatData(chat);
            }));
            return;
        }
        catch (e) {
            throw new common_1.NotFoundException("만료 된 채팅 데이터 변경 도중 문제가 발생 했습니다.");
        }
    }
};
exports.ChatStatusUpdaterService = ChatStatusUpdaterService;
exports.ChatStatusUpdaterService = ChatStatusUpdaterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_repository_1.ChatsRepository])
], ChatStatusUpdaterService);
//# sourceMappingURL=chat.status.update.service.js.map