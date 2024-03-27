import { Controller, Get, UseInterceptors, Request, Post, UseGuards, Req, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { AuthService } from "../service/auth.service";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsUserRequsetDto } from "../dtos/response/auth.isUser.dto";
import { AuthJwtService } from "./../service/auth.jwt.service";

@Controller("auth")
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authJwtService: AuthJwtService
  ) {}

  //*----User Check Logic
  @ApiResponse({ type: Boolean })
  @ApiOperation({ summary: "유저 검증" })
  @ApiBody({ description: "uuid input", type: IsUserRequsetDto })
  @Post("isUser")
  isUserExist(@Body("uuid") uuid: string) {
    return this.authService.isUserExist(uuid);
  }

  //*----Jwt Logic
  @ApiBody({ description: "code input", type: String })
  @Post("getRefreshToken/google")
  makeNewIdTokenGoogle(@Body("code") code: string) {
    return this.authJwtService.makeNewIdTokenGoogle(code);
  }

  @ApiBody({ description: "Authcode input", type: String })
  @Post("getRefreshToken/apple")
  makeNewIdTokenApple(@Body("authCode") authCode: string) {
    return this.authJwtService.makeNewIdTokenApple(authCode);
  }

  //!----Revoke Logic
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleLogin(@Req() req: Request) {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleLoginCallback(@Req() req: GoogleRequest) {
    return this.authService.googleLogin(req);
  }
}
