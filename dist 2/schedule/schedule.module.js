"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleSearchModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_service_1 = require("./schedule.service");
const match_module_1 = require("../match/match.module");
const app_module_1 = require("../app.module");
let ScheduleSearchModule = class ScheduleSearchModule {
};
exports.ScheduleSearchModule = ScheduleSearchModule;
exports.ScheduleSearchModule = ScheduleSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => match_module_1.MatchModule), (0, common_1.forwardRef)(() => app_module_1.AppModule)],
        exports: [schedule_service_1.ScheduleService],
        controllers: [],
        providers: [schedule_service_1.ScheduleService],
    })
], ScheduleSearchModule);
//# sourceMappingURL=schedule.module.js.map