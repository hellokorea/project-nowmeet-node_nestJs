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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const success_interceptor_1 = require("../../common/interceptors/success.interceptor");
const users_create_dto_1 = require("../dtos/request/users.create.dto");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const user_locationResponse_dto_1 = require("../dtos/response/user.locationResponse.dto");
const user_putMyInfo_dto_1 = require("../dtos/request/user.putMyInfo.dto");
const user_ghostMode_dto_1 = require("../dtos/request/user.ghostMode.dto");
const jwt_guard_1 = require("../../auth/jwt/jwt.guard");
const user_signup_service_1 = require("../service/user.signup.service");
const user_map_service_1 = require("../service/user.map.service");
const user_account_service_1 = require("../service/user.account.service");
let UsersController = class UsersController {
    constructor(userSignupService, userMapSerivce, userAccountService) {
        this.userSignupService = userSignupService;
        this.userMapSerivce = userMapSerivce;
        this.userAccountService = userAccountService;
    }
    createUser(body, files, request) {
        return this.userSignupService.createUser(body, files, request);
    }
    nicknameDuplicate(nickname) {
        return this.userSignupService.nicknameDuplicate(nickname);
    }
    UserLocationRefresh(lon, lat, req, request) {
        return this.userMapSerivce.refreshUserLocation(lon, lat, req, request);
    }
    putGhostMode(setting, req) {
        return this.userMapSerivce.putGhostMode(setting, req);
    }
    getMyUserInfo(req) {
        return this.userAccountService.getMyUserInfo(req);
    }
    putMyJobInfo(body, req) {
        return this.userAccountService.putMyJobInfo(body, req);
    }
    putMyIntroInfo(body, req) {
        return this.userAccountService.putMyIntroduceInfo(body, req);
    }
    putMyPreInfo(body, req) {
        return this.userAccountService.putMyPreferenceInfo(body, req);
    }
    putMyProfileSecond(index, req, files) {
        return this.userAccountService.putMyProfileImageAtIndex(index, req, files);
    }
    deleteUserProfilesKey(index, req) {
        return this.userAccountService.deleteUserProfilesKey(index, req);
    }
    deleteAccount(req) {
        return this.userAccountService.deleteAccount(req);
    }
    deleteMatchChats(req) {
        return this.userAccountService.deleteMatchChats(req);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "회원가입" }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("profileImages")),
    (0, common_1.Post)("signup"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_create_dto_1.UserCreateDto, Array, Request]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: Boolean }),
    (0, swagger_1.ApiOperation)({ summary: "회원가입 시 닉네임 중복 체크" }),
    (0, common_1.Get)("signup/nickname/:nickname"),
    __param(0, (0, common_1.Param)("nickname")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "nicknameDuplicate", null);
__decorate([
    (0, swagger_1.ApiResponse)({
        description: "유저의 좌표 위치를 최신화하고, 반경 2km 이내의 모든 유저 정보를 반환한다",
        type: user_locationResponse_dto_1.RefreshLocationUserResDto,
    }),
    (0, swagger_1.ApiOperation)({ summary: "위치 최신화 및 주변 유저 탐색" }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Get)("location/:lon/:lat"),
    __param(0, (0, common_1.Param)("lon")),
    __param(1, (0, common_1.Param)("lat")),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Request]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "UserLocationRefresh", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "유령 모드 On/Off" }),
    (0, swagger_1.ApiBody)({ type: user_ghostMode_dto_1.GhostModeDto }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Put)("ghostMode"),
    __param(0, (0, common_1.Body)("setting")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_ghostMode_dto_1.GhostModeDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "putGhostMode", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "내 프로필 정보 조회" }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Get)("me"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyUserInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "내 프로필 직업 수정" }),
    (0, swagger_1.ApiBody)({ type: user_putMyInfo_dto_1.UpdateJobDto }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Put)("me/update/job"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_putMyInfo_dto_1.UpdateJobDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "putMyJobInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "내 프로필 자기소개 수정" }),
    (0, swagger_1.ApiBody)({ type: user_putMyInfo_dto_1.UpdateIntroduceDto }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Put)("me/update/introduce"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_putMyInfo_dto_1.UpdateIntroduceDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "putMyIntroInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "내 프로필 취향 수정" }),
    (0, swagger_1.ApiBody)({ type: user_putMyInfo_dto_1.UpdatePreferenceDto }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Put)("me/update/preference"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_putMyInfo_dto_1.UpdatePreferenceDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "putMyPreInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "내 프로필 사진 추가 및 수정" }),
    (0, swagger_1.ApiBody)({ type: user_putMyInfo_dto_1.UpdateProfileDto, isArray: true }),
    (0, swagger_1.ApiParam)({ name: "index", description: "사진 추가 및 변경할 Index 입력", type: Number }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("profileImage")),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Put)("me/update/profileImage/:index"),
    __param(0, (0, common_1.Param)("index")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Array]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "putMyProfileSecond", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: "내 프로필 사진 삭제",
    }),
    (0, swagger_1.ApiParam)({ name: "index", description: "삭제 할 Index 입력", type: Number }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Put)("me/delete/profileImage/:index"),
    __param(0, (0, common_1.Param)("index")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteUserProfilesKey", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "내 계정 삭제" }),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.Delete)("me/delete/account"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Delete)("delete/test"),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteMatchChats", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("users"),
    (0, common_1.UseInterceptors)(success_interceptor_1.SuccessInterceptor),
    __metadata("design:paramtypes", [user_signup_service_1.UserSignupService,
        user_map_service_1.UserMapService,
        user_account_service_1.UserAccountService])
], UsersController);
//# sourceMappingURL=users.controller.js.map