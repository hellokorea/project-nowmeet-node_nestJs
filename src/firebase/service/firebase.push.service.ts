import { Body, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import * as fcmAdmin from "firebase-admin";

@Injectable()
export class PushService implements OnModuleInit {
  private fcm: fcmAdmin.app.App;

  onModuleInit() {
    const accountPath = process.env.firebaseAccount;
    const account = require(accountPath);

    this.fcm = fcmAdmin.initializeApp({
      credential: fcmAdmin.credential.cert(account),
    });
  }

  constructor() {}

  async sendPushNotification(@Body() body: { fcmToken: string; title: string; message: string }) {
    const { fcmToken, title, message } = body;

    const payload = {
      notification: {
        title,
        message,
      },
    };

    console.log("전송 된 push 메시지", payload.notification);

    try {
      await this.fcm.messaging().sendToDevice(fcmToken, payload);
      console.log("푸쉬 ok");
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
