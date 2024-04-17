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
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const fcmAdmin = require("firebase-admin");
const firebase_push_dto_1 = require("../dtos/firebase.push.dto");
const path = require("path");
const fs = require("fs");
const users_repository_1 = require("../../users/database/repository/users.repository");
let PushService = class PushService {
    onModuleInit() {
        const isDevMode = process.env.MODE === "dev";
        let keyPath;
        let firebaseAccount;
        if (isDevMode) {
            keyPath = path.join("/Users", "gimjeongdong", "Desktop", "now-meet-backend", "FirebaseAdminKey.json");
            firebaseAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
        }
        else {
            keyPath = process.env.firebaseAccount;
            firebaseAccount = require(keyPath);
        }
        this.fcm = fcmAdmin.initializeApp({
            credential: fcmAdmin.credential.cert(firebaseAccount),
        });
    }
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async sendPushNotification(body) {
        const { title, message, nickname, screenName, chatId, senderNickname } = body;
        try {
            const user = await this.usersRepository.findOneByNickname(nickname);
            const commonPayload = {
                notification: {
                    title: title,
                    body: message,
                },
                data: {
                    screenName,
                    nickname,
                },
                token: user.fcmToken,
            };
            const chatPayload = {
                notification: {
                    title: title,
                    body: message,
                },
                data: {
                    screenName,
                    nickname,
                    ...(chatId && { chatId: chatId.toString() }),
                    ...(senderNickname && { senderNickname }),
                },
                token: user.fcmToken,
            };
            if (chatId) {
                await this.fcm.messaging().send(chatPayload);
            }
            else {
                await this.fcm.messaging().send(commonPayload);
            }
        }
        catch (e) {
            console.error(e);
            throw new common_1.InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
        }
    }
};
exports.PushService = PushService;
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [firebase_push_dto_1.ReqPushNotificationDto]),
    __metadata("design:returntype", Promise)
], PushService.prototype, "sendPushNotification", null);
exports.PushService = PushService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], PushService);
//# sourceMappingURL=firebase.push.service.js.map