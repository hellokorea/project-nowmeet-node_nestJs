import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { UserCreateDto } from "../dtos/users.create.dto";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async createUser(body: UserCreateDto) {
    const { email, nickName, sex, birthDate, tall, job, introduce, preference } = body;
    const user = await this.usersRepository.createUser({
      email,
      nickName,
      sex,
      birthDate,
      tall,
      job,
      introduce,
      preference,
    });
    return user;
  }
}
