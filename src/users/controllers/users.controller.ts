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
  Delete,
  UploadedFile,
} from "@nestjs/common";
import { UsersService } from "../service/users.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserCreateDto } from "../dtos/users.create.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";
import { UserRequestDto } from "../dtos/users.request.dto";
import { UserNicknameDuplicateDto } from "../dtos/users.nickname.duplicate";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { PutMyInfoResponseDto } from "../dtos/user.putMyInfo.dto";
import { RefreshLocationUserResDto } from "../dtos/user.locationResponse.dto";
import { AwsService } from "src/aws.service";
import { DeleteResponseDto, UploadResponseDto } from "../dtos/user.profilesImages.dto";

@ApiBearerAuth()
@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly awsService: AwsService
  ) {}

  @ApiOperation({ summary: "모든 유저 정보 조회 (테스트 용도)" })
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  //-----------------------Signup Rogic

  @ApiResponse({ type: UserCreateDto })
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

  //-----------------------Profile Images Rogic

  @ApiResponse({ type: UploadResponseDto, isArray: true })
  @ApiOperation({ summary: "내 프로필 업데이트" })
  @ApiBody({ description: "업데이트 할 파일들 추가", isArray: true })
  @UseInterceptors(FilesInterceptor("profileImages"))
  @Post("me/update/profileImages")
  updateProfileImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.awsService.uploadFilesToS3("usersProfileImges", files);
  }

  //회원 가입용 추가 말고 1개더 추가하자. 변경도하고 삭제도 한번 에 하는 api.

  @ApiResponse({ description: "삭제 완료 시 파일 key 반환", type: DeleteResponseDto })
  @ApiOperation({ summary: "내 프로필 이미지 삭제" })
  @ApiBody({ description: "삭제 할 파일 Key 입력", type: DeleteResponseDto })
  @Post("me/delete/profileImages")
  deleteProfileImages(@Body("key") key: string) {
    return this.awsService.deleteS3Object(key);
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
  @ApiBody({ description: "직업, 소개, 취향 항목만 수정 가능", type: PutMyInfoResponseDto })
  @UseGuards(JwtAuthGuard)
  @Put("me/update")
  putMyUserInfo(@Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyUserInfo(body, req);
  }

  @ApiOperation({ summary: "내 계정 삭제" })
  @UseGuards(JwtAuthGuard)
  @Delete("me/delete/account")
  deleteAccount(@Req() req: UserRequestDto) {
    return this.userService.deleteAccount(req);
  }
}
