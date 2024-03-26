import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { PushPushService } from "../service/firebase.push.service";

@Controller("firebase")
@UseInterceptors(SuccessInterceptor)
export class FirebaseController {
  constructor(private readonly pushService: PushPushService) {}

  @Post("push")
  sendPushNotification(@Body() body: { title: string; message: string; nickname: string }) {
    return this.pushService.sendPushNotification(body);
  }
}
