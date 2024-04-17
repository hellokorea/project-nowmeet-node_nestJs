import { HttpService } from "@nestjs/axios";
export declare class AuthJwtService {
    private httpService;
    constructor(httpService: HttpService);
    makeNewIdTokenGoogle(code: string): Promise<any>;
    makeNewIdTokenApple(authCode: string): Promise<any>;
    createSecretKeyApple(): Promise<string>;
}
