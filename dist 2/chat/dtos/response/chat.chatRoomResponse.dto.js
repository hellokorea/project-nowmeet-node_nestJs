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
exports.ChatRoomResponseDto = exports.MessageResDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class MessageResDto {
}
exports.MessageResDto = MessageResDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    __metadata("design:type", Number)
], MessageResDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], MessageResDto.prototype, "rommId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "우리 만날까요?" }),
    __metadata("design:type", String)
], MessageResDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], MessageResDto.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "김춘배" }),
    __metadata("design:type", String)
], MessageResDto.prototype, "senderNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2024-03-13 23:13:40" }),
    __metadata("design:type", String)
], MessageResDto.prototype, "createdAt", void 0);
class ChatRoomResponseDto {
}
exports.ChatRoomResponseDto = ChatRoomResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2" }),
    __metadata("design:type", Number)
], ChatRoomResponseDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], ChatRoomResponseDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "5" }),
    __metadata("design:type", Number)
], ChatRoomResponseDto.prototype, "matchUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "김춘배" }),
    __metadata("design:type", String)
], ChatRoomResponseDto.prototype, "matchUserNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => MessageResDto, isArray: true }),
    __metadata("design:type", MessageResDto)
], ChatRoomResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PENDING" }),
    __metadata("design:type", String)
], ChatRoomResponseDto.prototype, "chatStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["https://nowmeet-profileimg-s3-bucket-dev.s3.ap-northeast-2.amazonaws.com/profileImages/example.jpg"],
        type: [String],
    }),
    __metadata("design:type", Array)
], ChatRoomResponseDto.prototype, "preSignedUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2024-03-14 23:20:41",
    }),
    __metadata("design:type", String)
], ChatRoomResponseDto.prototype, "expireTime", void 0);
//# sourceMappingURL=chat.chatRoomResponse.dto.js.map