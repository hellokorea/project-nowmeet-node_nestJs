import { Module, forwardRef } from "@nestjs/common";
import { PushService } from "./service/firebase.push.service";
import { FirebaseController } from "./controller/firebase.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [],
  controllers: [FirebaseController],
  providers: [PushService],
})
export class FirebaseModule {}
