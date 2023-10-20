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
import { DeleteUserProfileKey } from "../dtos/request/users.deleteProfilesKey.dto";
import { UserCreateResDto } from "../dtos/response/users.create.response.dto";
import { UpdateProfileDto } from "../dtos/request/user.putMyInfo.dto";

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

  //-----------------------My Account Rogic

  @ApiOperation({ summary: "내 프로필 정보 조회" })
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMyUserInfo(@Req() req: UserRequestDto) {
    return this.userService.getMyUserInfo(req);
  }

  @ApiOperation({ summary: "내 프로필 수정" })
  @ApiBody({ description: "직업, 소개, 취향 항목만 수정 가능", type: UpdateProfileDto })
  @UseInterceptors(FilesInterceptor("profileImages"))
  @UseGuards(JwtAuthGuard)
  @Put("me/update")
  putMyUserInfo(@Body() body: any, @Req() req: UserRequestDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.userService.putMyUserInfo(body, req, files);
  }

  // delete => put 순차 요청 필요

  @ApiOperation({
    summary: "유저 프로필 사진 삭제",
    description: "반드시 deleteProfile 요청 후 완료 된 직후 putMyUserInfo 순차적으로 요청 해야함!!",
  })
  @ApiBody({ description: "삭제하고자 하는 유저 profilesImages key 입력", type: DeleteUserProfileKey })
  @UseGuards(JwtAuthGuard)
  @Put("me/update/profilesImage")
  deleteUserProfilesKey(@Req() req: UserRequestDto, @Body("deleteKey") deleteKey: string) {
    return this.userService.deleteUserProfilesKey(req, deleteKey);
  }

  @ApiOperation({ summary: "내 계정 삭제" })
  @UseGuards(JwtAuthGuard)
  @Delete("me/delete/account")
  deleteAccount(@Req() req: UserRequestDto) {
    return this.userService.deleteAccount(req);
  }
}
