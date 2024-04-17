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
exports.UserCreateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserCreateDto {
}
exports.UserCreateDto = UserCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "test@gmail.com",
        description: "email",
    }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "helloWorld",
        description: "nickname",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "남자",
        description: "sex",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "1994-07-30",
        description: "birthDate",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "183",
        description: "tall",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "tall", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "전문직",
        description: "job",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "job", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "잘 부탁드립니다.",
        description: "introduce",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "introduce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["게임, 독서, 술, 여행"],
        description: "preference",
        isArray: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], UserCreateDto.prototype, "preference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "180.000000",
        description: "longitude",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], UserCreateDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "-90.000000",
        description: "latitude",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], UserCreateDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Google = Disuse || Apple = apple.sub.12345",
    }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "sub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["Example.jpg", "Example.jpg,"],
        description: "profileImages",
        isArray: true,
    }),
    __metadata("design:type", Array)
], UserCreateDto.prototype, "profileImages", void 0);
//# sourceMappingURL=users.create.dto.js.map