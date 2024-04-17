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
exports.UserProfileResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserProfileResponseDto {
    constructor(user) {
        this.nickname = user.nickname;
        this.sex = user.sex;
        this.birthDate = user.birthDate;
        this.tall = user.tall;
        this.job = user.job;
        this.introduce = user.introduce;
        this.preference = user.preference;
        this.longitude = user.longitude;
        this.latitude = user.latitude;
        this.profileImages = user.profileImages;
        this.ghostMode = user.ghostMode;
    }
}
exports.UserProfileResponseDto = UserProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "홍길동" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "남자" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "19940730" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "182" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "tall", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "전문직" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "job", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "안녕하십니까부리" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "introduce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "이것, 저것, 그것, 무엇" }),
    __metadata("design:type", Array)
], UserProfileResponseDto.prototype, "preference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], UserProfileResponseDto.prototype, "ghostMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "180.000000" }),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "-90.000000" }),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "null" }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "matchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "profileImages/1697729883735_%EA%B9%80%EC%A0%95%EB%8F%99%EB%8B%98.jpg,profileImages/1697729883735_%EA%B9%80%EC%A0%95%EB%8F%99%EB%8B%98.jpg ",
    }),
    __metadata("design:type", Array)
], UserProfileResponseDto.prototype, "profileImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
    }),
    __metadata("design:type", Array)
], UserProfileResponseDto.prototype, "PreSignedUrl", void 0);
//# sourceMappingURL=user.profile.dto.js.map