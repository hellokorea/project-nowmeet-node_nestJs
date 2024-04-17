"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecognizeModule = void 0;
const common_1 = require("@nestjs/common");
const recognize_service_1 = require("./recognize.service");
const users_module_1 = require("../users/users.module");
const match_module_1 = require("../match/match.module");
const chat_module_1 = require("../chat/chat.module");
const app_module_1 = require("../app.module");
let RecognizeModule = class RecognizeModule {
};
exports.RecognizeModule = RecognizeModule;
exports.RecognizeModule = RecognizeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => match_module_1.MatchModule),
            (0, common_1.forwardRef)(() => chat_module_1.ChatModule),
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
        ],
        exports: [recognize_service_1.RecognizeService],
        controllers: [],
        providers: [recognize_service_1.RecognizeService],
    })
], RecognizeModule);
//# sourceMappingURL=recognize.module.js.map