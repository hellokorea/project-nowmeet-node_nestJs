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

@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  } //테스트

  @Get("location/:id/:x/:y")
  //@UseGuards(JwtAuthGuard) //^^^^^^^^^^^^^^^^^^^^^^jwt
  UserLocationRefresh(@Param("id", ParseIntPipe) id: number, @Param("x") x: string, @Param("y") y: string) {
    return this.userService.UserLocationRefresh(id, x, y);
  }

  @Post("signup")
  @UseInterceptors(FilesInterceptor("profileImages"))
  createUser(@Body() body: UserCreateDto, @UploadedFiles() files: any) {
    return this.userService.createUser(body, files);
  }

  @Get("signup/nickname")
  nicknameDuplicate(@Body() body: UserNicknameDuplicateDto) {
    return this.userService.nicknameDuplicate(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMyUserInfo(@Req() req: UserRequestDto) {
    return this.userService.getMyUserInfo(req);
  }

  @Put("me/update")
  @UseGuards(JwtAuthGuard)
  putMyUserInfo(@Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyUserInfo(body, req);
  }

  @Delete("me/delete")
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Req() req: UserRequestDto) {
    return this.userService.deleteAccount(req);
  }
}
