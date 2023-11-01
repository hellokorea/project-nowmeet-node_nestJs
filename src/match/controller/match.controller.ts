import { Controller, Get, UseInterceptors, Post, Req, Param, UseGuards, ParseIntPipe } from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { MatchService } from "../service/match.service";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { SendLikeResponseDto } from "../dtos/request/match.sendLikeResonse.dto";
import { ReceiveBoxResponseDto, SendBoxResponseDto } from "../dtos/response/match.likeBoxResponse.dto";
import { MatchAcceptResponseDto, MatchRejectResponseDto } from "../dtos/response/match.matchResultResponse.dto";
import { ChatAllListResponseDto } from "./../../chat/dtos/chat.listAllResopnse.dto";
import { ChatRoomResponseDto } from "src/chat/dtos/chat.chatRoomResponse.dto";
import { GetProfileResponseDto } from "src/users/dtos/response/user.getProfiles.dto";

@ApiBearerAuth()
@Controller("match")
@UseGuards(JwtAuthGuard)
@UseInterceptors(SuccessInterceptor)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @ApiResponse({
    description: "유저 DB 내 정보 반환 / id, gem 항목은 제거",
    type: GetProfileResponseDto,
  })
  @ApiOperation({ summary: "유저 프로필 조회" })
  @ApiParam({ name: "nickname", description: "유저 닉네임 입력", type: String })
  @Get("profile/:nickname")
  getUserProfile(@Param("nickname") nickname: string, @Req() req: UserRequestDto) {
    return this.matchService.getUserProfile(nickname, req);
  }

  @ApiResponse({
    description: "matchId, senderId, reciverId, matchStatus = PENDING 반환 ",
    type: SendLikeResponseDto,
  })
  @ApiOperation({ summary: "유저 좋아요 전송" })
  @ApiParam({ name: "nickname", description: "좋아요 보낼 유저 닉네임 입력", type: String })
  @Post("profile/:nickname/like")
  userLikeSend(@Param("nickname") nickname: string, @Req() req: UserRequestDto) {
    return this.matchService.sendLike(nickname, req);
  }

  @ApiResponse({
    description: "매칭 정보 반환 / 0일 때 null 반환",
    type: SendBoxResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: "내가 보낸 좋아요 발신함" })
  @Get("me/sendBox")
  getLikeSendBox(@Req() req: UserRequestDto) {
    return this.matchService.getLikeSendBox(req);
  }

  @ApiResponse({
    description: "받은 좋아요 >= 1 시 PENDING Status 일 때 해당 유저 정보 및 매칭 정보 반환 / 0일 때 null 반환",
    type: ReceiveBoxResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: "내가 받은 좋아요 수신함" })
  @Get("me/reciveBox")
  getLikeReceiveBox(@Req() req: UserRequestDto) {
    return this.matchService.getLikeReceiveBox(req);
  }

  @ApiResponse({
    description: "유저 좋아요 수락 시 채팅방 생성 및 이동",
    type: MatchAcceptResponseDto,
  })
  @ApiOperation({ summary: "수신함에서 유저 좋아요 수락" })
  @ApiParam({ name: "matchId", description: "좋아요 수락할 매치 id 입력", type: Number })
  @Post("me/reciveBox/:matchId/accept")
  acceptLike(@Param("matchId", ParseIntPipe) matchId: number, @Req() req: UserRequestDto) {
    return this.matchService.matchAccept(matchId, req);
  }

  @ApiResponse({
    description: "유저 좋아요 거절 시 채팅방 생성 X, expireMatch 발동 동안 보관",
    type: MatchRejectResponseDto,
  })
  @ApiOperation({ summary: "수신함에서 유저 좋아요 거절" })
  @Post("me/reciveBox/:matchId/reject")
  @ApiParam({ name: "matchId", description: "좋아요 거절할 매치 id 입력", type: Number })
  rejectLike(@Param("matchId", ParseIntPipe) matchId: number, @Req() req: UserRequestDto) {
    return this.matchService.matchReject(matchId, req);
  }

  //Chat
  @ApiResponse({
    description: "있으면 채팅 관련 정보 배열로 모두 반환 / 없으면 null",
    type: ChatAllListResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: "나의 채팅 리스트 모두 조회 " })
  @Get("me/chatBox/all")
  getChatRommsList(@Req() req: UserRequestDto) {
    return this.matchService.getChatRoomsAllList(req);
  }

  @ApiResponse({
    type: ChatRoomResponseDto,
  })
  @ApiOperation({ summary: "해당 채팅방으로 입장" })
  @ApiParam({ name: "chatId", description: "채팅방 입장할 id 입력", type: Number })
  @Get("me/chatBox/:chatId")
  getUserChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchService.getUserChatRoom(chatId, req);
  }

  openChat() {
    return "채팅방 열 수 있는 API";
  }
}
