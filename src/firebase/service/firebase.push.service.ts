import { Body, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import * as fcmAdmin from "firebase-admin";
import { ReqPushNotificationDto } from "../dtos/firebase.push.dto";
import * as path from "path";
import * as fs from "fs";
import { UsersRepository } from "src/users/database/repository/users.repository";

@Injectable()
export class PushService implements OnModuleInit {
  private fcm: fcmAdmin.app.App;

  onModuleInit() {
    const isDevMode = process.env.MODE === "dev";

    let keyPath;
    let firebaseAccount;

    if (isDevMode) {
      keyPath = path.join("/Users", "gimjeongdong", "Desktop", "now-meet-backend", "FirebaseAdminKey.json");
      firebaseAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    } else {
      keyPath = process.env.firebaseAccount;
      firebaseAccount = require(keyPath);
    }

    this.fcm = fcmAdmin.initializeApp({
      credential: fcmAdmin.credential.cert(firebaseAccount),
    });
  }

  constructor(private readonly usersRepository: UsersRepository) {}

  async sendPushNotification(@Body() body: ReqPushNotificationDto) {
    const { title, message, nickname, screenName, chatId } = body;

    try {
      const user = await this.usersRepository.findOneByNickname(nickname);

      console.log("body !!! :", body);
      console.log("chat Id !!!! ;", chatId);

      const commonPayload = {
        notification: {
          title: title,
          body: message,
        },

        data: { screenName },
        token: user.fcmToken,
      };

      const chatPayload = {
        notification: {
          title: title,
          body: message,
        },

        data: {
          screenName,
          ...(chatId && { chatId: chatId.toString() }),
        },
        token: user.fcmToken,
      };

      if (chatId) {
        await this.fcm.messaging().send(chatPayload);
      } else {
        await this.fcm.messaging().send(commonPayload);
      }
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
