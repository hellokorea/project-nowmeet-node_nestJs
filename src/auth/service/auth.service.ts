import { Injectable, UnauthorizedException, InternalServerErrorException, Body } from "@nestjs/common";
import { UsersRepository } from "../../users/database/repository/users.repository";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";
import { RecognizeService } from "./../../recognize/recognize.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
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

  //!Revoke Code
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
