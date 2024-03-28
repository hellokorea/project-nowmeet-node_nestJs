import { Body, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import * as fcmAdmin from "firebase-admin";
import { ReqPushNotificationDto } from "../dtos/firebase.push.dto";
import * as path from "path";
import * as fs from "fs";

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

  constructor() {}

  async sendPushNotification(@Body() body: ReqPushNotificationDto) {
    const { fcmToken, title, message } = body;

    const payload = {
      notification: {
        title,
        body: message,
      },
    };

    try {
      await this.fcm.messaging().sendToDevice(fcmToken, payload);
      console.log("전송 된 push 메시지", payload.notification);
      console.log("푸쉬 ok");
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
