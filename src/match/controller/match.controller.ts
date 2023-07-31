import {
  Controller,
  Get,
  UseInterceptors,
  Post,
  Body,
  Req,
  UploadedFiles,
  Put,
  Param,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
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
  getUserProfile(@Param("id", ParseIntPipe) id: number) {
    return this.matchService.getUserProfile(id);
  }

  @Post("profile/:id/like")
  userLikeSend(@Param("id", ParseIntPipe) id: number, @Req() req: UserRequestDto) {
    return this.matchService.createMatch(id, req);
  }

  @Get("me/sendbox")
  getLikeSendBox(@Req() req: UserRequestDto) {
    return this.matchService.getLikeSendBox(req);
  }

  @Get("me/recivebox")
  getLikeReceiveBox() {
    return "나에게 좋아요를 보낸 유저 조회";
  }

  @Post("me/recivebox/profile/:id/accept")
  acceptLike() {
    return "좋아요 수락";
  }

  @Post("me/recivebox/:id/reject")
  rejectLike() {
    return "좋아요 거절";
  }
}
