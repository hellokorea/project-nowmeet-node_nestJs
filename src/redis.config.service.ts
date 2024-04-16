import { RedisModuleOptions, RedisModuleOptionsFactory } from "@nestjs-modules/ioredis";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createRedisModuleOptions(): RedisModuleOptions | Promise<RedisModuleOptions> {
    try {
      const isDevMode = process.env.MODE === "dev";

      const redisUrlDev = this.configService.get<string>("DEV_REDIS_URL");
      const redisUrlProd = this.configService.get<string>("PROD_REDIS_URL");

      console.log(isDevMode);

      if (!isDevMode) {
        console.log(redisUrlProd);
        return new Promise((res) => {
          res({
            type: "single",
            url: redisUrlProd,
          });
        });
      } else {
        return new Promise((res) => {
          console.log(redisUrlDev);
          res({
            type: "single",
            url: redisUrlDev,
          });
        });
      }
    } catch (e) {
      throw new InternalServerErrorException("Redis Connect Failed");
    }
  }
}
