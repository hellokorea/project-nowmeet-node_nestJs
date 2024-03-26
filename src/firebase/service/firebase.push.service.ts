import { Body, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import * as fcmAdmin from "firebase-admin";
import { UsersRepository } from "../../users/database/repository/users.repository";
import * as path from "path";

@Injectable()
export class PushPushService implements OnModuleInit {
  private fcm: fcmAdmin.app.App;

  onModuleInit() {
    const account = path.join("C:", "now-meet-backend", "FirebaseAdminKey.json");

    this.fcm = fcmAdmin.initializeApp({
      credential: fcmAdmin.credential.cert(account),
    });
  }

  constructor(private readonly usersRepository: UsersRepository) {}

  // 유저 정보 같이 받아야함!! nickname
  async sendPushNotification(@Body() body: { title: string; message: string; nickname: string }) {
    const { title, message, nickname } = body;

    const payload = {
      notification: {
        title,
        message,
      },
    };

    try {
      const user = await this.usersRepository.findOneByNickname(nickname);

      await this.fcm.messaging().sendToDevice(user.fcmToken, payload);

      console.log("푸쉬 ok");
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException("푸쉬 알림 전송에 실패 했습니다 : ", e);
    }
  }
}
