import { Controller, Get, UseInterceptors, Post, Param, Body } from "@nestjs/common";
import { UsersService } from "../service/users.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserCreateDto } from "../dtos/users.create.dto";

@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post("signup")
  createUser(@Body() body: UserCreateDto) {
    return this.userService.createUser(body);
  }
}
