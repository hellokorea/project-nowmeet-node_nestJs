import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersRepository } from "../database/repository/users.repository";
import { AwsService } from "src/aws.service";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { UserProfileResponseDto } from "../dtos/response/user.profile.dto";
import { GhostModeDto } from "../dtos/request/user.ghostMode.dto";
import { RecognizeService } from "src/recognize/recognize.service";
import { MatchProfileService } from "src/match/service/match.profile.service";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class UserMapService {
  private SEARCH_BOUNDARY = Number(process.env.SEARCH_BOUNDARY);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly awsService: AwsService,
    private readonly recognizeService: RecognizeService,
    private readonly matchProfileService: MatchProfileService,
    private readonly redisService: RedisService
  ) {}

  async refreshUserLocation(lon: string, lat: string, req: UserRequestDto, request: Request) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);
    const { lonNumber, latNumber } = await this.validatePosition(lon, lat);

    const fcmtoken = request.headers["fcmtoken"];
    const isTokenPromise = fcmtoken ? this.recognizeService.saveFcmToken(user.id, fcmtoken) : null;

    try {
      await Promise.all([
        this.redisService.updateUserLocation(user.id, lonNumber, latNumber),
        this.usersRepository.updateUserLocation(user.id, lonNumber, latNumber),
        isTokenPromise,
      ]);

      const redisSearch = await this.redisService.findNearRedisbyUsers(lonNumber, latNumber, this.SEARCH_BOUNDARY);
      const userIds = redisSearch.map((item) => parseInt(item[0].replace("user:", ""))).filter((id) => id !== user.id);

      let nearbyUsers = await this.usersRepository.findByUserIds(userIds);
      nearbyUsers = nearbyUsers.filter((nearbyUser) => !nearbyUser.ghostMode && nearbyUser.id !== loggedId);

      console.log("nearbyUsers :", nearbyUsers);

      if (!nearbyUsers.length) {
        nearbyUsers = await this.usersRepository.findUsersNearLocaction(lonNumber, latNumber, this.SEARCH_BOUNDARY);
        console.log("레디스에 데이터가 없을 수도 있으니 mysql로 탐색!");
      }

      const responseUserPromises = nearbyUsers.map(async (user) => {
        const nearbyUsersMatchStatus = await this.matchProfileService.getMatchStatus(user.id, loggedId);
        const userInfo = new UserProfileResponseDto(user);

        userInfo.matchStatus = nearbyUsersMatchStatus;

        return userInfo;
      });

      const responseUserList = await Promise.all(responseUserPromises);

      const filteredResponseUserList = responseUserList.filter(
        (responseUser) => user.nickname !== responseUser.nickname && user.sex !== responseUser.sex
      );

      let nearUsers;

      if (!filteredResponseUserList.length) {
        nearUsers = null;
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

      nearUsers = filteredResponseUserList;

      return {
        myId: user.id,
        myLongitude: user.longitude,
        myLatitude: user.latitude,
        nearbyUsers: nearUsers,
      };
    } catch (e) {
      console.error("refreshLocation error :", e);
      throw new BadRequestException("위치 정보를 갱신하는 중 오류가 발생했습니다.");
    }
  }

  async validatePosition(lon: string, lat: string) {
    const lonString = parseFloat(lon).toFixed(7);
    const latString = parseFloat(lat).toFixed(7);

    const lonNumber = parseFloat(lonString);
    const latNumber = parseFloat(latString);

    if (isNaN(lonNumber) || isNaN(latNumber)) {
      throw new BadRequestException("유효하지 않는 좌표 값입니다.");
    }

    // redis 위도 값 범위
    if (lonNumber < -180 || lonNumber > 180 || latNumber < -85.05112878 || latNumber > 85.05112878) {
      throw new BadRequestException("경도 및 위도의 범위가 올바르지 않습니다. -180 < lon < 180 / -90 < lan < 90");
    }

    return { lonNumber, latNumber };
  }

  async putGhostMode(setting: GhostModeDto, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    try {
      setting ? (user.ghostMode = true) : (user.ghostMode = false);
      const ghostSetting = await this.usersRepository.saveUser(user);

      return ghostSetting.ghostMode;
    } catch (e) {
      console.error("putGhostMode error :", e);
      throw new BadRequestException("유령 모드 변경에 실패했습니다.");
    }
  }
}
