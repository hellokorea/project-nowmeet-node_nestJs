import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Param, Req, UnauthorizedException } from "@nestjs/common";
import { Payload } from "./jwt.payload";
import { UsersRepository } from "src/users/users.repository";
import { User } from "src/users/entity/users.entity";
import * as jwksRsa from "jwks-rsa";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: process.env.JWKS_URI, // jwt 구글 공개 키
      }),
      ignoreExpiration: false,
      issuer: process.env.ISSUER, // jwt 공식 발행자
      audience: process.env.WEB_CLIENTID, //클라이언트 발급 ID
      algorithms: ["RS256"],
    });
  }

  async validate(payload: Payload): Promise<User> {
    const user = await this.userRepository.findOneGetByEmail(payload.email);

    console.log("jwt검증 로직 유저 :");
    console.log(user);
    console.log(payload.email);
    console.log(payload.sub);

    if (!user) {
      throw new UnauthorizedException("접근 오류");
    }

    return user;
  }
}
