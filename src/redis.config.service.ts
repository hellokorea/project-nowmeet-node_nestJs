import { RedisModuleOptions, RedisModuleOptionsFactory } from "@nestjs-modules/ioredis";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createRedisModuleOptions(): RedisModuleOptions | Promise<RedisModuleOptions> {
    try {
      const isDevMode = process.env.MODE === "dev";

      const redisUrlKey = isDevMode ? "DEV_REDIS_URL" : "PROD_REDIS_URL";

      const redisUrl = this.configService.get<string>(redisUrlKey);

      return new Promise((res) => {
        console.log("연결 시킬 레디스 url", redisUrl);
        res({
          type: "single",
          url: redisUrl,
        });
      });
    } catch (e) {
      throw new InternalServerErrorException("Redis Connect Failed");
    }
  }
}
