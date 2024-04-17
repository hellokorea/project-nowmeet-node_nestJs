import { OnModuleInit } from "@nestjs/common";
import { ReqPushNotificationDto } from "../dtos/firebase.push.dto";
import { UsersRepository } from "src/users/database/repository/users.repository";
export declare class PushService implements OnModuleInit {
    private readonly usersRepository;
    private fcm;
    onModuleInit(): void;
    constructor(usersRepository: UsersRepository);
    sendPushNotification(body: ReqPushNotificationDto): Promise<void>;
}
