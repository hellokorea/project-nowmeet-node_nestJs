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
import { UsersService } from "../service/users.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserCreateDto } from "../dtos/users.create.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/utils/multer.options";
import { JwtAuthGuard } from "src/auth/jwt/jwt.guard";
import { UserRequestDto } from "../dtos/users.request.dto";

@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post("signup")
  // @UseInterceptors(FilesInterceptor("profileImage", 6))
  createUser(
    @Body() body: UserCreateDto //@UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.userService.createUser(
      body //file
    );
  }

  @Get("me/:id")
  @UseGuards(JwtAuthGuard)
  getMyUserInfo(@Param("id", ParseIntPipe) id: number, @Req() req: UserRequestDto) {
    return this.userService.getMyUserInfo(id, req);
  }

  @Put("me/revison/:id")
  @UseGuards(JwtAuthGuard)
  putMyUserInfo(@Param("id", ParseIntPipe) id: number, @Body() body: any, @Req() req: UserRequestDto) {
    return this.userService.putMyUserInfo(id, body, req);
  }
}
