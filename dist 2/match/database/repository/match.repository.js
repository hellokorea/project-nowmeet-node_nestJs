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
exports.MatchRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const match_entity_1 = require("../entity/match.entity");
const typeorm_2 = require("typeorm");
const match_dev_entity_1 = require("../entity/match.dev.entity");
const moment = require("moment-timezone");
let MatchRepository = class MatchRepository {
    constructor(matchRepository, devMatchRepository) {
        this.matchRepository = matchRepository;
        this.devMatchRepository = devMatchRepository;
    }
    async findOneMatchById(matchId) {
        const option = {
            where: { id: matchId },
            relations: ["receiver", "sender"],
        };
        return await this.matchRepository.findOne(option);
    }
    async isMatchFind(senderId, receiverId) {
        return await this.matchRepository.find({
            where: {
                sender: { id: senderId },
                receiver: { id: receiverId },
            },
        });
    }
    async findOneMatchByUserIds(profileId, loggedId) {
        const option = {
            where: [
                { sender: { id: loggedId }, receiver: { id: profileId } },
                { sender: { id: profileId }, receiver: { id: loggedId } },
            ],
        };
        return await this.matchRepository.findOne(option);
    }
    async findExpiredMatches() {
        const currentKoreaTime = moment().tz("Asia/Seoul").toDate();
        return this.matchRepository.find({ where: { expireMatch: (0, typeorm_2.LessThan)(currentKoreaTime) } });
    }
    async getSendMatches(userId) {
        return await this.matchRepository.find({ where: { sender: { id: userId } }, relations: ["receiver"] });
    }
    async getReceiveMatches(userId) {
        return await this.matchRepository.find({ where: { receiver: { id: userId } }, relations: ["sender"] });
    }
    async createMatch(senderId, receiverId) {
        const PROD_TIMER = 24 * 60 * 60 * 1000;
        const TEST_TIMER = 120 * 1000;
        const expireMatch = moment().add(PROD_TIMER, "milliseconds").tz("Asia/Seoul").toDate();
        const newMatch = this.matchRepository.create({
            sender: { id: senderId },
            receiver: { id: receiverId },
            expireMatch,
        });
        return await this.matchRepository.save(newMatch);
    }
    async saveMatch(match) {
        return await this.matchRepository.save(match);
    }
    async removeExpireMatch(match) {
        await this.matchRepository.remove(match);
    }
    async findOneDevMatchById(matchId) {
        const option = {
            where: { id: matchId },
            relations: ["receiver", "sender"],
        };
        return await this.devMatchRepository.findOne(option);
    }
    async createDevMatch(senderId, receiverId) {
        const newMatch = this.devMatchRepository.create({
            sender: { id: senderId },
            receiver: { id: receiverId },
        });
        return await this.devMatchRepository.save(newMatch);
    }
    async saveDevMatch(match) {
        return await this.devMatchRepository.save(match);
    }
    async deleteMatchesByUserId(txManager, userId) {
        const matchRepository = txManager.getRepository(match_entity_1.Match);
        const matches = await matchRepository.find({
            where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
        });
        await matchRepository.remove(matches);
    }
    async deleteDevMatchesByUserId(txManager, userId) {
        const devMatchRepository = txManager.getRepository(match_dev_entity_1.DevMatch);
        const matches = await devMatchRepository.find({
            where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
        });
        await devMatchRepository.remove(matches);
    }
};
exports.MatchRepository = MatchRepository;
exports.MatchRepository = MatchRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __param(1, (0, typeorm_1.InjectRepository)(match_dev_entity_1.DevMatch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MatchRepository);
//# sourceMappingURL=match.repository.js.map