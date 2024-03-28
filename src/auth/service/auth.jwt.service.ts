import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as fs from "fs";
import * as path from "path";
import * as jwt from "jsonwebtoken";
import { URLSearchParams } from "url";

@Injectable()
export class AuthJwtService {
  constructor(private httpService: HttpService) {}

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
        console.error("makeNewIdTokenGoogle :", e);
        throw new InternalServerErrorException("토큰 발급에 실패했습니다. With Goole");
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
        console.error("makeNewIdTokenApple :", e);
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

    const clientKeyPath = "/home/ec2-user/applications/nowmeet/AppleSecretKey.p8";
    const clientKey = fs.readFileSync(clientKeyPath, "utf8");

    const clientSecret = jwt.sign(applePayload, clientKey, {
      algorithm: "ES256",
      header: appleHeader,
    });

    return clientSecret;
  }
}
