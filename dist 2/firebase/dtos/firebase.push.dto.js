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
exports.ReqPushNotificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ReqPushNotificationDto {
}
exports.ReqPushNotificationDto = ReqPushNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "put fcm title" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReqPushNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "put message" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReqPushNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "put nickname" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReqPushNotificationDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "put screenName" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReqPushNotificationDto.prototype, "screenName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "put chatId" }),
    __metadata("design:type", Number)
], ReqPushNotificationDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "put senderNickname" }),
    __metadata("design:type", String)
], ReqPushNotificationDto.prototype, "senderNickname", void 0);
//# sourceMappingURL=firebase.push.dto.js.map