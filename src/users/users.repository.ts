import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entitiy/users.entity";
import { Repository } from "typeorm";
import { UserRequestDto } from "./dtos/users.create.dto";

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async create(user: UserRequestDto): Promise<User> {
    return await this.usersRepository.save(user);
  }
}
