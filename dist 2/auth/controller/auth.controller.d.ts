import { AuthService } from "../service/auth.service";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { AuthJwtService } from "./../service/auth.jwt.service";
export declare class AuthController {
    private readonly authService;
    private readonly authJwtService;
    constructor(authService: AuthService, authJwtService: AuthJwtService);
    isUserExist(uuid: string): Promise<boolean>;
    makeNewIdTokenGoogle(code: string): Promise<any>;
    makeNewIdTokenApple(authCode: string): Promise<any>;
    googleLogin(req: Request): Promise<void>;
    googleLoginCallback(req: GoogleRequest): Promise<{
        token: string;
    }>;
}
