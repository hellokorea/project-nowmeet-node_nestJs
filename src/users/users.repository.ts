import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entitiy/users.entity";
import { FindOneOptions, Repository } from "typeorm";
import { UserCreateDto } from "./dtos/users.create.dto";

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { id },
    };
    return await this.usersRepository.findOne(option);
  }

  async createUser(user: UserCreateDto): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async findOneGetByEmail(email: string): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { email },
    };
    return await this.usersRepository.findOne(option);
  }

  async findOneGetByNickName(nickname: string): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { nickname },
    };
    return await this.usersRepository.findOne(option);
  }

  async updateUser(user: UserCreateDto): Promise<User> {
    return await this.usersRepository.save(user);
  }
}
