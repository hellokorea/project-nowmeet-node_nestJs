import { Injectable, Logger, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private httpService: HttpService
  ) {}

  async isUserExist(email: string) {
    try {
      const findUser = await this.usersRepository.findOneGetByEmail(email);

      if (!findUser) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new BadRequestException("유저 검증 도중 문제가 발생했습니다.");
    }
  }

  //----------------Google Login Logic
  async makeNewIdToken(code: string): Promise<any> {
    const googleTokenEndpoint = "https://oauth2.googleapis.com/token";
    const clientId = process.env.WEB_CLIENTID;
    const clientSecret = process.env.WEB_SECRET;

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
        throw new BadRequestException("토큰 발급에 실패했습니다.");
      }
    };

    const bodyCode = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
    });

    const tokenData = await getToken(bodyCode);
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

  //----------------Apple Login Logic

  async appleLogin() {}

  //!----------------Client Disuse Code
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
