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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const chat_repository_1 = require("../database/repository/chat.repository");
const chat_message_repository_1 = require("../database/repository/chat.message.repository");
const moment = require("moment");
const chat_entity_1 = require("../database/entity/chat.entity");
const redis_service_1 = require("../../redis/redis.service");
let ChatService = class ChatService {
    constructor(chatsRepository, chatMessagesRepository, redisService) {
        this.chatsRepository = chatsRepository;
        this.chatMessagesRepository = chatMessagesRepository;
        this.redisService = redisService;
        this.PROD_TIMER = 24 * 60 * 60 * 1000;
        this.TEST_TIMER = 60 * 1000;
    }
    async createChatRoom(matchId, senderId, receiverId) {
        const findChat = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);
        if (findChat) {
            throw new common_1.BadRequestException("이미 해당 매칭의 채팅방이 존재합니다");
        }
        const expireTime = moment().add(this.PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();
        const createChatRoom = await this.chatsRepository.createChatRoom(matchId, senderId, receiverId, expireTime);
        const createDevChatRoom = await this.chatsRepository.createDevChatRoom(matchId, senderId, receiverId);
        const newChatRooms = await this.chatsRepository.saveChatData(createChatRoom);
        await this.chatsRepository.saveDevChatData(createDevChatRoom);
        await this.redisService.publishChatStatus(newChatRooms.id, newChatRooms.status);
        return newChatRooms;
    }
    async openChat(matchId) {
        const chatRoom = await this.chatsRepository.findOneChatRoomsByMatchId(matchId);
        chatRoom.disconnectTime = moment().add(this.PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();
        chatRoom.status = chat_entity_1.ChatState.OPEN;
        const openChatRoom = await this.chatsRepository.saveChatData(chatRoom);
        const devChatRoom = await this.chatsRepository.findOneDevChatRoomsByMatchId(matchId);
        devChatRoom.status = chat_entity_1.ChatState.OPEN;
        await this.chatsRepository.saveDevChatData(devChatRoom);
        await this.redisService.publishChatStatus(openChatRoom.id, openChatRoom.status);
        return openChatRoom;
    }
    async removeUserChatRoom(chatId) {
        try {
            const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);
            const chatMsg = await this.chatMessagesRepository.findChatMsgByChatId(chatId);
            if (!chat) {
                throw new common_1.NotFoundException("삭제할 채팅방이 존재하지 않습니다.");
            }
            await this.chatMessagesRepository.removeChatMessage(chatMsg);
            await this.chatsRepository.removeChatRoom(chat);
            return;
        }
        catch (e) {
            console.error("removeUserChatRoom :", e);
            throw new common_1.BadRequestException("채팅방 삭제 도중 문제가 발생했습니다.");
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_repository_1.ChatsRepository,
        chat_message_repository_1.ChatMessagesRepository,
        redis_service_1.RedisService])
], ChatService);
//# sourceMappingURL=chat.service.js.map