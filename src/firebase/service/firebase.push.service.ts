import { Body, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import * as fcmAdmin from "firebase-admin";
import { ReqPushNotificationDto } from "../dtos/firebase.push.dto";
import * as path from "path";
import * as fs from "fs";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { GoogleAuth } from "google-auth-library";

@Injectable()
export class PushService implements OnModuleInit {
  private fcm: fcmAdmin.app.App;
  private keyPath: string;
  private readonly SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

  onModuleInit() {
    const isDevMode = process.env.MODE === "dev";

    this.keyPath = isDevMode
      ? path.join("/Users", "gimjeongdong", "Desktop", "now-meet-backend", "FirebaseAdminKey.json")
      : process.env.firebaseAccount;

    const firebaseAccount = JSON.parse(fs.readFileSync(this.keyPath, "utf8"));

    this.fcm = fcmAdmin.initializeApp({
      credential: fcmAdmin.credential.cert(firebaseAccount),
    });
  }

  constructor(private readonly usersRepository: UsersRepository) {}

  private ensureFcmInitialized() {
    if (!this.fcm) {
      throw new InternalServerErrorException("FCM이 초기화되지 않았습니다.");
    }
  }

  private async getAccessToken(): Promise<string> {
    this.ensureFcmInitialized();

    const auth = new GoogleAuth({
      keyFile: this.keyPath,
      scopes: this.SCOPES,
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();

    if (!accessTokenResponse) {
      throw new InternalServerErrorException("FCM 액세스 토큰 발급에 실패했습니다.");
    }

    return accessTokenResponse.token;
  }

  private createCommonPayload(
    title: string,
    message: string,
    userFcmToken: string,
    screenName: string,
    nickname: string
  ) {
    return {
      message: {
        token: userFcmToken,
        notification: {
          title,
          body: message,
        },
        data: {
          screenName,
          nickname,
        },
        apns: {
          payload: {
            aps: {
              "content-available": 1,
              alert: {
                title,
                body: message,
              },
              sound: "default",
            },
          },
          headers: {
            "apns-priority": "10",
          },
        },
      },
    };
  }

  private createChatPayload(
    title: string,
    message: string,
    userFcmToken: string,
    screenName: string,
    nickname: string,
    chatId: number,
    senderNickname: string
  ) {
    return {
      message: {
        token: userFcmToken,
        notification: {
          title,
          body: message,
        },
        data: {
          screenName,
          nickname,
          ...(chatId && { chatId: chatId.toString() }),
          ...(senderNickname && { senderNickname }),
          // isRead
        },
        apns: {
          payload: {
            aps: {
              "content-available": 1,
              alert: {
                title,
                body: message,
              },
              sound: "default",
            },
          },
          headers: {
            "apns-priority": "10",
          },
        },
      },
    };
  }

  async sendPushNotification(@Body() body: ReqPushNotificationDto) {
    const { title, message, nickname, screenName, chatId, senderNickname } = body;

    try {
      const user = await this.usersRepository.findOneByNickname(nickname);
      console.log(body);

      if (!user || !user.fcmToken) {
        throw new InternalServerErrorException("User or FCM token not found");
      }

      const payload = chatId
        ? this.createChatPayload(title, message, user.fcmToken, screenName, nickname, chatId, senderNickname)
        : this.createCommonPayload(title, message, user.fcmToken, screenName, nickname);

      const accessToken = await this.getAccessToken();

      console.log("accessToken :", accessToken);

      const response = await fetch(process.env.FCMFETCH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(payload);

      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
