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

@ApiBearerAuth()
@Controller("match")
@UseGuards()
@UseInterceptors(SuccessInterceptor)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  //-----------------------Get User Profile Logic
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

  //-----------------------Create Match Logic
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

  //-----------------------Get Match Box Logic
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

  //-------------------- Chat Logic
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
    description:
      "채팅방의 Status가 PENDING이면 expireTime(오픈 만료 시간)이고, OPEN이면 disconnectTime(채팅 종료 시간) END면 just Data",
    type: ChatRoomResponseDto,
  })
  @ApiOperation({ summary: "해당 채팅방으로 입장" })
  @ApiParam({ name: "chatId", description: "채팅방 입장할 id 입력", type: Number })
  @Get("me/chatBox/:chatId")
  getUserChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchService.getUserChatRoom(chatId, req);
  }

  @ApiResponse({
    description: "채팅방 오픈 시 채팅방 Status => OPEN으로 변경, disconnectTime 함수 활성",
    type: OpenChatResponseDto,
  })
  @ApiOperation({ summary: "채팅방 오픈" })
  @ApiParam({ name: "chatId", description: "오픈할 채팅방 id 입력", type: Number })
  @Post("me/chatBox/:chatId/open")
  openChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchService.openChatRoom(chatId, req);
  }

  @ApiOperation({ summary: "채팅방 나가기" })
  @ApiParam({ name: "chatId", description: "나갈 채팅방 id 입력", type: Number })
  @Put("me/chatBox/:chatId/exit")
  exitChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchService.exitChatRoom(chatId, req);
  }

  @ApiOperation({ summary: "채팅방 삭제" })
  @ApiParam({ name: "chatId", description: "삭제할 채팅방 id 입력", type: Number })
  @Delete("me/chatBox/:chatId/delete")
  deleteChatRoom(@Param("chatId") chatId: number, @Req() req: UserRequestDto) {
    return this.matchService.deleteChatRoom(chatId, req);
  }
}
