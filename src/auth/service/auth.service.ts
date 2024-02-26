import { Injectable, Logger, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";
import { HttpService } from "@nestjs/axios";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";
import { URLSearchParams } from "url";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private httpService: HttpService
  ) {}

  async isUserExist(uuid: string) {
    try {
      //Google
      if (uuid.includes("@gmail.com")) {
        const findGoogleUser = await this.usersRepository.findOneGetByEmail(uuid);

        if (!findGoogleUser) {
          return false;
        } else {
          return true;
        }
      }

      //Apple
      const findAppleUser = await this.usersRepository.findAppleSub(uuid);

      if (!findAppleUser) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      console.error(e);
      throw new BadRequestException("유저 검증에 실패했습니다.");
    }
  }

  //*----------------Google idToken Logic
  async makeNewIdTokenGoogle(code: string): Promise<any> {
    const googleTokenEndpoint = "https://oauth2.googleapis.com/token";
    const clientId = process.env.GOOGLE_WEB_CLIENTID;
    const clientSecret = process.env.GOOGLE_WEB_SECRET;

    const getToken = async (body: URLSearchParams) => {
      try {
        const response = await this.httpService.axiosRef.post(googleTokenEndpoint, body.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        return response.data;
      } catch (e) {
        console.log(e);
        throw new BadRequestException("토큰 발급에 실패했습니다. With Goole");
      }
    };

    const authCodeBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
    });

    const tokenData = await getToken(authCodeBody);
    const refreshToken = tokenData.refresh_token;
    console.log("토큰 데이타!!!!!!!!!! 1차");
    console.log(tokenData);

    const bodyRefreshToken = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const idTokenData = await getToken(bodyRefreshToken);
    console.log("리프레쉬 데이타!!!!!!!!!! 2차");
    console.log(idTokenData);

    return idTokenData;
  }

  //*----------------Apple idToken Logic
  async makeNewIdTokenApple(authCode: string) {
    const appleTokenEndpoint = "https://appleid.apple.com/auth/oauth2/v2/token";
    const clientSecret = await this.createSecretKeyApple();
    const clientId = process.env.APPLE_CLIENT_ID;

    const getToken = async (body: URLSearchParams) => {
      try {
        const response = await this.httpService.axiosRef.post(appleTokenEndpoint, body.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        return response.data;
      } catch (e) {
        console.error(e);
        throw new BadRequestException("토큰 발급에 실패했습니다. With Apple");
      }
    };

    const authCodeBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: "authorization_code",
    });

    const tokenData = await getToken(authCodeBody);
    const refreshToken = tokenData.refresh_token;

    const bodyRefreshToken = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const idTokenData = await getToken(bodyRefreshToken);

    return idTokenData;
  }

  async createSecretKeyApple() {
    const appleHeader = {
      alg: "ES256",
      kid: process.env.APPLE_APP_KEY,
    };

    const applePayload = {
      iss: process.env.APPLE_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
      aud: "https://appleid.apple.com",
      sub: process.env.APPLE_CLIENT_ID,
    };

    const clientKeyPath = path.join("C:", "now-meet-backend", "AppleSecretKey.p8");
    const clientKey = fs.readFileSync(clientKeyPath, "utf8");

    const clientSecret = jwt.sign(applePayload, clientKey, {
      algorithm: "ES256",
      header: appleHeader,
    });

    return clientSecret;
  }

  //!----------------Client Revoke Code
  //*Internal Use
  async googleLogin(req: GoogleRequest) {
    try {
      const {
        user: { email },
      } = req;

      const findUser = await this.usersRepository.findOneGetByEmail(email);

      if (!findUser) {
        return null;
      }

      const googlePayload = { email, sub: findUser.id };

      const jwtToken = {
        token: this.jwtService.sign(googlePayload, {
          secret: process.env.JWT_KEY,
          expiresIn: process.env.JWT_EXPIRES,
        }),
      };

      return jwtToken;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException("로그인 실패");
    }
  }
}
