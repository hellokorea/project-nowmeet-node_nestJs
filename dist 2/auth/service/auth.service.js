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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../../users/database/repository/users.repository");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
    }
    async isUserExist(uuid) {
        try {
            const user = uuid.includes("@gmail.com")
                ? await this.usersRepository.findOneGetByEmail(uuid)
                : await this.usersRepository.findOneAppleSub(uuid);
            return !!user;
        }
        catch (e) {
            console.error("isUserExist :", e);
            throw new common_1.InternalServerErrorException("유저 검증 도중 서버에 오류가 발생했습니다.");
        }
    }
    async googleLogin(req) {
        try {
            const { user: { email }, } = req;
            const findUser = await this.usersRepository.findOneGetByEmail(email);
            if (!findUser) {
                return null;
            }
            const googlePayload = { email, sub: findUser.id };
            const jwtToken = {
                token: this.jwtService.sign(googlePayload, {
                    secret: process.env.JWT_KEY,
                    expiresIn: process.env.JWT_EXPIRES,
                }),
            };
            return jwtToken;
        }
        catch (e) {
            console.error("googleLogin :", e);
            throw new common_1.UnauthorizedException("로그인 실패");
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map