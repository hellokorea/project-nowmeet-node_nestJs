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
      throw new UnauthorizedException("이미 존재하는 닉네임 입니다");
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

  async getMyUserInfo(id: number, req: any) {
    try {
      const user = await this.usersRepository.findById(id);
      const userId = req.user.id;

      if (user.id === userId) {
        return user;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      throw new UnauthorizedException("요청 된 토큰이 유효하지 않습니다");
    }
  }

  async putMyUserInfo(id: number, body: any, req: any) {
    try {
      const user = await this.usersRepository.findById(id);
      const userId = req.user.id;

      if (user.id === userId) {
        const { job, introduce, preference, profileImage } = body;

        const updated = await this.usersRepository.updateUser({
          ...user,
          job: job || user.job,
          introduce: introduce || user.introduce,
          preference: preference || user.preference,
          profileImage: profileImage || user.profileImage,
        });
        return updated;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      throw new UnauthorizedException("요청 된 토큰이 유효하지 않습니다");
    }
  }
}
