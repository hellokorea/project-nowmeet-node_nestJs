import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { UserCreateDto } from "../dtos/users.create.dto";
import { AuthService } from "src/auth/service/auth.service";
import { User } from "../entitiy/users.entity";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly authSerivce: AuthService) {}

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async createUser(
    body: UserCreateDto //files: Array<Express.Multer.File>
  ) {
    const { email, nickname, sex, birthDate, tall, job, introduce, preference, profileImage } = body;

    const isExistNickname = await this.usersRepository.findOneGetByNickName(nickname);

    if (isExistNickname) {
      throw new UnauthorizedException("Nickname is already exist");
    }

    // if (!files) {
    //   throw new UnauthorizedException("프로필 사진을 최소 1장 등록하세요");
    // }

    const users = await this.usersRepository.createUser({
      email,
      nickname,
      sex,
      birthDate,
      tall,
      job,
      introduce,
      preference,
      profileImage,
    });

    return users;
  }

  async getMyUserInfo(id: number) {
    try {
      const user = await this.usersRepository.findById(id);
      if (user.id === id) {
        return user;
      }
    } catch (error) {
      throw new UnauthorizedException("해당 유저 정보가 존재하지 않습니다");
    }
  }

  async putMyUserInfo(id: number, body: any) {
    try {
      const user = await this.usersRepository.findById(id);

      if (user.id === id) {
        const { tall, job, introduce, preference, profileImage } = body;

        const updated = await this.usersRepository.updateUser({
          ...user,
          tall: tall || user.tall,
          job: job || user.job,
          introduce: introduce || user.introduce,
          preference: preference || user.preference,
          profileImage: profileImage || user.profileImage,
        });
        return updated;
      }
    } catch (error) {
      throw new UnauthorizedException("해당 유저 정보가 존재하지 않습니다");
    }
  }
}
