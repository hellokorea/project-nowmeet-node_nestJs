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
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   secretOrKey: process.env.JWT_KEY,
    //   ignoreExpiration: false,
    // });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: process.env.JWKS_URI,
      }),
      ignoreExpiration: false,
      issuer: process.env.ISSUER,
      audience: process.env.WEB_CLIENTID,
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
