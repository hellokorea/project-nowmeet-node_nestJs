import { Controller, Get, Post, UseInterceptors } from "@nestjs/common";
import { InAppService } from "../service/in-app.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";

@Controller("inApp")
@UseInterceptors(SuccessInterceptor)
export class InAppController {
  constructor(private readonly inAppService: InAppService) {}

  @Post("getProfile")
  getProfile() {
    return this.inAppService.getProfile();
  }

  @Post("sendLike")
  sendLike() {
    return this.inAppService.sendLike();
  }

  @Post("openChat")
  openChat() {
    return this.inAppService.openChat();
  }
}
