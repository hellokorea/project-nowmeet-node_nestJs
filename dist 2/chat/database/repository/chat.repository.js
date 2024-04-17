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
exports.ChatsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_entity_1 = require("../entity/chat.entity");
const typeorm_2 = require("typeorm");
const chat_dev_entity_1 = require("../entity/chat.dev.entity");
const moment = require("moment");
let ChatsRepository = class ChatsRepository {
    constructor(chatsRoomRepository, devChatsRoomRepository) {
        this.chatsRoomRepository = chatsRoomRepository;
        this.devChatsRoomRepository = devChatsRoomRepository;
    }
    async findChatsByUserId(userId) {
        const chats = await this.chatsRoomRepository.find({
            where: [{ senderId: userId }, { receiverId: userId }],
            relations: ["message"],
        });
        return chats;
    }
    async findChatsByUserIds(profileId, loggedId) {
        const option = {
            where: [
                { senderId: loggedId, receiverId: profileId },
                { senderId: profileId, receiverId: loggedId },
            ],
        };
        return await this.chatsRoomRepository.find(option);
    }
    async findOneChatRoomsByChatId(chatId) {
        return await this.chatsRoomRepository.findOne({ where: { id: chatId }, relations: ["message"] });
    }
    async findOneChatRoomsByMatchId(matchId) {
        return await this.chatsRoomRepository.findOne({ where: { matchId: matchId } });
    }
    async findExpireChats() {
        const currentKoreaTime = moment().tz("Asia/Seoul").toDate();
        return this.chatsRoomRepository.find({
            where: {
                expireTime: (0, typeorm_2.LessThan)(currentKoreaTime),
                status: "PENDING",
            },
        });
    }
    async findDisconnectChats() {
        const currentKoreaTime = moment().tz("Asia/Seoul").toDate();
        return this.chatsRoomRepository.find({ where: { disconnectTime: (0, typeorm_2.LessThan)(currentKoreaTime), status: "OPEN" } });
    }
    async createChatRoom(matchId, senderId, receiverId, expireTime) {
        return this.chatsRoomRepository.create({
            matchId,
            senderId,
            receiverId,
            expireTime,
        });
    }
    async saveChatData(chat) {
        return this.chatsRoomRepository.save(chat);
    }
    async removeChatRoom(chat) {
        return await this.chatsRoomRepository.remove(chat);
    }
    async findOneDevChatRoomsByMatchId(matchId) {
        return await this.devChatsRoomRepository.findOne({ where: { matchId: matchId } });
    }
    async saveDevChatData(chat) {
        return this.devChatsRoomRepository.save(chat);
    }
    async createDevChatRoom(matchId, senderId, receiverId) {
        return this.chatsRoomRepository.create({
            matchId: matchId,
            senderId: senderId,
            receiverId: receiverId,
        });
    }
    async deleteChatDataByUserId(txManager, userId) {
        const chatsRoomRepository = txManager.getRepository(chat_entity_1.ChatRoom);
        const chats = await chatsRoomRepository.find({
            where: [{ senderId: userId }, { receiverId: userId }],
        });
        await chatsRoomRepository.remove(chats);
    }
    async deleteDevChatDataByUserId(txManager, userId) {
        const devChatsRoomRepository = txManager.getRepository(chat_dev_entity_1.DevChatRoom);
        const chats = await devChatsRoomRepository.find({
            where: [{ senderId: userId }, { receiverId: userId }],
        });
        await devChatsRoomRepository.remove(chats);
    }
};
exports.ChatsRepository = ChatsRepository;
exports.ChatsRepository = ChatsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.ChatRoom)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_dev_entity_1.DevChatRoom)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatsRepository);
//# sourceMappingURL=chat.repository.js.map