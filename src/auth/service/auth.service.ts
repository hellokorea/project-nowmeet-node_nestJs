import { Injectable, Logger, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  async isUserExist(email: string) {
    try {
      const findUser = await this.usersRepository.findOneGetByEmail(email);

      if (!findUser) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new BadRequestException("유저 검증 도중 문제가 발생했습니다.");
    }
  }

  //^------------------------------------------

  //!Client Disuse Code
  //* Local Use
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
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException("로그인 실패");
    }
  }
}
