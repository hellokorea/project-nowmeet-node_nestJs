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
} from "@nestjs/common";
import { UsersService } from "../service/users.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserCreateDto } from "../dtos/users.create.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/utils/multer.options";
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

  @Post("signup")
  createUser(@Body() body: UserCreateDto) {
    return this.userService.createUser(
      body //file
    );
  }

  @Get("signup/nickname")
  nicknameDuplicate(@Body() body: UserNicknameDuplicateDto) {
    return this.userService.nicknameDuplicate(body);
  }

  @Get("me/:id")
  @UseGuards(JwtAuthGuard)
  getMyUserInfo(@Param("id", ParseIntPipe) id: number, @Req() req: UserRequestDto) {
    return this.userService.getMyUserInfo(id, req);
  }

  @Put("me/:id/update")
  @UseGuards(JwtAuthGuard)
  putMyUserInfo(@Param("id", ParseIntPipe) id: number, @Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyUserInfo(id, body, req);
  }

  @Delete("me/:id/delete")
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Param("id", ParseIntPipe) id: number, @Req() req: UserRequestDto) {
    return this.userService.deleteAccount(id, req);
  }
}
