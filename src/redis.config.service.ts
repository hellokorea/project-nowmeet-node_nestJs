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
      const requirePassword = this.configService.get<string>("PROD_REDIS_PASSWORD");

      console.log("Redis URL Key:", redisUrlKey);

      console.log("Redis URL:", redisUrl);

      console.log("requirePassword:", requirePassword);
      return new Promise((res) => {
        res({
          type: "single",
          url: redisUrl,
          options: {
            password: requirePassword,
          },
        });
      });
    } catch (e) {
      throw new InternalServerErrorException("Redis Connect Failed");
    }
  }
}
