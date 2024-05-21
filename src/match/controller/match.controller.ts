import {
  Controller,
  Get,
  UseInterceptors,
  Post,
  Req,
  Param,
  UseGuards,
  ParseIntPipe,
  Delete,
  Put,
} from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { MatchService } from "../service/match.service";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { SendLikeResponseDto } from "../dtos/request/match.sendLikeResonse.dto";
import { ReceiveBoxResponseDto, SendBoxResponseDto } from "../dtos/response/match.likeBoxResponse.dto";
import { MatchAcceptResponseDto, MatchRejectResponseDto } from "../dtos/response/match.matchResultResponse.dto";
import { ChatAllListResponseDto } from "../../chat/dtos/response/chat.listAllResopnse.dto";
import { ChatRoomResponseDto } from "src/chat/dtos/response/chat.chatRoomResponse.dto";
import { GetProfileResponseDto } from "src/users/dtos/response/user.getProfiles.dto";
import { OpenChatResponseDto } from "src/chat/dtos/response/chat.open.dto";
import { CustomJwtGuards, GoogleGuard } from "src/auth/jwt/jwt.guard";
import { MatchProfileService } from "src/match/service/match.profile.service";
import { MatchBoxService } from "../service/match.chat.box.service";
import { MatchChatService } from "../service/match.chat.service";

@ApiBearerAuth()
@Controller("match")
@UseGuards(CustomJwtGuards)
@UseInterceptors(SuccessInterceptor)
export class MatchController {
  constructor(
    private readonly matchProfileService: MatchProfileService,
    private readonly matchService: MatchService,
    private readonly matchBoxService: MatchBoxService,
    private readonly matchChatService: MatchChatService
  ) {}

  //*----Profile Logic
  @ApiResponse({ type: GetProfileResponseDto })
  @ApiOperation({ summary: "유저 프로필 조회" })
  @ApiParam({ name: "nickname", description: "유저 닉네임 입력", type: String })
  @Get("profile/:nickname")
  getUserProfile(@Param("nickname") nickname: string, @Req() req: UserRequestDto) {
    return this.matchProfileService.getUserProfile(nickname, req);
  }

  //*----Match Logic
  @ApiResponse({ type: SendLikeResponseDto })
  @ApiOperation({ summary: "유저 좋아요 전송" })
  @ApiParam({ name: "nickname", description: "좋아요 보낼 유저 닉네임 입력", type: String })
  @Post("profile/:nickname/like")
  userLikeSend(@Param("nickname") nickname: string, @Req() req: UserRequestDto) {
    return this.matchService.sendLike(nickname, req);
  }

  @ApiResponse({ type: MatchAcceptResponseDto })
  @ApiOperation({ summary: "수신함에서 유저 좋아요 수락" })
  @ApiParam({ name: "matchId", description: "좋아요 수락할 matchId 입력", type: Number })
  @Post("me/receiveBox/:matchId/accept")
  acceptLike(@Param("matchId", ParseIntPipe) matchId: number, @Req() req: UserRequestDto) {
    return this.matchService.matchAccept(matchId, req);
  }

  @ApiResponse({ type: MatchRejectResponseDto })
  @ApiOperation({ summary: "수신함에서 유저 좋아요 거절" })
  @Post("me/receiveBox/:matchId/reject")
  @ApiParam({ name: "matchId", description: "좋아요 거절할 matchId 입력", type: Number })
  rejectLike(@Param("matchId", ParseIntPipe) matchId: number, @Req() req: UserRequestDto) {
    return this.matchService.matchReject(matchId, req);
  }

  //*----Match Box Logic
  @ApiResponse({ type: SendBoxResponseDto, isArray: true })
  @ApiOperation({ summary: "내가 보낸 좋아요 발신함" })
  @Get("me/sendBox")
  getLikeSendBox(@Req() req: UserRequestDto) {
    return this.matchBoxService.getLikeSendBox(req);
  }

  @ApiResponse({ type: ReceiveBoxResponseDto, isArray: true })
  @ApiOperation({ summary: "내가 받은 좋아요 수신함" })
  @Get("me/receiveBox")
  getLikeReceiveBox(@Req() req: UserRequestDto) {
    return this.matchBoxService.getLikeReceiveBox(req);
  }

  //*----Chat Logic
  // @ApiResponse({ type: ChatAllListResponseDto, isArray: true })
  // @ApiOperation({ summary: "나의 채팅 리스트 모두 조회 " })
  // @Get("me/chatBox/all")
  // getChatRommsList(@Req() req: UserRequestDto) {
  //   return this.matchChatService.getChatRoomsAllList(req);
  // }

  @ApiResponse({ type: ChatRoomResponseDto })
  @ApiOperation({ summary: "해당 채팅방으로 입장" })
  @ApiParam({ name: "chatId", description: "chatId 입력", type: Number })
  @Get("me/chatBox/:chatId")
  getUserChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchChatService.getUserChatRoom(chatId, req);
  }

  @ApiResponse({ type: OpenChatResponseDto })
  @ApiOperation({ summary: "채팅방 오픈" })
  @ApiParam({ name: "chatId", description: "오픈할 chatId 입력", type: Number })
  @Post("me/chatBox/:chatId/open")
  openChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchChatService.openChatRoom(chatId, req);
  }

  @ApiOperation({ summary: "채팅방 나가기" })
  @ApiParam({ name: "chatId", description: "나갈 chatId 입력", type: Number })
  @Put("me/chatBox/:chatId/exit")
  exitChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchChatService.exitChatRoom(chatId, req);
  }

  @ApiOperation({ summary: "채팅방 삭제" })
  @ApiParam({ name: "chatId", description: "삭제할 chatId 입력", type: Number })
  @Delete("me/chatBox/:chatId/delete")
  deleteChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchChatService.deleteChatRoom(chatId, req);
  }
}
