import { Injectable, UnauthorizedException, InternalServerErrorException, Body } from "@nestjs/common";
import { UsersRepository } from "../../users/database/repository/users.repository";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";

import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { RecognizeService } from "./../../recognize/recognize.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly recognizeService: RecognizeService
  ) {}

  async isUserExist(uuid: string) {
    try {
      const user = uuid.includes("@gmail.com")
        ? await this.usersRepository.findOneGetByEmail(uuid)
        : await this.usersRepository.findOneAppleSub(uuid);

      return !!user;
    } catch (e) {
      console.error("isUserExist :", e);
      throw new InternalServerErrorException("유저 검증 도중 서버에 오류가 발생했습니다.");
    }
  }

  //*Internal Use
  async saveToken(@Body() body: { fcmToken: string }, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    const { fcmToken } = body;

    user.fcmToken = fcmToken;

    try {
      await this.usersRepository.saveUser(user);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("FCM 토큰 저장에 실패 했습니다 :", e);
    }
  }

  //
  //
  //Revoke Code
  async googleLogin(req: GoogleRequest) {
    try {
      const {
        user: { email },
      } = req;

      const findUser = await this.usersRepository.findOneGetByEmail(email);

      if (!findUser) {
        return null;
      }

      const googlePayload = { email, sub: findUser.id };

      const jwtToken = {
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_KEY,
          expiresIn: process.env.JWT_EXPIRES,
        }),
      };

      return jwtToken;
    } catch (e) {
      console.error("googleLogin :", e);
      throw new UnauthorizedException("로그인 실패");
    }
  }
}
