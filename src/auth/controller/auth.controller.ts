import { Controller, Get, UseInterceptors, Request, Response, Post, UseGuards, Req, Res, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { AuthService } from "../service/auth.service";
import { GoogleRequest } from "../dtos/auth.googleuser.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsUserRequsetDto, IsUserResponseDto } from "../dtos/auth.isUser.dto";

@Controller("auth")
@UseInterceptors(SuccessInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "구글 (사용 X)" })
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleLogin(@Req() req: Request) {}

  @ApiOperation({ summary: "구글 로그인 (사용 X)" })
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleLoginCallback(@Req() req: GoogleRequest) {
    return this.authService.googleLogin(req);
  }

  @ApiResponse({
    description: "유저 존재 시 JWT 반환, 없을 시 null 반환",
    type: IsUserResponseDto,
  })
  @ApiOperation({ summary: "로그인 시 유저 검증" })
  @ApiBody({ description: "이메일 정보 입력", type: IsUserRequsetDto })
  @Post("isUser")
  isUserExist(@Body("email") email: string) {
    return this.authService.isUserExist(email);
  }
}
