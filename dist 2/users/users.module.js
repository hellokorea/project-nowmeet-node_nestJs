"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./controllers/users.controller");
const user_account_service_1 = require("./service/user.account.service");
const users_repository_1 = require("./database/repository/users.repository");
const auth_module_1 = require("../auth/auth.module");
const typeorm_1 = require("@nestjs/typeorm");
const users_entity_1 = require("./database/entity/users.entity");
const platform_express_1 = require("@nestjs/platform-express");
const multer_options_1 = require("../common/utils/multer.options");
const match_module_1 = require("../match/match.module");
const chat_module_1 = require("../chat/chat.module");
const app_module_1 = require("../app.module");
const user_signup_service_1 = require("./service/user.signup.service");
const user_map_service_1 = require("./service/user.map.service");
const recognize_module_1 = require("../recognize/recognize.module");
const firebase_module_1 = require("../firebase/firebase.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([users_entity_1.User]),
            platform_express_1.MulterModule.registerAsync({
                useFactory: multer_options_1.multerOptions,
            }),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => match_module_1.MatchModule),
            (0, common_1.forwardRef)(() => chat_module_1.ChatModule),
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
            (0, common_1.forwardRef)(() => recognize_module_1.RecognizeModule),
            (0, common_1.forwardRef)(() => firebase_module_1.FirebaseModule),
        ],
        exports: [user_account_service_1.UserAccountService, users_repository_1.UsersRepository],
        controllers: [users_controller_1.UsersController],
        providers: [user_account_service_1.UserAccountService, user_signup_service_1.UserSignupService, user_map_service_1.UserMapService, users_repository_1.UsersRepository],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map