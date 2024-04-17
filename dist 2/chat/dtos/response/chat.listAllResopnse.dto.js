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
exports.ChatAllListResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ChatAllListResponseDto {
}
exports.ChatAllListResponseDto = ChatAllListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], ChatAllListResponseDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], ChatAllListResponseDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2" }),
    __metadata("design:type", Number)
], ChatAllListResponseDto.prototype, "me", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "5" }),
    __metadata("design:type", Number)
], ChatAllListResponseDto.prototype, "matchUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "최신 메시지" }),
    __metadata("design:type", String)
], ChatAllListResponseDto.prototype, "lastMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "김덕배" }),
    __metadata("design:type", String)
], ChatAllListResponseDto.prototype, "matchUserNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "statusD" }),
    __metadata("design:type", String)
], ChatAllListResponseDto.prototype, "chatStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
            "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
        ],
        isArray: true,
    }),
    __metadata("design:type", Array)
], ChatAllListResponseDto.prototype, "PreSignedUrl", void 0);
//# sourceMappingURL=chat.listAllResopnse.dto.js.map