import { RedisModuleOptions, RedisModuleOptionsFactory } from "@nestjs-modules/ioredis";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createRedisModuleOptions(): RedisModuleOptions | Promise<RedisModuleOptions> {
    try {
      const isDevMode = process.env.MODE === "dev";

      const redisUrl = isDevMode ? "DEV_REDIS_URL" : "PROD_REDIS_URL";

      return new Promise((res) => {
        res({
          type: "single",
          url: this.configService.get<string>(redisUrl),
        });
      });
    } catch (e) {
      throw new InternalServerErrorException("Redis Connect Failed");
    }
  }
}
