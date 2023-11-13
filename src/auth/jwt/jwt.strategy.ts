import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Param, Req, UnauthorizedException } from "@nestjs/common";
import { Payload } from "./jwt.payload";
import { UsersRepository } from "src/users/users.repository";
import { User } from "src/users/entity/users.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload): Promise<User> {
    const user = await this.userRepository.findById(payload.sub);

    console.log("jwt검증 로직 유저 :");
    console.log(user);
    console.log(payload.sub);

    if (!user) {
      throw new UnauthorizedException("접근 오류");
    }

    return user;
  }
}
``;
