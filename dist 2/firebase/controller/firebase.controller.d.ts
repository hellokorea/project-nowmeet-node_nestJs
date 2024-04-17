import { PushService } from "../service/firebase.push.service";
import { ReqPushNotificationDto } from "../dtos/firebase.push.dto";
export declare class FirebaseController {
    private readonly pushService;
    constructor(pushService: PushService);
    sendPushNotification(body: ReqPushNotificationDto): Promise<void>;
}
