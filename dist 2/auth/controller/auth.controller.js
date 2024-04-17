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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const success_interceptor_1 = require("../../common/interceptors/success.interceptor");
const auth_service_1 = require("../service/auth.service");
const swagger_1 = require("@nestjs/swagger");
const auth_isUser_dto_1 = require("../dtos/response/auth.isUser.dto");
const auth_jwt_service_1 = require("./../service/auth.jwt.service");
let AuthController = class AuthController {
    constructor(authService, authJwtService) {
        this.authService = authService;
        this.authJwtService = authJwtService;
    }
    isUserExist(uuid) {
        return this.authService.isUserExist(uuid);
    }
    makeNewIdTokenGoogle(code) {
        return this.authJwtService.makeNewIdTokenGoogle(code);
    }
    makeNewIdTokenApple(authCode) {
        return this.authJwtService.makeNewIdTokenApple(authCode);
    }
    async googleLogin(req) { }
    googleLoginCallback(req) {
        return this.authService.googleLogin(req);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiResponse)({ type: Boolean }),
    (0, swagger_1.ApiOperation)({ summary: "유저 검증" }),
    (0, swagger_1.ApiBody)({ description: "uuid input", type: auth_isUser_dto_1.IsUserRequsetDto }),
    (0, common_1.Post)("isUser"),
    __param(0, (0, common_1.Body)("uuid")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "isUserExist", null);
__decorate([
    (0, swagger_1.ApiBody)({ description: "code input", type: String }),
    (0, common_1.Post)("getRefreshToken/google"),
    __param(0, (0, common_1.Body)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "makeNewIdTokenGoogle", null);
__decorate([
    (0, swagger_1.ApiBody)({ description: "Authcode input", type: String }),
    (0, common_1.Post)("getRefreshToken/apple"),
    __param(0, (0, common_1.Body)("authCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "makeNewIdTokenApple", null);
__decorate([
    (0, common_1.Get)("google"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("google")),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)("google/callback"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("google")),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleLoginCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    (0, common_1.UseInterceptors)(success_interceptor_1.SuccessInterceptor),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        auth_jwt_service_1.AuthJwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map