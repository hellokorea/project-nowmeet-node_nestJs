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
import { UserProfileResponseDto } from "../dtos/response/user.profile.dto";
import { AwsService } from "src/aws.service";
import { UpdateIntroduceDto, UpdateJobDto, UpdatePreferenceDto } from "../dtos/request/user.putMyInfo.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";
import { AuthService } from "src/auth/service/auth.service";
import * as jwt from "jsonwebtoken";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly matchRepository: MatchRepository,
    private readonly chatGateway: ChatGateway,
    private readonly connection: Connection,
    private readonly awsService: AwsService,
    private readonly authService: AuthService
  ) {}

  async getAllUsers() {
    return this.usersRepository.findAll();
  }

  //-----------------------Signup Logic
  async createUser(body: UserCreateDto, files: Array<Express.Multer.File>, request: Request) {
    let { nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude } = body;

    //*Jwt Furcate Rogic
    const headrsAuth = (request.headers as { authorization?: string }).authorization;
    console.log(`헤더 \n ${headrsAuth}`);
    const token = headrsAuth.split(" ")[1];
    console.log(`토큰 \n ${token}`);
    const decoded = jwt.decode(token);

    console.log(`디코딩 \n ${JSON.stringify(decoded)})}`);

    const issuer = (decoded as jwt.JwtPayload).iss;

    if (!issuer) {
      throw new UnauthorizedException("유효하지 않는 토큰 발급자 입니다.");
    }

    let email: string;
    let sub: string;

    //Google Issuer
    if (issuer.includes("accounts.google.com")) {
      email = (decoded as jwt.JwtPayload).email;
    }

    //Apple Issuer
    if (issuer.includes("appleid.apple.com")) {
      sub = (decoded as jwt.JwtPayload).sub;

      const appleEmail = (decoded as jwt.JwtPayload).email;

      console.log(`apple Email : \n ${appleEmail}`);

      if (appleEmail === null) {
        //Hide
        const randomAlg1 = Date.now().toString().slice(0, 5);
        const randomAlg2 = Math.floor(Math.random() * 89999 + 10000);
        email = (randomAlg1 + randomAlg2 + "@icloud.com").toString();
      } else {
        //Don't Hide
        email = appleEmail;
      }
    }
    //*

    //*Nickname Data
    const isExistNickname = await this.usersRepository.findByNickname(nickname);

    if (isExistNickname) {
      throw new BadRequestException("이미 존재하는 닉네임 입니다");
    }
    //*

    //*Profile Img Data
    if (!files.length) {
      throw new BadRequestException("프로필 사진을 최소 1장 등록하세요");
    }

    const uploadUserProfiles = await this.awsService.uploadFilesToS3("profileImages", files);

    const userFilesKeys = uploadUserProfiles.map((filesObj) => {
      return filesObj.key;
    });
    //*

    //*Save User Data
    const users = await this.usersRepository.saveUser({
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
      sub,
      profileImages: userFilesKeys,
    });

    return users;
  }

  async nicknameDuplicate(nickname: string) {
    const isExistNickname = await this.usersRepository.findByNickname(nickname);

    if (!isExistNickname) {
      return false;
    } else {
      return true;
    }
  }

  //common user validate--
  async validateUser(id: number) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    return user;
  }
  //--

  //-----------------------Location Logic
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
      const ghostSetting = await this.usersRepository.saveUser(user);

      return ghostSetting.ghostMode;
    } catch (e) {
      console.error(e);
      throw new BadRequestException("유령 모드 변경에 실패했습니다.");
    }
  }

  //-----------------------My Account Logic
  async getMyUserInfo(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    try {
      user.profileImages = Array(3)
        .fill("undefined")
        .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));

      const preSignedUrl = await this.awsService.createPreSignedUrl(user.profileImages);
      return { user, PreSignedUrl: preSignedUrl };
    } catch (error) {
      console.error(error);
      throw new BadRequestException("내 정보를 갖고오는데 실패 했습니다.");
    }
  }

  async putMyJobInfo(body: UpdateJobDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const { job } = body;

    user.job = job;

    const updated = await this.usersRepository.saveUser(user);

    return updated.job;
  }

  async putMyIntroduceInfo(body: UpdateIntroduceDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const { introduce } = body;

    user.introduce = introduce;

    const updated = await this.usersRepository.saveUser(user);

    return updated.introduce;
  }

  async putMyPreferenceInfo(body: UpdatePreferenceDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.validateUser(loggedId);

    const { preference } = body;

    user.preference = preference;

    const updated = await this.usersRepository.saveUser(user);

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

      //File Change--
      const filterUserProifleImages = () => {
        user.profileImages[index] = newKey;
        user.profileImages = user.profileImages.filter((v) => v !== null);

        return user.profileImages;
      };

      if (user.profileImages[index]) {
        const oldeKey = user.profileImages[index];
        await this.awsService.deleteFilesFromS3([oldeKey]);
        filterUserProifleImages();
      } else {
        filterUserProifleImages();
      }

      const updated = await this.usersRepository.saveUser(user);
      //--

      //Res Array--
      user.profileImages = Array(3)
        .fill("undefined")
        .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));
      //--

      const preSignedUrl = await this.awsService.createPreSignedUrl(updated.profileImages);

      return {
        updatedUser: user.profileImages,
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

    if (indexNum === 0) {
      throw new BadRequestException("0번째 사진은 삭제가 불가능합니다.");
    }

    if (indexNum > 2) {
      throw new BadRequestException("1 ~ 2까지 인덱스를 입력해주세요.");
    }

    if (user.profileImages[index] === undefined) {
      throw new NotFoundException("해당 Index는 비어있으므로 삭제가 되지 않습니다.");
    }

    try {
      //File Delete--
      const deleteToKey = user.profileImages[index];
      await this.awsService.deleteFilesFromS3([deleteToKey]);

      user.profileImages.splice(index, 1);
      user.profileImages = user.profileImages.filter((v) => v !== null);
      await this.usersRepository.saveUser(user);
      //--

      //Res Array--
      user.profileImages = Array(3)
        .fill("undefined")
        .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));
      //--

      return { message: "Successfully deleted.", deleteKey: deleteToKey, userProfileImages: user.profileImages };
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
