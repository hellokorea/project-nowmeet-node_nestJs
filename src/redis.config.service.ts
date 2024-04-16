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
      console.log(redisUrl); //
      // const requirePassword = this.configService.get<string>("PROD_REDIS_PASSWORD");
      // console.log(requirePassword);

      return new Promise((res) => {
        res({
          type: "single",
          url: "redis://:83229577@172.31.45.45:6379/0",
        });
      });
    } catch (e) {
      throw new InternalServerErrorException("Redis Connect Failed");
    }
  }
}
