"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./service/auth.service");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./jwt/jwt.strategy");
const users_module_1 = require("../users/users.module");
const auth_controller_1 = require("./controller/auth.controller");
const google_strategies_1 = require("./strategies/google.strategies");
const axios_1 = require("@nestjs/axios");
const jwt_guard_1 = require("./jwt/jwt.guard");
const auth_jwt_service_1 = require("./service/auth.jwt.service");
const firebase_module_1 = require("../firebase/firebase.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ session: false }),
            axios_1.HttpModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_KEY,
                signOptions: { expiresIn: process.env.JWT_EXPIRES },
            }),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => firebase_module_1.FirebaseModule),
        ],
        exports: [auth_service_1.AuthService, jwt_guard_1.CustomJwtGuards, jwt_guard_1.GoogleGuard, jwt_guard_1.AppleGuard],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            auth_jwt_service_1.AuthJwtService,
            jwt_strategy_1.GooleJwtStrategy,
            jwt_strategy_1.AppleJwtStrategy,
            google_strategies_1.GoogleStrategy,
            jwt_guard_1.CustomJwtGuards,
            jwt_guard_1.GoogleGuard,
            jwt_guard_1.AppleGuard,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map