"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../database/repository/users.repository");
const aws_service_1 = require("../../aws.service");
const user_profile_dto_1 = require("../dtos/response/user.profile.dto");
const recognize_service_1 = require("../../recognize/recognize.service");
const match_profile_service_1 = require("../../match/service/match.profile.service");
let UserMapService = class UserMapService {
    constructor(usersRepository, awsService, recognizeService, matchProfileService) {
        this.usersRepository = usersRepository;
        this.awsService = awsService;
        this.recognizeService = recognizeService;
        this.matchProfileService = matchProfileService;
    }
    async refreshUserLocation(lon, lat, req, request) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const { lonNumber, latNumber } = await this.validatePosition(lon, lat);
        const fcmtoken = request.headers["fcmtoken"];
        if (fcmtoken) {
            await this.recognizeService.saveFcmToken(user.id, fcmtoken);
        }
        try {
            const findMyLocation = await this.usersRepository.findOneUserLocation(user.id);
            if (!findMyLocation) {
                user.longitude = lonNumber;
                user.latitude = latNumber;
            }
            const refreshLocation = await this.usersRepository.refreshUserLocation(user.id, lonNumber, latNumber);
            const SEARCH_BOUNDARY = Number(process.env.SEARCH_BOUNDARY);
            const nearbyUsers = await this.usersRepository.findUsersNearLocaction(lonNumber, latNumber, SEARCH_BOUNDARY);
            const responseUserPromises = nearbyUsers.map(async (user) => {
                const nearbyUsersMatchStatus = await this.matchProfileService.getMatchStatus(user.id, loggedId);
                const userInfo = new user_profile_dto_1.UserProfileResponseDto(user);
                userInfo.matchStatus = nearbyUsersMatchStatus;
                return userInfo;
            });
            const responseUserList = await Promise.all(responseUserPromises);
            const filteredResponseUserList = responseUserList.filter((responseUser) => user.nickname !== responseUser.nickname && responseUser.ghostMode === false && user.sex !== responseUser.sex);
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
        }
        catch (e) {
            console.error("refreshLocation error :", e);
            throw new common_1.BadRequestException("위치 정보를 갱신하는 중 오류가 발생했습니다.");
        }
    }
    async validatePosition(lon, lat) {
        const lonString = parseFloat(lon).toFixed(7);
        const latString = parseFloat(lat).toFixed(7);
        const lonNumber = parseFloat(lonString);
        const latNumber = parseFloat(latString);
        if (isNaN(lonNumber) || isNaN(latNumber)) {
            throw new common_1.BadRequestException("유효하지 않는 좌표 값입니다.");
        }
        if (lonNumber < -180 || lonNumber > 180 || latNumber < -90 || latNumber > 90) {
            throw new common_1.BadRequestException("경도 및 위도의 범위가 올바르지 않습니다. -180 < lon < 180 / -90 < lan < 90");
        }
        return { lonNumber, latNumber };
    }
    async putGhostMode(setting, req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        try {
            setting ? (user.ghostMode = true) : (user.ghostMode = false);
            const ghostSetting = await this.usersRepository.saveUser(user);
            return ghostSetting.ghostMode;
        }
        catch (e) {
            console.error("putGhostMode error :", e);
            throw new common_1.BadRequestException("유령 모드 변경에 실패했습니다.");
        }
    }
};
exports.UserMapService = UserMapService;
exports.UserMapService = UserMapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        aws_service_1.AwsService,
        recognize_service_1.RecognizeService,
        match_profile_service_1.MatchProfileService])
], UserMapService);
//# sourceMappingURL=user.map.service.js.map