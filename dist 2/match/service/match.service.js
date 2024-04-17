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
exports.MatchService = void 0;
const common_1 = require("@nestjs/common");
const match_repository_1 = require("../database/repository/match.repository");
const users_repository_1 = require("../../users/database/repository/users.repository");
const match_entity_1 = require("../database/entity/match.entity");
const recognize_service_1 = require("../../recognize/recognize.service");
const chat_service_1 = require("./../../chat/service/chat.service");
const chat_repository_1 = require("./../../chat/database/repository/chat.repository");
let MatchService = class MatchService {
    constructor(matchRepository, usersRepository, chatsRepository, chatService, recognizeService) {
        this.matchRepository = matchRepository;
        this.usersRepository = usersRepository;
        this.chatsRepository = chatsRepository;
        this.chatService = chatService;
        this.recognizeService = recognizeService;
    }
    async sendLike(receiverNickname, req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const oppUser = await this.usersRepository.findOneByNickname(receiverNickname);
        if (!oppUser) {
            throw new common_1.NotFoundException("상대방은 존재하지 않는 유저 입니다");
        }
        const receiverId = oppUser.id;
        if (receiverId === loggedId) {
            throw new common_1.BadRequestException("본인에게 좋아요를 보낼 수 없습니다");
        }
        const isMatched = await this.matchRepository.isMatchFind(loggedId, receiverId);
        const isChats = await this.chatsRepository.findChatsByUserIds(loggedId, receiverId);
        const findActiveChat = isChats.find((v) => v.status === "OPEN" || v.status === "PENDING");
        if (isMatched.length > 0 || findActiveChat) {
            throw new common_1.BadRequestException(`이미 userId.${oppUser.id}번 상대방 유저에게 좋아요를 보냈습니다`);
        }
        await this.matchRepository.createDevMatch(loggedId, receiverId);
        const newMatchData = await this.matchRepository.createMatch(loggedId, receiverId);
        console.log(user.nickname);
        return {
            matchId: newMatchData.id,
            me: newMatchData.sender.id,
            myNickname: user.nickname,
            receiverId: newMatchData.receiver.id,
            receiverNickname: receiverNickname,
            matchStatus: newMatchData.status,
        };
    }
    async updateMatchStatus(matchId, req, newStatus) {
        const loggedId = req.user.id;
        await this.recognizeService.validateUser(loggedId);
        const devMatch = await this.matchRepository.findOneDevMatchById(matchId);
        const match = await this.matchRepository.findOneMatchById(matchId);
        if (!match) {
            throw new common_1.NotFoundException("매치가 존재하지 않습니다");
        }
        if (match.receiver.id === null || match.sender.id === null) {
            throw new common_1.NotFoundException("해당 유저가 존재하지 않습니다");
        }
        if (match.receiver.id !== loggedId) {
            throw new common_1.BadRequestException("유저 정보가 일치하지 않습니다");
        }
        devMatch.status = newStatus;
        await this.matchRepository.saveDevMatch(devMatch);
        match.status = newStatus;
        const result = await this.matchRepository.saveMatch(match);
        return {
            matchId: result.id,
            matchStatus: result.status,
            senderId: result.sender.id,
            senderNickname: result.sender.nickname,
            myNickname: result.receiver.nickname,
            receiverId: result.receiver.id,
        };
    }
    async matchAccept(matchId, req) {
        const updateMatch = await this.updateMatchStatus(matchId, req, match_entity_1.MatchState.MATCH);
        const chatRoom = await this.chatService.createChatRoom(updateMatch.matchId, updateMatch.senderId, updateMatch.receiverId);
        const acceptUpdateMatch = {
            matchStatus: updateMatch.matchStatus,
            senderId: updateMatch.senderId,
            senderNickname: updateMatch.senderNickname,
            myNickname: updateMatch.myNickname,
        };
        const returnChatRoom = {
            chatRoomId: chatRoom.id,
            chatStatus: chatRoom.status,
            matchId: chatRoom.matchId,
        };
        return {
            match: acceptUpdateMatch,
            chatRoom: returnChatRoom,
        };
    }
    async matchReject(matchId, req) {
        const updateMatch = await this.updateMatchStatus(matchId, req, match_entity_1.MatchState.REJECT);
        const rejectUpdateMatch = {
            matchStatus: updateMatch.matchStatus,
            senderId: updateMatch.senderId,
        };
        return {
            match: rejectUpdateMatch,
        };
    }
};
exports.MatchService = MatchService;
exports.MatchService = MatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [match_repository_1.MatchRepository,
        users_repository_1.UsersRepository,
        chat_repository_1.ChatsRepository,
        chat_service_1.ChatService,
        recognize_service_1.RecognizeService])
], MatchService);
//# sourceMappingURL=match.service.js.map