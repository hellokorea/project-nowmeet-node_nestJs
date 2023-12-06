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
import { UsersService } from "../service/users.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserCreateDto } from "../dtos/request/users.create.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { UserNicknameDuplicateDto } from "../dtos/request/users.nickname.duplicate";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { RefreshLocationUserResDto } from "../dtos/response/user.locationResponse.dto";
import { UserCreateResDto } from "../dtos/response/users.create.response.dto";
import {
  UpdateIntroduceDto,
  UpdateJobDto,
  UpdatePreferenceDto,
  UpdateProfileDto,
} from "../dtos/request/user.putMyInfo.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";

@ApiBearerAuth()
@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: "모든 유저 정보 조회 (테스트 용도)" })
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  //-----------------------Signup Rogic

  @ApiResponse({ type: UserCreateResDto })
  @ApiOperation({ summary: "유저 회원가입" })
  @UseInterceptors(FilesInterceptor("profileImages"))
  @Post("signup")
  createUser(@Body() body: UserCreateDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.userService.createUser(body, files);
  }

  @ApiResponse({ description: "true || false", type: Boolean })
  @ApiOperation({ summary: "유저 회원가입 시 닉네임 중복 체크" })
  @Get("signup/nickname")
  nicknameDuplicate(@Body() body: UserNicknameDuplicateDto) {
    return this.userService.nicknameDuplicate(body);
  }

  //-----------------------Location Rogic

  @ApiResponse({
    description: "유저의 좌표 위치를 최신화하고, 반경 2km 이내의 모든 유저 정보를 반환한다",
    type: RefreshLocationUserResDto,
  })
  @ApiOperation({ summary: "유저 위치 정보 최신화" })
  @UseGuards(JwtAuthGuard)
  @Get("location/:lon/:lat")
  UserLocationRefresh(@Param("lon") lon: string, @Param("lat") lat: string, @Req() req: UserRequestDto) {
    return this.userService.refreshUserLocation(lon, lat, req);
  }

  @ApiOperation({ summary: "유령 모드 On/Off" })
  @ApiBody({ type: GhostModeDto })
  @UseGuards(JwtAuthGuard)
  @Put("ghostMode")
  putGhostMode(@Body("setting") setting: GhostModeDto, @Req() req: UserRequestDto) {
    return this.userService.putGhostMode(setting, req);
  }

  //-----------------------My Account Rogic

  @ApiOperation({ summary: "내 프로필 정보 조회" })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMyUserInfo(@Req() req: UserRequestDto) {
    return this.userService.getMyUserInfo(req);
  }

  @ApiOperation({ summary: "내 프로필 직업 수정" })
  @ApiBody({ type: UpdateJobDto })
  @UseGuards(JwtAuthGuard)
  @Put("me/update/job")
  putMyJobInfo(@Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyJobInfo(body, req);
  }

  @ApiOperation({ summary: "내 프로필 자기소개 수정" })
  @ApiBody({ type: UpdateIntroduceDto })
  @UseGuards(JwtAuthGuard)
  @Put("me/update/introduce")
  putMyIntroInfo(@Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyIntroduceInfo(body, req);
  }

  @ApiOperation({ summary: "내 프로필 취향 수정" })
  @ApiBody({ type: UpdatePreferenceDto })
  @UseGuards(JwtAuthGuard)
  @Put("me/update/preference")
  putMyPreInfo(@Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyPreferenceInfo(body, req);
  }

  @ApiOperation({ summary: "내 프로필 사진 추가 및 수정" })
  @ApiBody({ type: UpdateProfileDto, isArray: true })
  @ApiParam({ name: "index", description: "사진 추가 및 변경할 Index 입력", type: Number })
  @UseInterceptors(FilesInterceptor("profileImage"))
  @UseGuards(JwtAuthGuard)
  @Put("me/update/profileImage/:index")
  putMyProfileSecond(
    @Param("index") index: number,
    @Req() req: UserRequestDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.userService.putMyProfileImageAtIndex(index, req, files);
  }

  @ApiOperation({
    summary: "내 프로필 사진 삭제",
  })
  @ApiParam({ name: "index", description: "삭제 할 Index 입력", type: Number })
  @UseGuards(JwtAuthGuard)
  @Put("me/delete/profileImage/:index")
  deleteUserProfilesKey(@Param("index") index: number, @Req() req: UserRequestDto) {
    return this.userService.deleteUserProfilesKey(index, req);
  }

  @ApiOperation({ summary: "내 계정 삭제" })
  @UseGuards(JwtAuthGuard)
  @Delete("me/delete/account")
  deleteAccount(@Req() req: UserRequestDto) {
    return this.userService.deleteAccount(req);
  }
}
