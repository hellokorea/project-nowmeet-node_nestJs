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
exports.AuthJwtService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const url_1 = require("url");
let AuthJwtService = class AuthJwtService {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async makeNewIdTokenGoogle(code) {
        const googleTokenEndpoint = "https://oauth2.googleapis.com/token";
        const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_WEB_SECRET;
        const getToken = async (body) => {
            try {
                const response = await this.httpService.axiosRef.post(googleTokenEndpoint, body.toString(), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                return response.data;
            }
            catch (e) {
                console.error("makeNewIdTokenGoogle :", e);
                throw new common_1.InternalServerErrorException("토큰 발급에 실패했습니다. With Goole");
            }
        };
        const authCodeBody = new url_1.URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: "authorization_code",
        });
        const tokenData = await getToken(authCodeBody);
        return tokenData.id_token;
    }
    async makeNewIdTokenApple(authCode) {
        const appleTokenEndpoint = "https://appleid.apple.com/auth/oauth2/v2/token";
        const clientSecret = await this.createSecretKeyApple();
        const clientId = process.env.APPLE_CLIENT_ID;
        const getToken = async (body) => {
            try {
                const response = await this.httpService.axiosRef.post(appleTokenEndpoint, body.toString(), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                return response.data;
            }
            catch (e) {
                console.error("makeNewIdTokenApple :", e);
                throw new common_1.BadRequestException("토큰 발급에 실패했습니다. With Apple");
            }
        };
        const authCodeBody = new url_1.URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: authCode,
            grant_type: "authorization_code",
        });
        const tokenData = await getToken(authCodeBody);
        const refreshToken = tokenData.refresh_token;
        const bodyRefreshToken = new url_1.URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        });
        const idTokenData = await getToken(bodyRefreshToken);
        return idTokenData;
    }
    async createSecretKeyApple() {
        const appleHeader = {
            alg: "ES256",
            kid: process.env.APPLE_APP_KEY,
        };
        const applePayload = {
            iss: process.env.APPLE_TEAM_ID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 900,
            aud: "https://appleid.apple.com",
            sub: process.env.APPLE_CLIENT_ID,
        };
        const clientKeyPath = process.env.clientKeyPath;
        const clientKey = fs.readFileSync(clientKeyPath, "utf8");
        const clientSecret = jwt.sign(applePayload, clientKey, {
            algorithm: "ES256",
            header: appleHeader,
        });
        return clientSecret;
    }
};
exports.AuthJwtService = AuthJwtService;
exports.AuthJwtService = AuthJwtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AuthJwtService);
//# sourceMappingURL=auth.jwt.service.js.map