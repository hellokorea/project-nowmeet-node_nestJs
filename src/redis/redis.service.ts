import { Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import { ChatState } from "src/chat/database/entity/chat.entity";
import { ChatsRepository } from "src/chat/database/repository/chat.repository";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisService implements OnModuleInit {
  private subscriber: Redis;
  private publisher: Redis;

  private PROD_TIME = 24 * 60 * 60 * 1000;
  private TEST_TIME = 120;

  private isDevMode = process.env.MODE === "dev";
  private redisUrlKey = this.isDevMode ? "DEV_REDIS_URL" : "PROD_REDIS_URL";
  private redisUrl = this.configService.get<string>(this.redisUrlKey);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly chatsRepository: ChatsRepository,
    private configService: ConfigService
  ) {
    this.subscriber = new Redis(this.redisUrl);
    this.publisher = new Redis(this.redisUrl);

    console.log("Service 연결 시킬 레디스 url ", this.redisUrl);
    console.log("Service 연결 시킬 레디스 키", this.redisUrlKey);
  }

  async onModuleInit() {
    const messageHandler = {
      "__keyevent@0__:expired": this.handlerSubChatExpire,
    };

    this.publisher.config("SET", "notify-keyspace-events", "Ex");
    this.subscriber.subscribe("__keyevent@0__:expired");

    this.subscriber.on("message", async (channel, message) => {
      const handler = messageHandler[channel];

      if (handler) {
        await handler.call(this, message);
      }
    });
  }

  // Redis subscriber Logic
  async handlerSubChatExpire(message: string) {
    const chatId: number = parseInt(message.split(":")[1]);

    const chat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);

    try {
      if (chat.status === ChatState.PENDING) {
        if (chat) {
          chat.status = ChatState.EXPIRE_END;
          await this.chatsRepository.saveChatData(chat);
          console.log("expire end로 변경 완료!");
        }
      }

      if (chat.status === ChatState.OPEN) {
        if (chat) {
          chat.status = ChatState.DISCONNECT_END;
          await this.chatsRepository.saveChatData(chat);
          console.log("disconnect 로 변경 완료!");
        }
      }

      return;
    } catch (e) {
      throw new InternalServerErrorException("레디스 Expire 구독에 실패 했습니다.");
    }
  }

  // Redis Set Logic
  async publishChatStatus(chatId: number, status: string) {
    const key = `chat:${chatId}`;

    try {
      await this.redis.setex(key, this.TEST_TIME, status);
      console.log("레디스 키 세팅 :", key, status, this.TEST_TIME);
    } catch (e) {
      throw new InternalServerErrorException("publishChatStatus 실패", e);
    }
  }

  // Redis Delete Logic
  async deleteChatKey(chatId: number) {
    const key = `chat:${chatId}`;

    try {
      await this.redis.del(key);
      console.log("삭제 된 redis chatId :", key);
      return;
    } catch (e) {
      throw new InternalServerErrorException("redis chatId key 삭제 실패");
    }
  }

  // Redis Geo Add Logic
  async updateUserLocation(userId: number, lon: number, lat: number) {
    const key: string = "user_locations";
    const uniqueId: string = `user:${userId}`;

    try {
      await this.redis.geoadd(key, lon, lat, uniqueId);
      console.log(`key : ${key}, 유저 id : ${uniqueId}, 경도 : ${lon}, 위도 : ${lat}`);
    } catch (e) {
      throw new InternalServerErrorException("redis 위, 경도 업데이트 실패");
    }
  }

  // Redis Geospatial Logic
  async findNearRedisbyUsers(lon: number, lat: number, radius: number) {
    try {
      const key: string = "user_locations";
      return await this.redis.georadius(key, lon, lat, radius, "km", "WITHCOORD", "WITHDIST");
    } catch (e) {
      throw new InternalServerErrorException("redis 유저 반경 탐색 실패");
    }
  }
}
