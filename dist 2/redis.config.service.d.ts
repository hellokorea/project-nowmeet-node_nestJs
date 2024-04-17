import { RedisModuleOptions, RedisModuleOptionsFactory } from "@nestjs-modules/ioredis";
import { ConfigService } from "@nestjs/config";
export declare class RedisConfigService implements RedisModuleOptionsFactory {
    private configService;
    constructor(configService: ConfigService);
    createRedisModuleOptions(): RedisModuleOptions | Promise<RedisModuleOptions>;
}
