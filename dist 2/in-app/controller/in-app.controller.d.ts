import { InAppService } from "../service/in-app.service";
export declare class InAppController {
    private readonly inAppService;
    constructor(inAppService: InAppService);
    getProfile(): Promise<string>;
    sendLike(): Promise<string>;
    openChat(): Promise<string>;
}
