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
exports.MatchRejectResponseDto = exports.MatchAcceptResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MatchAccept {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "MATCH" }),
    __metadata("design:type", String)
], MatchAccept.prototype, "matchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2" }),
    __metadata("design:type", Number)
], MatchAccept.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "nickname" }),
    __metadata("design:type", String)
], MatchAccept.prototype, "senderNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "my nickname" }),
    __metadata("design:type", String)
], MatchAccept.prototype, "myNickname", void 0);
class MatchReject {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "REJECT" }),
    __metadata("design:type", String)
], MatchReject.prototype, "matchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2" }),
    __metadata("design:type", Number)
], MatchReject.prototype, "senderId", void 0);
class chatRoom {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], chatRoom.prototype, "chatRoomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PENDING" }),
    __metadata("design:type", String)
], chatRoom.prototype, "chatStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], chatRoom.prototype, "matchId", void 0);
class MatchAcceptResponseDto {
}
exports.MatchAcceptResponseDto = MatchAcceptResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => MatchAccept }),
    __metadata("design:type", MatchAccept)
], MatchAcceptResponseDto.prototype, "match", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => chatRoom }),
    __metadata("design:type", chatRoom)
], MatchAcceptResponseDto.prototype, "chatRoom", void 0);
class MatchRejectResponseDto {
}
exports.MatchRejectResponseDto = MatchRejectResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => MatchReject }),
    __metadata("design:type", MatchReject)
], MatchRejectResponseDto.prototype, "match", void 0);
//# sourceMappingURL=match.matchResultResponse.dto.js.map