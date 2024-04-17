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
exports.UserSignupService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const users_repository_1 = require("../database/repository/users.repository");
const aws_service_1 = require("../../aws.service");
let UserSignupService = class UserSignupService {
    constructor(usersRepository, awsService) {
        this.usersRepository = usersRepository;
        this.awsService = awsService;
    }
    async createUser(body, files, request) {
        let { nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude } = body;
        const headrsAuth = request.headers.authorization;
        const token = headrsAuth.split(" ")[1];
        const decoded = jwt.decode(token);
        const issuer = decoded.iss;
        if (!issuer) {
            throw new common_1.UnauthorizedException("유효하지 않는 토큰 발급자 입니다.");
        }
        let email;
        let sub;
        if (issuer.includes("accounts.google.com")) {
            email = decoded.email;
        }
        if (issuer.includes("appleid.apple.com")) {
            sub = decoded.sub;
            const appleEmail = decoded.email;
            console.log(`apple Email : \n ${appleEmail}`);
            if (appleEmail === null) {
                const randomAlg1 = Date.now().toString().slice(0, 5);
                const randomAlg2 = Math.floor(Math.random() * 89999 + 10000);
                email = (randomAlg1 + randomAlg2 + "@icloud.com").toString();
            }
            else {
                email = appleEmail;
            }
        }
        const isExistNickname = await this.usersRepository.findOneByNickname(nickname);
        if (isExistNickname) {
            throw new common_1.BadRequestException("이미 존재하는 닉네임 입니다");
        }
        if (!files.length) {
            throw new common_1.BadRequestException("프로필 사진을 최소 1장 등록하세요");
        }
        try {
            const uploadUserProfiles = await this.awsService.uploadFilesToS3("profileImages", files);
            const userFilesKeys = uploadUserProfiles.map((file) => file.key);
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
        catch (e) {
            console.error("signup :", e);
            throw new common_1.InternalServerErrorException("회원 가입에 실패 했습니다.");
        }
    }
    async nicknameDuplicate(nickname) {
        const isExistNickname = await this.usersRepository.findOneByNickname(nickname);
        return !!isExistNickname;
    }
};
exports.UserSignupService = UserSignupService;
exports.UserSignupService = UserSignupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        aws_service_1.AwsService])
], UserSignupService);
//# sourceMappingURL=user.signup.service.js.map