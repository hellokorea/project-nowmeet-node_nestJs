import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger, Param, Req, UnauthorizedException } from "@nestjs/common";
import { ApplePayload, GooglePayload } from "./jwt.payload";
import { UsersRepository } from "src/users/users.repository";
import { User } from "src/users/entity/users.entity";
import * as jwksRsa from "jwks-rsa";

//Google Jwt Validate
@Injectable()
export class GooleJwtStrategy extends PassportStrategy(Strategy, "google-jwt") {
  constructor(private readonly userRepository: UsersRepository) {
    //* Local Use
    // super({
    //   jwtFromRequest: (request) => {
    //     const authHeader = request.headers.authorization;
    //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //       console.log(`Invalid Authorization header: ${authHeader}`);
    //       throw new UnauthorizedException("Invalid Authorization header");
    //     }
    //     const token = authHeader.split(" ")[1];
    //     console.log(token);
    //     return token;
    //   },
    //   secretOrKey: process.env.JWT_KEY,
    //   ignoreExpiration: false,
    // });

    super({
      jwtFromRequest: (request) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          console.log(`Invalid Authorization header: ${authHeader}`);
          throw new UnauthorizedException("Invalid Authorization header");
        }
        const token = authHeader.split(" ")[1];
        console.log(token);
        return token;
      },
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
      }),
      ignoreExpiration: false,
      issuer: "https://accounts.google.com",
      audience: process.env.GOOGLE_WEB_CLIENTID,
      algorithms: ["RS256"],
    });
  }

  async validate(payload: GooglePayload): Promise<User> {
    console.log("구글 유저 검증 시작");
    try {
      const user = await this.userRepository.findOneGetByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException("유저가 존재하지 않습니다.");
      }

      console.log("구글 유저 검증 끝");

      return user;
    } catch (e) {
      console.error("구글 인증 실패:", e);
      throw e;
    }
  }
}

//Apple Jwt Validate
@Injectable()
export class AppleJwtStrategy extends PassportStrategy(Strategy, "apple-jwt") {
  private readonly logger = new Logger(AppleJwtStrategy.name);

  constructor(private readonly userRepository: UsersRepository) {
    super({
      jwtFromRequest: (request) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          console.log(`Invalid Authorization header: ${authHeader}`);
          throw new UnauthorizedException("Invalid Authorization header");
        }
        const token = authHeader.split(" ")[1];
        console.log(token);
        return token;
      },
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: "https://appleid.apple.com/auth/oauth2/v2/keys",
      }),
      ignoreExpiration: false,
      issuer: "https://appleid.apple.com",
      audience: process.env.APPLE_CLIENT_ID,
      algorithms: ["RS256"],
    });
  }

  async validate(payload: ApplePayload): Promise<User> {
    const startTime = Date.now();
    this.logger.log("애플 유저 검증 시작");
    const user = await this.userRepository.findAppleSub(payload.sub);

    if (!user) {
      throw new UnauthorizedException("유저가 존재하지 않습니다.");
    }

    const endTime = Date.now();
    this.logger.log("애플 유저 검증 끝");
    this.logger.log(`decoding jwt ${endTime - startTime}ms`);
    return user;
  }
}
