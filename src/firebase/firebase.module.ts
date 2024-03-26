import { Module, forwardRef } from "@nestjs/common";
import { PushPushService } from "./service/firebase.push.service";
import { UsersModule } from "src/users/users.module";
import { FirebaseController } from "./controller/firebase.controller";

@Module({
  imports: [forwardRef(() => UsersModule)],
  exports: [],
  controllers: [FirebaseController],
  providers: [PushPushService],
})
export class FirebaseModule {}
