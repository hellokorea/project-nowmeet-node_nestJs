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
    //* Local Use
    // super({
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Client에서 헤더에 넣어 Jwt를 추출하겠다.
    //   secretOrKey: process.env.JWT_KEY, // Env 환경변수 설정을 통해 보안 유지 필요
    //   ignoreExpiration: false, // 만료된 토큰은 받지 않겠다.
    // });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: process.env.JWKS_URI, // jwt 구글 퍼블릭 서명
      }),
      ignoreExpiration: false,
      issuer: process.env.ISSUER, // jwt 키 발행자
      audience: process.env.WEB_CLIENTID, //클라이언트 발급 ID
      algorithms: ["RS256"],
    });
  }

  async validate(payload: Payload): Promise<User> {
    //* Local Use
    // const user = await this.userRepository.findById(payload.sub);

    const user = await this.userRepository.findOneGetByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException("접근 오류");
    }

    return user;
  }
}
