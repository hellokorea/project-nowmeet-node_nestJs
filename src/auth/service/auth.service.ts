import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { GoogleRequest } from "../auth.interface";
import { JwtService } from "@nestjs/jwt";

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
        return { shouldSignUp: true, email };
      }

      //Jwt Generate
      const googlePayload = { email, sub: findUser.id };

      return {
        shouldSignUp: false,
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
