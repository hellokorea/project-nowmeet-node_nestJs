import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as jwt from "jsonwebtoken";

@Injectable()
export class GoogleGuard extends AuthGuard("google-jwt") {}

@Injectable()
export class AppleGuard extends AuthGuard("apple-jwt") {}

@Injectable()
export class CustomJwtGuards implements CanActivate {
  private readonly logger = new Logger(CustomJwtGuards.name);

  constructor(
    private readonly googleGuard: GoogleGuard,
    private readonly appleGuard: AppleGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const startTime = Date.now();

    this.logger.log("jwt 검증 로직 스타트");
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 토큰이 없는 경우 거부
    if (!authHeader) {
      throw new UnauthorizedException("Authorization header is missing");
    }

    // Bearer 토큰 추출
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Bearer token is missing");
    }

    // JWT 디코드
    this.logger.log("Decoding 시작");
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object") {
      throw new UnauthorizedException("Invalid token");
    }
    console.log(decoded);

    const endTime = Date.now();
    this.logger.log("Decoding 종료");
    this.logger.log(`decoding jwt ${endTime - startTime}ms`);
    // 발급자(issuer) 확인
    const issuer = (decoded as jwt.JwtPayload).iss;
    if (!issuer) {
      throw new UnauthorizedException("Issuer is missing in token");
    }

    try {
      // 발급자에 따라 Guard 실행
      if (issuer.includes("accounts.google.com")) {
        this.logger.log("Using GoogleGuard");
        const endTime = Date.now();
        this.logger.log(`canActivate method finished in ${endTime - startTime}ms`);
        return this.googleGuard.canActivate(context) as Promise<boolean>;
      } else if (issuer.includes("appleid.apple.com")) {
        this.logger.log("Using AppleGuard");
        const endTime = Date.now();
        this.logger.log(`canActivate method finished in ${endTime - startTime}ms`);
        return this.appleGuard.canActivate(context) as Promise<boolean>;
      }
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException("발급자가 올바르지 않습니다.");
    }

    // 발급자가 Google이나 Apple이 아닐 경우 거부
    return false;
  }
}
