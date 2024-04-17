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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseController = void 0;
const common_1 = require("@nestjs/common");
const success_interceptor_1 = require("../../common/interceptors/success.interceptor");
const firebase_push_service_1 = require("../service/firebase.push.service");
const jwt_guard_1 = require("../../auth/jwt/jwt.guard");
const firebase_push_dto_1 = require("../dtos/firebase.push.dto");
const swagger_1 = require("@nestjs/swagger");
let FirebaseController = class FirebaseController {
    constructor(pushService) {
        this.pushService = pushService;
    }
    sendPushNotification(body) {
        return this.pushService.sendPushNotification(body);
    }
};
exports.FirebaseController = FirebaseController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "푸쉬 " }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Post)("push"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [firebase_push_dto_1.ReqPushNotificationDto]),
    __metadata("design:returntype", void 0)
], FirebaseController.prototype, "sendPushNotification", null);
exports.FirebaseController = FirebaseController = __decorate([
    (0, common_1.Controller)("firebase"),
    (0, common_1.UseInterceptors)(success_interceptor_1.SuccessInterceptor),
    __metadata("design:paramtypes", [firebase_push_service_1.PushService])
], FirebaseController);
//# sourceMappingURL=firebase.controller.js.map