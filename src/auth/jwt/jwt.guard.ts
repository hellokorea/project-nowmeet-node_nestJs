import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import * as jwt from "jsonwebtoken";
import { isObservable, take } from "rxjs";

@Injectable()
export class GoogleGuard extends AuthGuard("google-jwt") {}

@Injectable()
export class AppleGuard extends AuthGuard("apple-jwt") {}

@Injectable()
export class CustomJwtGuard implements CanActivate {
  constructor(
    private readonly googleGuard: GoogleGuard,
    private readonly appleGuard: AppleGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object") {
      throw new UnauthorizedException("Invalid token");
    }

    console.log(decoded);
    // 발급자(issuer) 확인
    const issuer = (decoded as jwt.JwtPayload).iss;
    if (!issuer) {
      throw new UnauthorizedException("Issuer is missing in token");
    }

    // 발급자에 따라 Guard 실행
    if (issuer.includes("accounts.google.com")) {
      return this.googleGuard.canActivate(context) as Promise<boolean>;
    } else if (issuer.includes(process.env.APPLE_APP_ID)) {
      return this.appleGuard.canActivate(context) as Promise<boolean>;
    }

    // 발급자가 Google이나 Apple이 아닐 경우 거부
    throw new UnauthorizedException("Unknown issuer");
  }
}
