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
    // const localPath = path.join("C:", "now-meet-backend", "FirebaseAdminKey.json");
    // const localAccount = JSON.parse(fs.readFileSync(localPath, "utf8"));

    const prodAccountPath = process.env.firebaseAccount;
    const prodAccount = require(prodAccountPath);

    this.fcm = fcmAdmin.initializeApp({
      credential: fcmAdmin.credential.cert(prodAccount),
    });
  }

  constructor(private readonly usersRepository: UsersRepository) {}

  async sendPushNotification(@Body() body: ReqPushNotificationDto) {
    const { title, message, nickname } = body;

    try {
      const user = await this.usersRepository.findOneByNickname(nickname);

      const payload = {
        notification: {
          title,
          body: message,
        },
        token: user.fcmToken,
      };

      await this.fcm.messaging().send(payload);
      console.log("전송 된 push 메시지", payload.notification);
      console.log("푸쉬 ok");
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
