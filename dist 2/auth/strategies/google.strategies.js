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
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, "google") {
    constructor() {
        const isDevMode = process.env.MODE === "dev";
        const googleStrategyOptions = isDevMode
            ? {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_API_KEY,
                callbackURL: process.env.LOCAL_GOOGLE_LOGIN_CB,
                scope: ["email", "profile"],
            }
            : {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_API_KEY,
                callbackURL: process.env.EC2_GOOGLE_LOGIN_CB,
                scope: ["email", "profile"],
            };
        super(googleStrategyOptions);
    }
    async validate(accessToken, refreshToken, profile, done) {
        try {
            const { name, emails, id } = profile;
            const user = {
                provider: "google",
                providerId: id,
                name: name,
                email: emails[0].value,
            };
            return done(null, user);
        }
        catch (e) {
            console.error("GoogleStrategy :", e);
            return done(e);
        }
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GoogleStrategy);
//# sourceMappingURL=google.strategies.js.map