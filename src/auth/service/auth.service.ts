import { Injectable, Logger, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { GoogleRequest } from "../dtos/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository, private readonly jwtService: JwtService) {}

  async isUserExist(email: string) {
    const logger = new Logger();
    logger.log(email);

    try {
      const findUser = await this.usersRepository.findOneGetByEmail(email);

      if (!findUser) {
        return null;
      }

      //user exist
      const googlePayload = { email, sub: findUser.id };

      const token = {
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_KEY,
          expiresIn: process.env.JWT_EXPIRES,
        }),
      };

      logger.log(`LoginLog => Email : ${googlePayload.email} || JWT : ${token.token}`);

      return token;
    } catch (error) {
      logger.error(error);
      throw new BadRequestException("잘못된 요청");
    }
  }

  //^------------------------------------------

  async googleLogin(req: GoogleRequest) {
    try {
      const {
        user: { email },
      } = req;

      const findUser = await this.usersRepository.findOneGetByEmail(email);

      // Email Check
      if (!findUser) {
        return { shouldSignUp: true, email };
      }

      //Jwt Generate
      const googlePayload = { email, sub: findUser.id };

      const signupData = {
        shouldSignUp: false,
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_KEY,
          expiresIn: process.env.JWT_EXPIRES,
        }),
      };

      const logger = new Logger();
      logger.log(`LoginLog => Email : ${googlePayload.email} || JWT : ${signupData.token}`);

      return signupData;
    } catch (error) {
      throw new UnauthorizedException("로그인 실패");
    }
  }
}
