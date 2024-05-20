import { Controller, Get, Post, UseInterceptors } from "@nestjs/common";
import { InAppService } from "../service/in-app.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller("inApp")
@UseInterceptors(SuccessInterceptor)
export class InAppController {
  constructor(private readonly inAppService: InAppService) {}

  @Post("getProfile")
  @ApiExcludeEndpoint()
  getProfile() {
    return this.inAppService.getProfile();
  }

  @Post("sendLike")
  @ApiExcludeEndpoint()
  sendLike() {
    return this.inAppService.sendLike();
  }

  @Post("openChat")
  @ApiExcludeEndpoint()
  openChat() {
    return this.inAppService.openChat();
  }
}
