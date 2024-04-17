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
exports.AppleJwtStrategy = exports.GooleJwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../../users/database/repository/users.repository");
const jwksRsa = require("jwks-rsa");
let GooleJwtStrategy = class GooleJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, "google-jwt") {
    constructor(userRepository) {
        const isDevMode = process.env.MODE === "dev";
        const strategyOptions = isDevMode
            ? {
                jwtFromRequest: (request) => {
                    const authHeader = request.headers.authorization;
                    if (!authHeader || !authHeader.startsWith("Bearer ")) {
                        throw new common_1.UnauthorizedException("Invalid Authorization header");
                    }
                    const token = authHeader.split(" ")[1];
                    return token;
                },
                secretOrKey: process.env.JWT_KEY,
                ignoreExpiration: false,
            }
            : {
                jwtFromRequest: (request) => {
                    const authHeader = request.headers.authorization;
                    if (!authHeader || !authHeader.startsWith("Bearer ")) {
                        throw new common_1.UnauthorizedException("Invalid Authorization header");
                    }
                    const token = authHeader.split(" ")[1];
                    return token;
                },
                secretOrKeyProvider: jwksRsa.passportJwtSecret({
                    cache: true,
                    rateLimit: true,
                    jwksRequestsPerMinute: 10,
                    jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
                }),
                ignoreExpiration: false,
                issuer: "https://accounts.google.com",
                audience: process.env.GOOGLE_WEB_CLIENTID,
                algorithms: ["RS256"],
            };
        super(strategyOptions);
        this.userRepository = userRepository;
    }
    async validate(payload) {
        try {
            const user = await this.userRepository.findOneGetByEmail(payload.email);
            if (!user) {
                throw new common_1.UnauthorizedException("유저가 존재하지 않습니다.");
            }
            return user;
        }
        catch (e) {
            console.error("googleJwtValidate :", e);
            throw new common_1.UnauthorizedException("구글 유저 인증 실패");
        }
    }
};
exports.GooleJwtStrategy = GooleJwtStrategy;
exports.GooleJwtStrategy = GooleJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], GooleJwtStrategy);
let AppleJwtStrategy = class AppleJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, "apple-jwt") {
    constructor(userRepository) {
        super({
            jwtFromRequest: (request) => {
                const authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new common_1.UnauthorizedException("Invalid Authorization header");
                }
                const token = authHeader.split(" ")[1];
                return token;
            },
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 10,
                jwksUri: "https://appleid.apple.com/auth/oauth2/v2/keys",
            }),
            ignoreExpiration: false,
            issuer: "https://appleid.apple.com",
            audience: process.env.APPLE_CLIENT_ID,
            algorithms: ["RS256"],
        });
        this.userRepository = userRepository;
    }
    async validate(payload) {
        try {
            const user = await this.userRepository.findOneAppleSub(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException("유저가 존재하지 않습니다.");
            }
            return user;
        }
        catch (e) {
            console.error("AppleJwtValidate :", e);
            throw new common_1.UnauthorizedException("애플 유저 인증 실패");
        }
    }
};
exports.AppleJwtStrategy = AppleJwtStrategy;
exports.AppleJwtStrategy = AppleJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], AppleJwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map