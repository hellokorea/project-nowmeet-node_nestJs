import { Module } from "@nestjs/common";
import { ChatRoom } from "./entity/chats.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatGateway } from "./chat.gateway";
import { ChatMessage } from "./entity/chatmessage.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatMessage])],
  exports: [ChatGateway],
  controllers: [],
  providers: [ChatGateway],
})
export class ChatModule {}
