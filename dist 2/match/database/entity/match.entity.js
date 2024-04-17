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
exports.Match = exports.MatchState = void 0;
const users_entity_1 = require("../../../users/database/entity/users.entity");
const typeorm_1 = require("typeorm");
var MatchState;
(function (MatchState) {
    MatchState["PENDING"] = "PENDING";
    MatchState["MATCH"] = "MATCH";
    MatchState["REJECT"] = "REJECT";
    MatchState["EXPIRE"] = "EXPIRE";
})(MatchState || (exports.MatchState = MatchState = {}));
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.sendMatches),
    __metadata("design:type", users_entity_1.User)
], Match.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.receivedMatches),
    __metadata("design:type", users_entity_1.User)
], Match.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: MatchState, default: MatchState.PENDING }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", String)
], Match.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Match.prototype, "expireMatch", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)()
], Match);
//# sourceMappingURL=match.entity.js.map