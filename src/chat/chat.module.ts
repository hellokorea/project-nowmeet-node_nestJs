import { Module, forwardRef } from "@nestjs/common";
import { ChatRoom } from "./entity/chats.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatGateway } from "./chat.gateway";
import { ChatMessage } from "./entity/chatmessage.entity";
import { UsersModule } from "src/users/users.module";
import { DevChatRoom } from "./entity/devchats.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, DevChatRoom, ChatMessage]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  exports: [ChatGateway],
  controllers: [],
  providers: [ChatGateway],
})
export class ChatModule {}
