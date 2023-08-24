import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entity/users.entity";
import { EntityManager, FindOneOptions, Repository } from "typeorm";
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

  async deleteUser(transactionalEntityManager: EntityManager, user: User): Promise<void> {
    try {
      await transactionalEntityManager.remove(User, user);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new InternalServerErrorException("유저 삭제 중 오류가 발생했습니다.");
    }
  }
}
