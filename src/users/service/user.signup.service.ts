import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserCreateDto } from "../dtos/request/users.create.dto";
import * as jwt from "jsonwebtoken";
import { UsersRepository } from "../database/repository/users.repository";
import { AwsService } from "src/aws.service";

@Injectable()
export class UserSignupService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly awsService: AwsService
  ) {}

  async createUser(body: UserCreateDto, files: Array<Express.Multer.File>, request: Request) {
    // let { email, nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude, sub, fcmToken } =  body;
    let { nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude } = body;

    const headrsAuth = (request.headers as { authorization?: string }).authorization;

    console.log("request.headers :", request.headers);
    console.log("headrsAuth : ", headrsAuth);
    const token = headrsAuth.split(" ")[1];
    console.log("token :", token);

    const decoded = jwt.decode(token);
    const issuer = (decoded as jwt.JwtPayload).iss;

    if (!issuer) {
      throw new UnauthorizedException("유효하지 않는 토큰 발급자 입니다.");
    }

    let email: string;
    let sub: string;

    // Google user
    if (issuer.includes("accounts.google.com")) {
      email = (decoded as jwt.JwtPayload).email;
    }

    // Apple user
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

    console.log("issuer :", issuer);

    const isExistNickname = await this.usersRepository.findOneByNickname(nickname);

    if (isExistNickname) {
      throw new BadRequestException("이미 존재하는 닉네임 입니다");
    }

    if (!files.length) {
      throw new BadRequestException("프로필 사진을 최소 1장 등록하세요");
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
    } catch (e) {
      console.error("signup :", e);
      throw new InternalServerErrorException("회원 가입에 실패 했습니다.");
    }
  }

  async nicknameDuplicate(nickname: string) {
    const isExistNickname = await this.usersRepository.findOneByNickname(nickname);

    return !!isExistNickname;
  }
}
