import { Module, forwardRef } from "@nestjs/common";
import { ChatRoom } from "./database/entity/chat.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatGateway } from "./gateway/chat.gateway";
import { ChatMessage } from "./database/entity/chat.message.entity";
import { UsersModule } from "src/users/users.module";
import { DevChatRoom } from "./database/entity/chat.dev.entity";
import { AuthModule } from "src/auth/auth.module";
import { MatchModule } from "src/match/match.module";
import { RecognizeModule } from "src/recognize/recognize.module";
import { ChatStatusUpdaterService } from "./service/chat.status.update.service";
import { ChatService } from "./service/chat.service";
import { ChatMessagesRepository } from "./database/repository/chat.message.repository";
import { ChatsRepository } from "./database/repository/chat.repository";
import { RedisModule } from "src/redis/redis.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, DevChatRoom, ChatMessage]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => MatchModule),
    forwardRef(() => RecognizeModule),
    forwardRef(() => RedisModule),
  ],
  exports: [ChatService, ChatMessagesRepository, ChatsRepository],
  controllers: [],
  providers: [ChatGateway, ChatStatusUpdaterService, ChatService, ChatMessagesRepository, ChatsRepository],
})
export class ChatModule {}
