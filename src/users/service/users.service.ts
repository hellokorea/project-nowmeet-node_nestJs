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

  async UserLocationRefresh(id: number, x: string, y: string) {
    const user = await this.usersRepository.findById(id);
    console.log(user);

    const xCoordString = parseFloat(x).toFixed(6);
    const yCoordString = parseFloat(y).toFixed(6);

    const xCoordNumber = parseFloat(xCoordString);
    const yCoordNumber = parseFloat(yCoordString);

    console.log(`type : ${typeof xCoordNumber}, value: ${xCoordNumber}`);
    console.log(`type : ${typeof yCoordNumber}, value: ${yCoordNumber}`);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    try {
      const findUserLocation = await this.usersRepository.findUserLocation(id);

      if (!findUserLocation) {
        throw new NotFoundException("유저의 위치 정보 값이 존재하지 않습니다");
      }
      console.log(findUserLocation);

      const locationRefresh = await this.usersRepository.refreshUserLocation(id, xCoordNumber, yCoordNumber);

      return {
        user: user.id,
        latitude: locationRefresh.latitude,
        longitude: locationRefresh.longitude,
      };
    } catch (error) {
      console.log(error);
    }

    //여기서부터 유저 좌표를 기준으로 다른 유저정보 뿌려주는 연산 로직 추가
  }

  async createUser(body: UserCreateDto, files: Array<Express.Multer.File>) {
    const { email, nickname, sex, birthDate, tall, job, introduce, preference, latitude, longitude } = body;

    const isExistNickname = await this.usersRepository.findOneGetByNickName(nickname);

    if (isExistNickname) {
      throw new BadRequestException("이미 존재하는 닉네임 입니다");
    }

    if (!files) {
      throw new UnauthorizedException("프로필 사진을 최소 1장 등록하세요");
    }

    const users = await this.usersRepository.createUser({
      email,
      nickname,
      sex,
      birthDate,
      tall,
      job,
      introduce,
      preference,
      latitude,
      longitude,
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

  async getMyUserInfo(req: UserRequestDto) {
    const userId = req.user.id;
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id === userId) {
      return user;
    }
  }

  async putMyUserInfo(body: any, req: UserRequestDto) {
    const userId = req.user.id;
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id === userId) {
      const { job, introduce, preference } = body;

      const updated = await this.usersRepository.updateUser({
        ...user,
        job: job || user.job,
        introduce: introduce || user.introduce,
        preference: preference || user.preference,
      });
      return updated;
    }
  }

  async deleteAccount(req: UserRequestDto) {
    const userId = req.user.id;
    const user = await this.usersRepository.findById(userId);

    console.log(userId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id === userId) {
      try {
        await this.connection.transaction(async (txManager) => {
          await this.matchRepository.deleteMatchesByUserId(txManager, user.id);
          await this.matchRepository.deleteDevMatchesByUserId(txManager, user.id);
          await this.chatGateway.deleteChatDataByUserId(txManager, user.id);
          await this.chatGateway.deleteDevChatDataByUserId(txManager, user.id);
          await this.usersRepository.deleteUser(txManager, user);
          console.log(`userId: ${userId} 번 유저 데이터 전부 삭제 완료`);
        });
        console.log(`userId: ${userId} 번 유저 계정 삭제 완료`);

        return { message: `userId: ${userId} 번 유저의 계정을 성공적으로 삭제 했습니다` };
        //
      } catch (error) {
        console.error("Error during transaction:", error);

        throw new InternalServerErrorException(`userId: ${userId} 번 유저의 계정을 삭제하는 도중 오류가 발생했습니다`);
      }
    }
  }
}
