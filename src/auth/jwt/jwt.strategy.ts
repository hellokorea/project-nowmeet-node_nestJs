import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Param, Req, UnauthorizedException } from "@nestjs/common";
import { Payload } from "./jwt.payload";
import { UsersRepository } from "src/users/users.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload, @Req() req: Request) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("접근 오류");
    }

    return user;
  }
}
