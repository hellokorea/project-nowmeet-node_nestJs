import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { UsersRepository } from "../database/repository/users.repository";
import { AwsService } from "src/aws.service";
import { UserCreateDto } from "../dtos/request/users.create.dto";

@Injectable()
export class UserSignupService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly awsService: AwsService
  ) {}

  async createUser(body: UserCreateDto, files: Array<Express.Multer.File>, request: Request) {
    // let { email, nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude, sub, fcmToken } =body;
    let { nickname, sex, birthDate, tall, job, introduce, preference, longitude, latitude } = body;

    const bodyData = body;
    console.log("bodyData :", bodyData);

    let email: string;
    let sub: string;

    const OSinfoParser = JSON.parse(bodyData.OSinfo);

    console.log("OSinfoParser :", OSinfoParser);

    if (OSinfoParser.idToken) {
      // Google user
      email = OSinfoParser.user.email;
    }

    if (OSinfoParser.identityToken) {
      // Apple user
      sub = OSinfoParser.user;
      const appleEmail = OSinfoParser.email;

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

      return {
        users,
        idToken: OSinfoParser.idToken,
        identityToken: OSinfoParser.identityToken,
      };
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
