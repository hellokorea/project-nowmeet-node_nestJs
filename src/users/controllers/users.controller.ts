import { Controller, Get, UseInterceptors, Post, Param, Body } from "@nestjs/common";
import { UsersService } from "../service/users.service";
import { SuccessInterceptor } from "src/common/interceptors/success.interceptor";
import { UserRequestDto } from "../dtos/users.create.dto";

@Controller("users")
@UseInterceptors(SuccessInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post()
  createUser(@Body() body: UserRequestDto) {
    return this.userService.createUser(body);
  }
}
