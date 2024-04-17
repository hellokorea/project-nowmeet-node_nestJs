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
exports.MatchBoxService = void 0;
const common_1 = require("@nestjs/common");
const match_entity_1 = require("../database/entity/match.entity");
const moment = require("moment");
const match_repository_1 = require("../database/repository/match.repository");
const aws_service_1 = require("../../aws.service");
const recognize_service_1 = require("../../recognize/recognize.service");
let MatchBoxService = class MatchBoxService {
    constructor(recognizeService, matchRepository, awsService) {
        this.recognizeService = recognizeService;
        this.matchRepository = matchRepository;
        this.awsService = awsService;
    }
    async getLikeSendBox(req) {
        const loggedId = req.user.id;
        await this.recognizeService.validateUser(loggedId);
        const matched = await this.matchRepository.getSendMatches(loggedId);
        if (!matched.length) {
            return null;
        }
        const receiverProfiles = matched.map((data) => data.receiver.profileImages);
        const preSignedUrl = await this.awsService.createPreSignedUrl(receiverProfiles.flat());
        const sendBox = matched
            .filter((matchData) => matchData.status !== match_entity_1.MatchState.MATCH && matchData.status !== match_entity_1.MatchState.EXPIRE)
            .map((matchData) => ({
            matchId: matchData.id,
            matchStatus: matchData.status,
            receiverId: matchData.receiver.id,
            receiverNickname: matchData.receiver.nickname,
            expireMatch: moment(matchData.expireMatch).format("YYYY-MM-DD HH:mm:ss"),
            profileImages: {
                ProfileImages: matchData.receiver.profileImages,
                PreSignedUrl: preSignedUrl,
            },
        }));
        if (!sendBox.length) {
            return null;
        }
        return sendBox;
    }
    async getLikeReceiveBox(req) {
        const loggedId = req.user.id;
        await this.recognizeService.validateUser(loggedId);
        const matched = await this.matchRepository.getReceiveMatches(loggedId);
        if (!matched.length) {
            return null;
        }
        const senderProfiles = matched.map((data) => data.sender.profileImages);
        const preSignedUrl = await this.awsService.createPreSignedUrl(senderProfiles.flat());
        const receiveBox = matched
            .filter((matchData) => matchData.status === match_entity_1.MatchState.PENDING)
            .map((matchData) => ({
            matchId: matchData.id,
            matchStatus: matchData.status,
            senderId: matchData.sender.id,
            senderNickname: matchData.sender.nickname,
            expireMatch: moment(matchData.expireMatch).format("YYYY-MM-DD HH:mm:ss"),
            profileImages: {
                ProfileImages: matchData.sender.profileImages,
                PreSignedUrl: preSignedUrl,
            },
        }));
        if (!receiveBox.length) {
            return null;
        }
        return receiveBox;
    }
};
exports.MatchBoxService = MatchBoxService;
exports.MatchBoxService = MatchBoxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [recognize_service_1.RecognizeService,
        match_repository_1.MatchRepository,
        aws_service_1.AwsService])
], MatchBoxService);
//# sourceMappingURL=match.chat.box.service.js.map