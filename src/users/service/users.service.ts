import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { UserCreateDto } from "../dtos/request/users.create.dto";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { MatchRepository } from "./../../match/match.repository";
import { ChatGateway } from "src/chat/chat.gateway";
import { Connection } from "typeorm";
import { UserNicknameDuplicateDto } from "../dtos/request/users.nickname.duplicate";
import { UserProfileResponseDto } from "../dtos/response/user.profile.dto";
import { AwsService } from "src/aws.service";
import { isEqual } from "lodash";
import { UpdateProfileDto } from "../dtos/request/user.putMyInfo.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly matchRepository: MatchRepository,
    private readonly chatGateway: ChatGateway,
    private readonly connection: Connection,
    private readonly awsService: AwsService
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

    if (!files.length) {
      throw new BadRequestException("프로필 사진을 최소 1장 등록하세요");
    }

    const uploadUserProfiles = await this.awsService.uploadFilesToS3("profileImages", files);

    const userFilesKeys = uploadUserProfiles.map((filesObj) => {
      return filesObj.key;
    });

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
      profileImages: userFilesKeys,
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

  async refreshUserLocation(lon: string, lat: string, req: UserRequestDto) {
    const xCoordString = parseFloat(lon).toFixed(7);
    const yCoordString = parseFloat(lat).toFixed(7);

    const xCoordNumber = parseFloat(xCoordString);
    const yCoordNumber = parseFloat(yCoordString);

    if (isNaN(xCoordNumber) || isNaN(yCoordNumber)) {
      throw new BadRequestException("유효하지 않는 좌표 값입니다.");
    }

    if (yCoordNumber < -90 || yCoordNumber > 90 || xCoordNumber < -180 || xCoordNumber > 180) {
      throw new BadRequestException("경도 및 위도의 범위가 올바르지 않습니다. -180 < x < 180 / -90 < y < 90");
    }

    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(loggedId);
    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

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

      const profilesKey = filteredResponseUserList.map((users) => users.profileImages);
      const preSignedUrl = await this.awsService.createPreSignedUrl(profilesKey.flat());

      let currentIndex = 0;

      filteredResponseUserList.forEach((user) => {
        const numProfileImages = user.profileImages.length;
        const userUrls = preSignedUrl.slice(currentIndex, currentIndex + numProfileImages);

        user.PreSignedUrl = userUrls;
        currentIndex += numProfileImages;
      });

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
    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(loggedId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id !== loggedId) {
      throw new BadRequestException("잘못된 요청입니다.");
    }

    try {
      console.log("나의 유저 정보");
      console.log(user);

      const preSignedUrl = await this.awsService.createPreSignedUrl(user.profileImages);

      console.log(preSignedUrl);

      return { user, PreSignedUrl: preSignedUrl };
    } catch (error) {
      console.error(error);
      throw new BadRequestException("유저 정보를 갖고오는데 실패 했습니다.");
    }
  }

  async putMyUserInfo(body: UpdateProfileDto, req: UserRequestDto, files: Array<Express.Multer.File>) {
    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(loggedId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (user.id === loggedId) {
      const { job, introduce, preference } = body;
      const MAX_PROFILE_IMAGES = 3;

      if (files && files.length) {
        if (files.length > MAX_PROFILE_IMAGES) {
          throw new BadRequestException(`최대 ${MAX_PROFILE_IMAGES}개의 이미지만 업로드 가능합니다.`);
        }
        const uploadFiles = await this.awsService.uploadFilesToS3("profileImages", files);

        const newKeys = uploadFiles.map((obj) => obj.key);

        user.profileImages = this.awsService.replaceProfileImages(user.profileImages, newKeys);
      }

      const updated = await this.usersRepository.updateUser({
        ...user,
        job: job || user.job,
        introduce: introduce || user.introduce,
        preference: preference || user.preference,
        profileImages: user.profileImages,
      });

      const preSignedUrl = await this.awsService.createPreSignedUrl(updated.profileImages);

      return {
        updatedUser: updated,
        PreSignedUrl: preSignedUrl,
      };
    }
  }

  async deleteUserProfilesKey(req: UserRequestDto, deleteKey: string) {
    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(loggedId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    if (!user.profileImages.includes(deleteKey)) {
      throw new BadRequestException("해당 키는 유저의 프로필에 존재하지 않습니다.");
    }
    try {
      const keyToDelete = deleteKey;

      user.profileImages = user.profileImages.filter((key) => key !== deleteKey);

      await this.usersRepository.updateUser(user);

      await this.awsService.deleteFilesFromS3([keyToDelete]);

      return { message: "Successfully deleted.", key: keyToDelete };
    } catch (error) {
      console.error(error);
      throw new BadRequestException("유저 프로필 파일 키 삭제 도중 문제가 발생했습니다.");
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
