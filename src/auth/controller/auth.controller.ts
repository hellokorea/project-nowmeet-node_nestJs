import { Controller, Get, UseInterceptors, Request, Response, Post, UseGuards, Req, Res, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { AuthService } from "../service/auth.service";
import { GoogleRequest } from "../auth.interface";
import { UserCreateDto } from "src/users/dtos/users.create.dto";

@Controller("auth")
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleLogin(@Req() req: Request) {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleLoginCallback(@Req() req: GoogleRequest) {
    return this.authService.googleLogin(req);
  }
}
