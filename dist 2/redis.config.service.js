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
exports.RedisConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RedisConfigService = class RedisConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    createRedisModuleOptions() {
        try {
            const isDevMode = process.env.MODE === "dev";
            const redisUrlDev = this.configService.get("DEV_REDIS_URL");
            const redisUrlProd = this.configService.get("PROD_REDIS_URL");
            console.log(isDevMode);
            if (!isDevMode) {
                console.log(redisUrlProd);
                return new Promise((res) => {
                    res({
                        type: "single",
                        url: redisUrlProd,
                    });
                });
            }
            else {
                return new Promise((res) => {
                    console.log(redisUrlDev);
                    res({
                        type: "single",
                        url: redisUrlDev,
                    });
                });
            }
        }
        catch (e) {
            throw new common_1.InternalServerErrorException("Redis Connect Failed");
        }
    }
};
exports.RedisConfigService = RedisConfigService;
exports.RedisConfigService = RedisConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisConfigService);
//# sourceMappingURL=redis.config.service.js.map