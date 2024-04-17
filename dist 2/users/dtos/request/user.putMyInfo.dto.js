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
exports.UpdateProfileDto = exports.UpdatePreferenceDto = exports.UpdateIntroduceDto = exports.UpdateJobDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateJobDto {
}
exports.UpdateJobDto = UpdateJobDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "교육직",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "job", void 0);
class UpdateIntroduceDto {
}
exports.UpdateIntroduceDto = UpdateIntroduceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "내 자기소개 수정하고자 하는 글",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIntroduceDto.prototype, "introduce", void 0);
class UpdatePreferenceDto {
}
exports.UpdatePreferenceDto = UpdatePreferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["게임", "오락"],
        isArray: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], UpdatePreferenceDto.prototype, "preference", void 0);
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "form-data로 file을 보내야 함",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "profileImage", void 0);
//# sourceMappingURL=user.putMyInfo.dto.js.map