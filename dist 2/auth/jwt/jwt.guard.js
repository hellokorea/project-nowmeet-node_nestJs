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
exports.CustomJwtGuards = exports.AppleGuard = exports.GoogleGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt = require("jsonwebtoken");
let GoogleGuard = class GoogleGuard extends (0, passport_1.AuthGuard)("google-jwt") {
};
exports.GoogleGuard = GoogleGuard;
exports.GoogleGuard = GoogleGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleGuard);
let AppleGuard = class AppleGuard extends (0, passport_1.AuthGuard)("apple-jwt") {
};
exports.AppleGuard = AppleGuard;
exports.AppleGuard = AppleGuard = __decorate([
    (0, common_1.Injectable)()
], AppleGuard);
let CustomJwtGuards = class CustomJwtGuards {
    constructor(googleGuard, appleGuard) {
        this.googleGuard = googleGuard;
        this.appleGuard = appleGuard;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException("Authorization header is missing");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new common_1.UnauthorizedException("Bearer token is missing");
        }
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded !== "object") {
            throw new common_1.UnauthorizedException("Invalid token");
        }
        const issuer = decoded.iss;
        if (!issuer) {
            throw new common_1.UnauthorizedException("Issuer is missing in token");
        }
        try {
            if (issuer.includes("accounts.google.com")) {
                const result = await this.googleGuard.canActivate(context);
                return result;
            }
            else if (issuer.includes("appleid.apple.com")) {
                const result = await this.appleGuard.canActivate(context);
                return result;
            }
        }
        catch (e) {
            console.error("canActivate :", e);
            throw new common_1.UnauthorizedException("CustomJwtGuards 작동 실패");
        }
        return false;
    }
};
exports.CustomJwtGuards = CustomJwtGuards;
exports.CustomJwtGuards = CustomJwtGuards = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [GoogleGuard,
        AppleGuard])
], CustomJwtGuards);
//# sourceMappingURL=jwt.guard.js.map