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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const match_entity_1 = require("../match/database/entity/match.entity");
const match_repository_1 = require("../match/database/repository/match.repository");
let ScheduleService = class ScheduleService {
    constructor(matchRepository) {
        this.matchRepository = matchRepository;
    }
    async handleExpiredMatches() {
        try {
            const expireMatches = await this.matchRepository.findExpiredMatches();
            if (!expireMatches.length) {
                return;
            }
            expireMatches.forEach(async (match) => {
                console.log(`삭제된 matchId: ${match.id}, matchStatus: ${match.status} ... match data remove`);
                await this.matchRepository.removeExpireMatch(match);
            });
        }
        catch (e) {
            console.error("handleExpiredMatches error :", e);
            throw new common_1.InternalServerErrorException("만료된 매치 데이터 삭제에 실패 했습니다.");
        }
        return;
    }
    async checkAndExpireMatches() {
        try {
            const matchesToExpire = await this.matchRepository.findExpiredMatches();
            if (!matchesToExpire.length) {
                return;
            }
            for (const match of matchesToExpire) {
                match.status = match_entity_1.MatchState.EXPIRE;
                await this.matchRepository.saveMatch(match);
            }
        }
        catch (e) {
            console.error("checkAndExpireMatches error :", e);
            throw new common_1.InternalServerErrorException("만료된 매치 상태 반영에 실패 했습니다.");
        }
        return;
    }
};
exports.ScheduleService = ScheduleService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduleService.prototype, "handleExpiredMatches", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_3_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduleService.prototype, "checkAndExpireMatches", null);
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [match_repository_1.MatchRepository])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map