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
import { UserProfileResponseDto } from "../dtos/user.profile.dto";

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

  //-----------------------Signup Rogic
  async createUser(body: UserCreateDto, files: Array<Express.Multer.File>) {
    const { email, nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude } = body;

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
      longitude,
      latitude,
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

  //-----------------------Location Rogic

  async refreshUserLocation(nickname: string, x: string, y: string, req: UserRequestDto) {
    const xCoordString = parseFloat(x).toFixed(7);
    const yCoordString = parseFloat(y).toFixed(7);

    const xCoordNumber = parseFloat(xCoordString);
    const yCoordNumber = parseFloat(yCoordString); //좌표 공통 함수로 뺄까,,

    if (isNaN(xCoordNumber) || isNaN(yCoordNumber)) {
      throw new BadRequestException("유효하지 않는 좌표 값입니다.");
    }

    if (yCoordNumber < -90 || yCoordNumber > 90 || xCoordNumber < -180 || xCoordNumber > 180) {
      throw new BadRequestException("경도 및 위도의 범위가 올바르지 않습니다. -180 < x < 180 / -90 < y < 90");
    }

    const user = await this.usersRepository.findByNickname(nickname);
    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    const loggedId = req.user.id;
    if (loggedId !== user.id) {
      throw new UnauthorizedException("요청한 사용자의 권한이 없습니다.");
    }

    try {
      const findMyLocation = await this.usersRepository.findUserLocation(user.id);

      if (!findMyLocation) {
        user.longitude = xCoordNumber;
        user.latitude = yCoordNumber;
      }

      const refreshLocation = await this.usersRepository.refreshUserLocation(user.id, xCoordNumber, yCoordNumber);

      const SEARCH_BOUNDARY = Number(process.env.SEARCH_BOUNDARY);

      let nearbyUsers = await this.usersRepository.findUsersNearLocaction(xCoordNumber, yCoordNumber, SEARCH_BOUNDARY);

      const responseUserList = nearbyUsers.map((user) => new UserProfileResponseDto(user));
      const filteredResponseUserList = responseUserList.filter(
        (responseUser) => user.nickname !== responseUser.nickname
      );

      return {
        myId: user.id,
        myLongitude: refreshLocation.longitude,
        myLatitude: refreshLocation.latitude,
        nearbyUsers: filteredResponseUserList,
      };
    } catch (error) {
      console.error("refreshLocation error:", error);
      throw new BadRequestException("위치 정보를 갱신하는 중 오류가 발생했습니다.");
    }
  }

  //-----------------------My Account Rogic

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
