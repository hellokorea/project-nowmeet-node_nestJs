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
exports.SendLikeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SendLikeResponseDto {
}
exports.SendLikeResponseDto = SendLikeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], SendLikeResponseDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2" }),
    __metadata("design:type", Number)
], SendLikeResponseDto.prototype, "me", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "my nickname" }),
    __metadata("design:type", String)
], SendLikeResponseDto.prototype, "myNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "5" }),
    __metadata("design:type", Number)
], SendLikeResponseDto.prototype, "receiverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "김둑덕" }),
    __metadata("design:type", String)
], SendLikeResponseDto.prototype, "receiverNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PENDING" }),
    __metadata("design:type", String)
], SendLikeResponseDto.prototype, "matchStatus", void 0);
//# sourceMappingURL=match.sendLikeResonse.dto.js.map