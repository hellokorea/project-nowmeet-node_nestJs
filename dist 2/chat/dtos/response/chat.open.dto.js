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
exports.OpenChatResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class OpenChatResponseDto {
}
exports.OpenChatResponseDto = OpenChatResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], OpenChatResponseDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OpenChatResponseDto.prototype, "matchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "OPEN" }),
    __metadata("design:type", String)
], OpenChatResponseDto.prototype, "chatStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2023-11-15 23:20:41" }),
    __metadata("design:type", String)
], OpenChatResponseDto.prototype, "disconnectTime", void 0);
//# sourceMappingURL=chat.open.dto.js.map