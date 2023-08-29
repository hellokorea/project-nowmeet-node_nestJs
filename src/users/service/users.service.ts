import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { UserCreateDto } from "../dtos/users.create.dto";
import { UserRequestDto } from "../dtos/users.request.dto";
import { MatchRepository } from "./../../match/match.repository";
import { ChatGateway } from "src/chat/chat.gateway";
import { Connection } from "typeorm";
import { UserNicknameDuplicateDto } from "../dtos/users.nickname.duplicate";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly matchRepository: MatchRepository,
    private readonly chatGateway: ChatGateway,
    private readonly connection: Connection
  ) {}

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  async createUser(
    body: UserCreateDto //files: Array<Express.Multer.File>
  ) {
    const { email, nickname, sex, birthDate, tall, job, introduce, preference, profileImage } = body;

    const isExistNickname = await this.usersRepository.findOneGetByNickName(nickname);

    if (isExistNickname) {
      throw new BadRequestException("이미 존재하는 닉네임 입니다");
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

  async nicknameDuplicate(body: UserNicknameDuplicateDto) {
    const { nickname } = body;

    const isExistNickname = await this.usersRepository.findOneGetByNickName(nickname);

    if (!isExistNickname) {
      return false;
    } else {
      return true;
    }
  }

  async getMyUserInfo(id: number, req: UserRequestDto) {
    const user = await this.usersRepository.findById(id);
    const userId = req.user.id;

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id === userId) {
      return user;
    }

    throw new UnauthorizedException("요청된 유저 토큰이 유효하지 않습니다");
  }

  async putMyUserInfo(id: number, body: any, req: UserRequestDto) {
    const user = await this.usersRepository.findById(id);
    const userId = req.user.id;

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

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
    }

    throw new UnauthorizedException("요청된 유저 토큰이 유효하지 않습니다");
  }

  async deleteAccount(id: number, req: UserRequestDto) {
    const user = await this.usersRepository.findById(id);
    const userId = req.user.id;

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id === userId) {
      try {
        await this.connection.transaction(async (txManager) => {
          await this.matchRepository.deleteMatchesByUserId(txManager, id);
          await this.matchRepository.deleteDevMatchesByUserId(txManager, id);
          await this.chatGateway.deleteChatDataByUserId(txManager, id);
          await this.chatGateway.deleteDevChatDataByUserId(txManager, id);
          await this.usersRepository.deleteUser(txManager, user);
          console.log(`userId: ${id} 번 유저 데이터 전부 삭제 완료`);
        });
        console.log(`userId: ${id} 번 유저 계정 삭제 완료`);

        return { message: `userId: ${id} 번 유저의 계정을 성공적으로 삭제 했습니다` };
        //
      } catch (error) {
        console.error("Error during transaction:", error);

        throw new InternalServerErrorException(`userId: ${id} 번 유저의 계정을 삭제하는 도중 오류가 발생했습니다`);
      }
    }
    throw new UnauthorizedException("요청된 유저 토큰이 유효하지 않습니다");
  }
}
