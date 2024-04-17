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
exports.MatchProfileService = void 0;
const common_1 = require("@nestjs/common");
const chat_entity_1 = require("../../chat/database/entity/chat.entity");
const user_profile_dto_1 = require("../../users/dtos/response/user.profile.dto");
const match_entity_1 = require("../database/entity/match.entity");
const match_repository_1 = require("../database/repository/match.repository");
const aws_service_1 = require("../../aws.service");
const users_repository_1 = require("../../users/database/repository/users.repository");
const recognize_service_1 = require("../../recognize/recognize.service");
const chat_repository_1 = require("./../../chat/database/repository/chat.repository");
let MatchProfileService = class MatchProfileService {
    constructor(usersRepository, matchRepository, chatsRepository, awsService, recognizeService) {
        this.usersRepository = usersRepository;
        this.matchRepository = matchRepository;
        this.chatsRepository = chatsRepository;
        this.awsService = awsService;
        this.recognizeService = recognizeService;
    }
    async getUserProfile(nickname, req) {
        const loggedId = req.user.id;
        await this.recognizeService.validateUser(loggedId);
        const oppUser = await this.usersRepository.findOneByNickname(nickname);
        if (!oppUser) {
            throw new common_1.NotFoundException("존재하지 않는 유저 입니다");
        }
        const oppUserId = oppUser.id;
        if (oppUser.id === loggedId) {
            throw new common_1.BadRequestException("본인 프로필 조회 불가");
        }
        const userInfo = new user_profile_dto_1.UserProfileResponseDto(oppUser);
        const oppUserMatchStatus = await this.getMatchStatus(oppUserId, loggedId);
        const preSignedUrl = await this.awsService.createPreSignedUrl(oppUser.profileImages);
        return {
            user: userInfo,
            matchStatus: oppUserMatchStatus,
            PreSignedUrl: preSignedUrl,
        };
    }
    async getMatchStatus(oppUserId, loggedId) {
        const isMatch = await this.matchRepository.findOneMatchByUserIds(oppUserId, loggedId);
        const isChats = await this.chatsRepository.findChatsByUserIds(oppUserId, loggedId);
        let matchStatus = isMatch ? isMatch.status : null;
        if (!matchStatus) {
            const openOrPendingChat = isChats.find((v) => v.status === chat_entity_1.ChatState.OPEN || v.status === chat_entity_1.ChatState.PENDING);
            if (openOrPendingChat) {
                matchStatus = match_entity_1.MatchState.MATCH;
            }
        }
        return matchStatus;
    }
};
exports.MatchProfileService = MatchProfileService;
exports.MatchProfileService = MatchProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        match_repository_1.MatchRepository,
        chat_repository_1.ChatsRepository,
        aws_service_1.AwsService,
        recognize_service_1.RecognizeService])
], MatchProfileService);
//# sourceMappingURL=match.profile.service.js.map