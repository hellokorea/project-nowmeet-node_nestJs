"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseModule = void 0;
const common_1 = require("@nestjs/common");
const firebase_push_service_1 = require("./service/firebase.push.service");
const firebase_controller_1 = require("./controller/firebase.controller");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module");
let FirebaseModule = class FirebaseModule {
};
exports.FirebaseModule = FirebaseModule;
exports.FirebaseModule = FirebaseModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => users_module_1.UsersModule), (0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        exports: [],
        controllers: [firebase_controller_1.FirebaseController],
        providers: [firebase_push_service_1.PushService],
    })
], FirebaseModule);
//# sourceMappingURL=firebase.module.js.map