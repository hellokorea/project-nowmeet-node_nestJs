import { Body, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { PushService } from "../service/firebase.push.service";
import { CustomJwtGuards } from "src/auth/jwt/jwt.guard";

@Controller("firebase")
@UseInterceptors(SuccessInterceptor)
export class FirebaseController {
  constructor(private readonly pushService: PushService) {}

  @UseGuards(CustomJwtGuards)
  @Post("push")
  sendPushNotification(@Body() body: { fcmToken: string; title: string; message: string }) {
    return this.pushService.sendPushNotification(body);
  }
}
