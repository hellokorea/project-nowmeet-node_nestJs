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
  Delete,
} from "@nestjs/common";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserCreateDto } from "../dtos/request/users.create.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { RefreshLocationUserResDto } from "../dtos/response/user.locationResponse.dto";
import {
  UpdateIntroduceDto,
  UpdateJobDto,
  UpdatePreferenceDto,
  UpdateProfileDto,
} from "../dtos/request/user.putMyInfo.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";
import { GoogleGuard, CustomJwtGuards } from "src/auth/jwt/jwt.guard";
import { UserSignupService } from "../service/user.signup.service";
import { UserMapService } from "../service/user.map.service";
import { UserAccountService } from "../service/user.account.service";

@ApiBearerAuth()
@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(
    private readonly userSignupService: UserSignupService,
    private readonly userMapSerivce: UserMapService,
    private readonly userAccountService: UserAccountService
  ) {}

  //*----Signup Logic
  @ApiOperation({ summary: "회원가입" })
  @UseInterceptors(FilesInterceptor("profileImages"))
  @Post("signup")
  createUser(@Body() body: UserCreateDto, @UploadedFiles() files: Array<Express.Multer.File>, @Req() request: Request) {
    return this.userSignupService.createUser(body, files, request);
  }

  @ApiResponse({ type: Boolean })
  @ApiOperation({ summary: "회원가입 시 닉네임 중복 체크" })
  @Get("signup/nickname/:nickname")
  nicknameDuplicate(@Param("nickname") nickname: string) {
    return this.userSignupService.nicknameDuplicate(nickname);
  }

  //*----Map Logic
  @ApiResponse({
    description: "유저의 좌표 위치를 최신화하고, 반경 2km 이내의 모든 유저 정보를 반환한다",
    type: RefreshLocationUserResDto,
  })
  @ApiOperation({ summary: "위치 최신화 및 주변 유저 탐색" })
  @UseGuards(CustomJwtGuards)
  @Get("location/:lon/:lat")
  UserLocationRefresh(@Param("lon") lon: string, @Param("lat") lat: string, @Req() req: UserRequestDto) {
    return this.userMapSerivce.refreshUserLocation(lon, lat, req);
  }

  @ApiOperation({ summary: "유령 모드 On/Off" })
  @ApiBody({ type: GhostModeDto })
  @UseGuards(CustomJwtGuards)
  @Put("ghostMode")
  putGhostMode(@Body("setting") setting: GhostModeDto, @Req() req: UserRequestDto) {
    return this.userMapSerivce.putGhostMode(setting, req);
  }

  //*----Account Logic
  @ApiOperation({ summary: "내 프로필 정보 조회" })
  @UseGuards(CustomJwtGuards)
  @Get("me")
  getMyUserInfo(@Req() req: UserRequestDto) {
    return this.userAccountService.getMyUserInfo(req);
  }

  @ApiOperation({ summary: "내 프로필 직업 수정" })
  @ApiBody({ type: UpdateJobDto })
  @UseGuards(CustomJwtGuards)
  @Put("me/update/job")
  putMyJobInfo(@Body() body: UpdateJobDto, @Req() req: UserRequestDto) {
    return this.userAccountService.putMyJobInfo(body, req);
  }

  @ApiOperation({ summary: "내 프로필 자기소개 수정" })
  @ApiBody({ type: UpdateIntroduceDto })
  @UseGuards(CustomJwtGuards)
  @Put("me/update/introduce")
  putMyIntroInfo(@Body() body: UpdateIntroduceDto, @Req() req: UserRequestDto) {
    return this.userAccountService.putMyIntroduceInfo(body, req);
  }

  @ApiOperation({ summary: "내 프로필 취향 수정" })
  @ApiBody({ type: UpdatePreferenceDto })
  @UseGuards(CustomJwtGuards)
  @Put("me/update/preference")
  putMyPreInfo(@Body() body: UpdatePreferenceDto, @Req() req: UserRequestDto) {
    return this.userAccountService.putMyPreferenceInfo(body, req);
  }

  @ApiOperation({ summary: "내 프로필 사진 추가 및 수정" })
  @ApiBody({ type: UpdateProfileDto, isArray: true })
  @ApiParam({ name: "index", description: "사진 추가 및 변경할 Index 입력", type: Number })
  @UseInterceptors(FilesInterceptor("profileImage"))
  @UseGuards(CustomJwtGuards)
  @Put("me/update/profileImage/:index")
  putMyProfileSecond(
    @Param("index") index: number,
    @Req() req: UserRequestDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.userAccountService.putMyProfileImageAtIndex(index, req, files);
  }

  @ApiOperation({
    summary: "내 프로필 사진 삭제",
  })
  @ApiParam({ name: "index", description: "삭제 할 Index 입력", type: Number })
  @UseGuards(CustomJwtGuards)
  @Put("me/delete/profileImage/:index")
  deleteUserProfilesKey(@Param("index") index: number, @Req() req: UserRequestDto) {
    return this.userAccountService.deleteUserProfilesKey(index, req);
  }

  @ApiOperation({ summary: "내 계정 삭제" })
  @UseGuards(CustomJwtGuards)
  @Delete("me/delete/account")
  deleteAccount(@Req() req: UserRequestDto) {
    return this.userAccountService.deleteAccount(req);
  }
}
