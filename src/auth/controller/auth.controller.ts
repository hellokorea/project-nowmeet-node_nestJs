import { Controller, Get, UseInterceptors, Request, Response, Post, UseGuards, Req, Res, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { AuthService } from "../service/auth.service";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsUserRequsetDto } from "../dtos/response/auth.isUser.dto";

@Controller("auth")
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ type: Boolean })
  @ApiOperation({ summary: "유저 검증" })
  @ApiBody({ description: "uuid input", type: IsUserRequsetDto })
  @Post("isUser")
  isUserExist(@Body("uuid") uuid: string) {
    return this.authService.isUserExist(uuid);
  }

  @ApiBody({ description: "code input", type: String })
  @Post("getRefreshToken/google")
  makeNewIdTokenGoogle(@Body("code") code: string) {
    return this.authService.makeNewIdTokenGoogle(code);
  }

  @ApiBody({ description: "Authcode input", type: String })
  @Post("getRefreshToken/apple")
  makeNewIdTokenApple(@Body("authCode") authCode: string) {
    return this.authService.makeNewIdTokenApple(authCode);
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleLogin(@Req() req: Request) {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleLoginCallback(@Req() req: GoogleRequest) {
    return this.authService.googleLogin(req);
  }
}
