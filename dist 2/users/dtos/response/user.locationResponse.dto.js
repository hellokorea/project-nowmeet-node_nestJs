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
exports.RefreshLocationUserResDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_getProfiles_dto_1 = require("./user.getProfiles.dto");
class myLocationResDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "1" }),
    __metadata("design:type", Number)
], myLocationResDto.prototype, "myId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "180.000000" }),
    __metadata("design:type", Number)
], myLocationResDto.prototype, "myLongitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "90.000000" }),
    __metadata("design:type", Number)
], myLocationResDto.prototype, "myLatitude", void 0);
class RefreshLocationUserResDto {
}
exports.RefreshLocationUserResDto = RefreshLocationUserResDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => myLocationResDto }),
    __metadata("design:type", myLocationResDto)
], RefreshLocationUserResDto.prototype, "myInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => user_getProfiles_dto_1.GetProfileResponseDto, isArray: true }),
    __metadata("design:type", user_getProfiles_dto_1.GetProfileResponseDto)
], RefreshLocationUserResDto.prototype, "nearUsers", void 0);
//# sourceMappingURL=user.locationResponse.dto.js.map