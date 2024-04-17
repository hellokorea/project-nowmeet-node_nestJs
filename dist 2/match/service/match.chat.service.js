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
exports.MatchChatService = void 0;
const common_1 = require("@nestjs/common");
const chat_entity_1 = require("../../chat/database/entity/chat.entity");
const users_repository_1 = require("../../users/database/repository/users.repository");
const recognize_service_1 = require("../../recognize/recognize.service");
const moment = require("moment");
const aws_service_1 = require("../../aws.service");
const chat_service_1 = require("./../../chat/service/chat.service");
const chat_repository_1 = require("./../../chat/database/repository/chat.repository");
const chat_message_repository_1 = require("./../../chat/database/repository/chat.message.repository");
const redis_service_1 = require("../../redis/redis.service");
let MatchChatService = class MatchChatService {
    constructor(usersRepository, chatsRepository, chatMessagesRepository, chatService, recognizeService, awsService, redisService) {
        this.usersRepository = usersRepository;
        this.chatsRepository = chatsRepository;
        this.chatMessagesRepository = chatMessagesRepository;
        this.chatService = chatService;
        this.recognizeService = recognizeService;
        this.awsService = awsService;
        this.redisService = redisService;
    }
    async getChatRoomsAllList(req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const findChats = await this.chatsRepository.findChatsByUserId(user.id);
        if (!findChats.length) {
            return null;
        }
        const chatListFilter = findChats.filter((chat) => {
            return ((loggedId === chat.senderId && chat.status !== chat_entity_1.ChatState.SENDER_EXIT) ||
                (loggedId === chat.receiverId && chat.status !== chat_entity_1.ChatState.RECEIVER_EXIT));
        });
        const chatListPromises = chatListFilter.map(async (chat) => {
            let me;
            let matchUserId;
            if (loggedId === chat.receiverId || loggedId === chat.senderId) {
                me = loggedId;
                matchUserId = loggedId === chat.receiverId ? chat.senderId : chat.receiverId;
            }
            const oppUser = await this.usersRepository.findOneById(matchUserId);
            const preSignedUrl = await this.awsService.createPreSignedUrl(oppUser.profileImages);
            let lastMessageData = await this.chatMessagesRepository.findOneLastMessage(chat.id);
            let lastMessage;
            if (!lastMessageData) {
                lastMessage = "";
            }
            else {
                lastMessage = lastMessageData.content;
            }
            return {
                chatId: chat.id,
                matchId: chat.matchId,
                me,
                matchUserId,
                lastMessage: lastMessage,
                matchUserNickname: oppUser.nickname,
                chatStatus: chat.status,
                preSignedUrl,
            };
        });
        const chatList = await Promise.all(chatListPromises);
        return chatList;
    }
    async getUserChatRoom(chatId, req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const findChat = await this.recognizeService.verifyFindChatRoom(chatId, loggedId);
        let chathUserId;
        loggedId === findChat.receiverId ? (chathUserId = findChat.senderId) : (chathUserId = findChat.receiverId);
        const opponentUser = await this.usersRepository.findOneById(chathUserId);
        const preSignedUrl = await this.awsService.createPreSignedUrl(opponentUser.profileImages);
        const expireTime = moment(findChat.expireTime).format("YYYY-MM-DD HH:mm:ss");
        const disconnectTime = moment(findChat.disconnectTime).format("YYYY-MM-DD HH:mm:ss");
        const messagesArray = await this.chatMessagesRepository.findChatMsgByChatId(findChat.id);
        const message = messagesArray.map((msg) => {
            return {
                id: msg.id,
                roomId: msg.chatRoom.id,
                content: msg.content,
                senderId: msg.sender.id,
                senderNickname: msg.sender.nickname,
                createdAt: moment(msg.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            };
        });
        const chatUserData = {
            id: findChat.id,
            matchId: findChat.matchId,
            chatStatus: findChat.status,
            message,
            chathUserId,
            chatUserNickname: opponentUser.nickname,
            myNickname: user.nickname,
            preSignedUrl,
        };
        let chatTime = findChat.status === chat_entity_1.ChatState.PENDING ? expireTime : disconnectTime;
        return {
            chatUserData,
            chatTime,
        };
    }
    async openChatRoom(chatId, req) {
        const loggedId = req.user.id;
        const findChat = await this.recognizeService.verifyFindChatRoom(chatId, loggedId);
        if (findChat.status === chat_entity_1.ChatState.OPEN) {
            throw new common_1.BadRequestException("이미 해당 채팅방은 오픈이 되어 있는 상태입니다.");
        }
        else if (findChat.status === chat_entity_1.ChatState.DISCONNECT_END ||
            findChat.status === chat_entity_1.ChatState.EXPIRE_END ||
            findChat.status === chat_entity_1.ChatState.RECEIVER_EXIT ||
            findChat.status === chat_entity_1.ChatState.SENDER_EXIT) {
            throw new common_1.BadRequestException(`채팅방 상태가 ${findChat.status} 상태이므로 오픈 할 수 없는 상태입니다.`);
        }
        try {
            const openStatusChatRoom = await this.chatService.openChat(findChat.matchId);
            return {
                chatId: openStatusChatRoom.id,
                matchId: openStatusChatRoom.matchId,
                chatStatus: openStatusChatRoom.status,
                disconnectTime: openStatusChatRoom.disconnectTime,
            };
        }
        catch (e) {
            console.error("openChatRoom :", e);
            throw new common_1.BadRequestException("채팅방 오픈에 실패했습니다.");
        }
    }
    async exitChatRoom(chatId, req) {
        const loggedId = req.user.id;
        const currentUser = await this.usersRepository.findOneById(loggedId);
        const chat = await this.recognizeService.verifyFindChatRoom(chatId, currentUser.id);
        if (chat.status === chat_entity_1.ChatState.SENDER_EXIT || chat.status === chat_entity_1.ChatState.RECEIVER_EXIT) {
            throw new common_1.BadRequestException("이미 나간 채팅방 입니다.");
        }
        try {
            currentUser.id === chat.senderId
                ? (chat.status = chat_entity_1.ChatState.SENDER_EXIT)
                : (chat.status = chat_entity_1.ChatState.RECEIVER_EXIT);
            await this.chatsRepository.saveChatData(chat);
            await this.redisService.deleteChatKey(chat.id);
            return {
                message: `nickname : ${currentUser.nickname} 유저가 채팅방을 나가 chatId : ${chatId}번  채팅이 종료 되었습니다. `,
            };
        }
        catch (e) {
            console.error("exitChatRoom :", e);
            throw new common_1.BadRequestException("채팅방 나가는 도중 문제가 발생했습니다.");
        }
    }
    async deleteChatRoom(chatId, req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const chat = await this.recognizeService.verifyFindChatRoom(chatId, user.id);
        try {
            await this.chatService.removeUserChatRoom(chat.id);
            return {
                message: `matchId : ${chat.matchId}번으로 이루어진 chatId: ${chat.id}번이 삭제 되었습니다.`,
            };
        }
        catch (e) {
            console.error("deleteChatRoom :", e);
            throw new common_1.BadRequestException("채팅방 삭제에 실패했습니다.");
        }
    }
};
exports.MatchChatService = MatchChatService;
exports.MatchChatService = MatchChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        chat_repository_1.ChatsRepository,
        chat_message_repository_1.ChatMessagesRepository,
        chat_service_1.ChatService,
        recognize_service_1.RecognizeService,
        aws_service_1.AwsService,
        redis_service_1.RedisService])
], MatchChatService);
//# sourceMappingURL=match.chat.service.js.map