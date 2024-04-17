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
exports.InAppController = void 0;
const common_1 = require("@nestjs/common");
const in_app_service_1 = require("../service/in-app.service");
const success_interceptor_1 = require("../../common/interceptors/success.interceptor");
let InAppController = class InAppController {
    constructor(inAppService) {
        this.inAppService = inAppService;
    }
    getProfile() {
        return this.inAppService.getProfile();
    }
    sendLike() {
        return this.inAppService.sendLike();
    }
    openChat() {
        return this.inAppService.openChat();
    }
};
exports.InAppController = InAppController;
__decorate([
    (0, common_1.Post)("getProfile"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InAppController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)("sendLike"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InAppController.prototype, "sendLike", null);
__decorate([
    (0, common_1.Post)("openChat"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InAppController.prototype, "openChat", null);
exports.InAppController = InAppController = __decorate([
    (0, common_1.Controller)("inApp"),
    (0, common_1.UseInterceptors)(success_interceptor_1.SuccessInterceptor),
    __metadata("design:paramtypes", [in_app_service_1.InAppService])
], InAppController);
//# sourceMappingURL=in-app.controller.js.map