import { Body, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { PushService } from "../service/firebase.push.service";
import { CustomJwtGuards } from "src/auth/jwt/jwt.guard";
import { ReqPushNotificationDto } from "../dtos/firebase.push.dto";
import { ApiOperation } from "@nestjs/swagger";

@Controller("firebase")
@UseInterceptors(SuccessInterceptor)
export class FirebaseController {
  constructor(private readonly pushService: PushService) {}

  @ApiOperation({ summary: "푸쉬 " })
  @UseGuards(CustomJwtGuards)
  @Post("push")
  sendPushNotification(@Body() body: ReqPushNotificationDto) {
    return this.pushService.sendPushNotification(body);
  }
}
