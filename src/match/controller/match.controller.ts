import { Controller, Get, UseInterceptors, Post, Req, Param, UseGuards, ParseIntPipe } from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { MatchService } from "../service/match.service";
import { UserRequestDto } from "src/users/dtos/users.request.dto";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";

@Controller("match")
@UseGuards(JwtAuthGuard)
@UseInterceptors(SuccessInterceptor)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get("profile/:id")
  getUserProfile(@Param("id", ParseIntPipe) id: number, @Req() req: UserRequestDto) {
    return this.matchService.getUserProfile(id, req);
  }

  @Post("profile/:id/like")
  userLikeSend(@Param("id", ParseIntPipe) id: number, @Req() req: UserRequestDto) {
    return this.matchService.sendLike(id, req);
  }

  @Get("me/sendbox")
  getLikeSendBox(@Req() req: UserRequestDto) {
    return this.matchService.getLikeSendBox(req);
  }

  @Get("me/recivebox")
  getLikeReceiveBox(@Req() req: UserRequestDto) {
    return this.matchService.getLikeReceiveBox(req);
  }

  @Post("me/recivebox/profile/:id/accept")
  acceptLike(@Param("id", ParseIntPipe) matchId: number, @Req() req: UserRequestDto) {
    return this.matchService.matchAccept(matchId, req);
  }

  @Post("me/recivebox/profile/:id/reject")
  rejectLike(@Param("id", ParseIntPipe) matchId: number, @Req() req: UserRequestDto) {
    return this.matchService.matchReject(matchId, req);
  }
}
