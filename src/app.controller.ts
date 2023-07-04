import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { AppService } from "./app.service";
import { SuccessInterceptor } from "./common/interceptors/success.interceptor";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseInterceptors(SuccessInterceptor)
  getHello(): string {
    return this.appService.getHello();
  }
}
