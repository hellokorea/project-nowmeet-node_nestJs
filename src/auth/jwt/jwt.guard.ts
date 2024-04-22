import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import * as jwt from "jsonwebtoken";

@Injectable()
export class GoogleGuard extends AuthGuard("google-jwt") {}

@Injectable()
export class AppleGuard extends AuthGuard("apple-jwt") {}

@Injectable()
export class CustomJwtGuards implements CanActivate {
  constructor(
    private readonly googleGuard: GoogleGuard,
    private readonly appleGuard: AppleGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log("Guard authHeader :", authHeader);

    if (!authHeader) {
      throw new UnauthorizedException("Authorization header is missing");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Bearer token is missing");
    }

    console.log("Guard token :", token);

    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object") {
      throw new UnauthorizedException("Invalid token");
    }

    const issuer = (decoded as jwt.JwtPayload).iss;
    if (!issuer) {
      throw new UnauthorizedException("Issuer is missing in token");
    }

    console.log("Guard issuer :", issuer);

    try {
      if (issuer.includes("accounts.google.com")) {
        const result = await this.googleGuard.canActivate(context);
        return result as boolean;
      } else if (issuer.includes("appleid.apple.com")) {
        const result = await this.appleGuard.canActivate(context);
        return result as boolean;
      }
    } catch (e) {
      console.error("canActivate :", e);
      throw new UnauthorizedException("CustomJwtGuards 작동 실패");
    }

    return false;
  }
}
