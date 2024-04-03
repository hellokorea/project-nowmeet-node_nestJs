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

      const dataPayload = chatId ? { screenName, chatId: chatId.toString() } : { screenName };

      console.log(dataPayload);
      console.log("바디 : ", body);

      const payload = {
        notification: {
          title,
          body: message,
        },

        data: dataPayload,
        token: user.fcmToken,
      };

      console.log("페이로드 :", payload);

      await this.fcm.messaging().send(payload);
      console.log("전송 된 push 메시지", payload.notification);
      console.log("푸쉬 ok");
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
