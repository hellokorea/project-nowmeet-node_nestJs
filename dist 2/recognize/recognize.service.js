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
exports.RecognizeService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../users/database/repository/users.repository");
const jwt = require("jsonwebtoken");
const chat_repository_1 = require("./../chat/database/repository/chat.repository");
let RecognizeService = class RecognizeService {
    constructor(usersRepository, chatsRepository) {
        this.usersRepository = usersRepository;
        this.chatsRepository = chatsRepository;
    }
    async validateUser(id) {
        const user = await this.usersRepository.findOneById(id);
        if (!user)
            throw new common_1.NotFoundException("존재하지 않는 유저 입니다");
        return user;
    }
    async verifyFindChatRoom(chatId, loggedId) {
        const user = await this.usersRepository.findOneById(loggedId);
        if (!user) {
            throw new common_1.NotFoundException("해당 유저가 존재하지 않습니다");
        }
        const findChat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);
        if (!findChat) {
            throw new common_1.NotFoundException("해당 채팅방이 존재하지 않습니다");
        }
        if (findChat.receiverId === null || findChat.senderId === null) {
            throw new common_1.NotFoundException("상대방 유저가 존재하지 않습니다");
        }
        const isUser = await this.chatsRepository.findChatsByUserId(loggedId);
        if (!isUser.length) {
            throw new common_1.BadRequestException("채팅방 내 유저 정보가 존재하지 않습니다");
        }
        return findChat;
    }
    async verifyWebSocketToken(token) {
        if (!token)
            throw new common_1.UnauthorizedException("WebSocket token is missing");
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded !== "object") {
            throw new common_1.UnauthorizedException("WebSocket Invalid token");
        }
        const issuer = decoded.iss;
        if (!issuer)
            throw new common_1.UnauthorizedException("WebSocket Issuer is missing in token");
        let user;
        if (issuer.includes("accounts.google.com")) {
            user = await this.usersRepository.findOneGetByEmail(decoded.email);
        }
        else if (issuer.includes("appleid.apple.com")) {
            user = await this.usersRepository.findOneAppleSub(decoded.sub);
        }
        const result = await this.validateUser(user.id);
        return result;
    }
    async saveFcmToken(id, fcmToken) {
        const user = await this.usersRepository.findOneById(id);
        user.fcmToken = fcmToken;
        await this.usersRepository.saveUser(user);
    }
};
exports.RecognizeService = RecognizeService;
exports.RecognizeService = RecognizeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        chat_repository_1.ChatsRepository])
], RecognizeService);
//# sourceMappingURL=recognize.service.js.map