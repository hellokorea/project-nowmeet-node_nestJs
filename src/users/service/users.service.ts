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
import {
  UpdateIntroduceDto,
  UpdateJobDto,
  UpdatePreferenceDto,
  UpdateProfileDto,
} from "../dtos/request/user.putMyInfo.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";

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

  //common user validate
  async validateUser(id: number) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    return user;
  }
  //--

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
    const user = await this.validateUser(loggedId);

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
        (responseUser) => user.nickname !== responseUser.nickname && responseUser.ghostMode === false
      );

      if (!filteredResponseUserList.length) {
        return null;
      }

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

  async putGhostMode(setting: GhostModeDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    try {
      setting ? (user.ghostMode = true) : (user.ghostMode = false);
      const ghostSetting = await this.usersRepository.updateUser(user);

      return ghostSetting.ghostMode;
    } catch (e) {
      console.error(e);
      throw new BadRequestException("유령 모드 변경에 실패했습니다.");
    }
  }

  //-----------------------My Account Rogic

  async getMyUserInfo(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(loggedId);

    try {
      const preSignedUrl = await this.awsService.createPreSignedUrl(user.profileImages);
      return { user, PreSignedUrl: preSignedUrl };
    } catch (error) {
      console.error(error);
      throw new BadRequestException("유저 정보를 갖고오는데 실패 했습니다.");
    }
  }

  async putMyJobInfo(body: UpdateJobDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const { job } = body;

    user.job = job;

    const updated = await this.usersRepository.updateUser(user);

    return updated.job;
  }

  async putMyIntroduceInfo(body: UpdateIntroduceDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const { introduce } = body;

    user.introduce = introduce;

    const updated = await this.usersRepository.updateUser(user);

    return updated.introduce;
  }

  async putMyPreferenceInfo(body: UpdatePreferenceDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const { preference } = body;

    user.preference = preference;

    const updated = await this.usersRepository.updateUser(user);

    return updated.preference;
  }

  async putMyProfileImageAtIndex(index: number, req: UserRequestDto, files: Array<Express.Multer.File>) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const indexNum = Number(index);

    if (indexNum > 2) {
      throw new BadRequestException("0 ~ 2까지 인덱스를 입력해주세요.");
    }

    try {
      const profileKey = await this.awsService.uploadFilesToS3("profileImages", files);
      const newKey = profileKey[0].key;

      const filterProfileImages = (): string[] => {
        user.profileImages[index] = newKey;
        user.profileImages = user.profileImages.filter((v) => v !== null);

        return user.profileImages;
      };

      if (user.profileImages[index]) {
        const oldeKey = user.profileImages[index];
        await this.awsService.deleteFilesFromS3([oldeKey]);
        filterProfileImages();
      } else {
        filterProfileImages();
      }

      const updated = await this.usersRepository.updateUser(user);

      const preSignedUrl = await this.awsService.createPreSignedUrl(updated.profileImages);

      return {
        updatedUser: updated.profileImages,
        PreSignedUrl: preSignedUrl,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException("유저 프로필 사진 수정 중 문제가 발생했습니다.");
    }
  }

  async deleteUserProfilesKey(index: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const indexNum = Number(index);

    if (indexNum > 2) {
      throw new BadRequestException("1 ~ 2까지 인덱스를 입력해주세요.");
    }

    if (indexNum === 0) {
      throw new BadRequestException("0번째 사진은 삭제가 불가능합니다.");
    }

    try {
      const deleteToKey = user.profileImages[index];

      user.profileImages.splice(index, 1);

      await this.awsService.deleteFilesFromS3([deleteToKey]);

      await this.usersRepository.updateUser(user);

      return { message: "Successfully deleted.", deleteToKey };
    } catch (error) {
      console.error(error);
      throw new BadRequestException("유저 프로필 파일 키 삭제 도중 문제가 발생했습니다.");
    }
  }

  async deleteAccount(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(loggedId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    try {
      await this.connection.transaction(async (txManager) => {
        // 연관된 데이터 삭제
        await this.matchRepository.deleteMatchesByUserId(txManager, loggedId);
        await this.matchRepository.deleteDevMatchesByUserId(txManager, loggedId);
        await this.chatGateway.deleteChatDataByUserId(txManager, loggedId);
        await this.chatGateway.deleteDevChatDataByUserId(txManager, loggedId);
        console.log(`userId: ${loggedId} 번 유저 관련 데이터 삭제 완료`);

        //s3 profileImages 삭제
        await this.awsService.deleteFilesFromS3(user.profileImages);
        console.log(`userId: ${loggedId} 번 s3 프로필 이미지 삭제 완료`);

        // 사용자 삭제
        await this.usersRepository.deleteUser(txManager, user);
        console.log(`userId: ${loggedId} 번 유저 계정 삭제 완료`);
      });

      return { message: `userId: ${loggedId} 번 유저의 계정을 성공적으로 삭제 했습니다` };
    } catch (e) {
      console.error("Error during transaction:", e);
      throw new InternalServerErrorException(`userId: ${loggedId} 번 유저의 계정을 삭제하는 도중 오류가 발생했습니다`);
    }
  }
}
