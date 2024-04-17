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
exports.ReceiveBoxResponseDto = exports.SendBoxResponseDto = exports.ProfileImagesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ProfileImagesDto {
}
exports.ProfileImagesDto = ProfileImagesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            "profileImages/1697729883735_%EA%B9%80%EC%A0%95%EB%8F%99%EB%8B%98.jpg",
            "profileImages/1697729883735_%EA%B9%80%EC%A0%95%EB%8F%99%EB%8B%98.jpg",
        ],
        isArray: true,
    }),
    __metadata("design:type", Array)
], ProfileImagesDto.prototype, "ProfileImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
            "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
        ],
        isArray: true,
    }),
    __metadata("design:type", Array)
], ProfileImagesDto.prototype, "PreSignedUrl", void 0);
class SendBoxResponseDto {
}
exports.SendBoxResponseDto = SendBoxResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], SendBoxResponseDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PENDING" }),
    __metadata("design:type", String)
], SendBoxResponseDto.prototype, "isMatch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "5" }),
    __metadata("design:type", Number)
], SendBoxResponseDto.prototype, "receiverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "박옥삼" }),
    __metadata("design:type", String)
], SendBoxResponseDto.prototype, "receiverNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2023-11-05 21:22:23" }),
    __metadata("design:type", Date)
], SendBoxResponseDto.prototype, "expireMatch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ProfileImagesDto)
], SendBoxResponseDto.prototype, "profileImages", void 0);
class ReceiveBoxResponseDto {
}
exports.ReceiveBoxResponseDto = ReceiveBoxResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], ReceiveBoxResponseDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PENDING" }),
    __metadata("design:type", String)
], ReceiveBoxResponseDto.prototype, "isMatch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2" }),
    __metadata("design:type", Number)
], ReceiveBoxResponseDto.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "김덕배" }),
    __metadata("design:type", String)
], ReceiveBoxResponseDto.prototype, "senderNickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2023-11-05 21:22:23" }),
    __metadata("design:type", Date)
], ReceiveBoxResponseDto.prototype, "expireMatch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ProfileImagesDto)
], ReceiveBoxResponseDto.prototype, "profileImages", void 0);
//# sourceMappingURL=match.likeBoxResponse.dto.js.map