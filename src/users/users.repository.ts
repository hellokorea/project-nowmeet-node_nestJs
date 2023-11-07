import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entity/users.entity";
import { EntityManager, FindOneOptions, Repository, createQueryBuilder } from "typeorm";
import { UserCreateDto } from "./dtos/request/users.create.dto";

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

  async findByIdGetNickname(id: number): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { id },
      select: ["nickname"],
    };

    return await this.usersRepository.findOne(option);
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { nickname },
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

  //--------------Location Rogic

  async findUserLocation(id: number): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { id },
      select: ["longitude", "latitude"],
    };
    return await this.usersRepository.findOne(option);
  }

  async refreshUserLocation(id: number, x: number, y: number): Promise<User | null> {
    const userLocation = await this.usersRepository.findOne({ where: { id } });

    userLocation.longitude = x;
    userLocation.latitude = y;

    return await this.usersRepository.save(userLocation);
  }

  async findUsersNearLocaction(longitude: number, latitude: number, radius: number): Promise<User[] | null> {
    const distanceInMeters = radius * 1000;

    return await this.usersRepository
      .createQueryBuilder("user")
      .where(`ST_Distance_Sphere(POINT(user.longitude, user.latitude), POINT(:longitude, :latitude)) < :distance`)
      .setParameters({
        longitude,
        latitude,
        distance: distanceInMeters,
      })
      .getMany();
  }

  //--------------s3 Bucket Rogic

  async findByFilesKeys(id: number): Promise<User | null> {
    const option: FindOneOptions<User> = {
      where: { id },
      select: ["profileImages"],
    };

    return await this.usersRepository.findOne(option);
  }
}
