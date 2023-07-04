import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { UserRequestDto } from "../dtos/users.create.dto";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async createUser(body: UserRequestDto) {
    const { email } = body;
    const user = await this.usersRepository.create({
      email,
    });
    return user;
  }
}
