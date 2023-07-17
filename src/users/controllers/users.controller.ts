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
  // @UseGuards(JwtAuthGuard)
  getMyUserInfo(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getMyUserInfo(id);
    // 여기서 id, emial은 제외하고 보여주자.. 굳이 다 리스폰 할 필요 없다
  }

  @Put("me/revison/:id")
  // @UseGuards(JwtAuthGuard)
  putMyUserInfo(@Param("id", ParseIntPipe) id: number, @Body() body: any) {
    return this.userService.putMyUserInfo(id, body);
  }
}
