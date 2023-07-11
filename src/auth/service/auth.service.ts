import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { GoogleRequest } from "../auth.interface";
import { JwtService } from "@nestjs/jwt";
import { UserCreateDto } from "src/users/dtos/users.create.dto";

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository, private readonly jwtService: JwtService) {}

  async googleLogin(req: GoogleRequest) {
    try {
      const {
        user: { email },
      } = req;

      const findUser = await this.usersRepository.findOneGetByEmail(email);

      // Email Check
      if (!findUser) {
        //email이 없으면 신규 유저 이므로 회원 가입 페이지로 리다이렉션
        return { shouldSignUp: true };
      }

      //Jwt Generate
      const googlePayload = { email, sub: findUser.id };

      return {
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_KEY,
          expiresIn: process.env.JWT_EXPIRES,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid member information");
    }
  }
}
