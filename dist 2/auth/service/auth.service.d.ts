import { UsersRepository } from "../../users/database/repository/users.repository";
import { GoogleRequest } from "../dtos/request/auth.googleuser.dto";
import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private readonly usersRepository;
    private readonly jwtService;
    constructor(usersRepository: UsersRepository, jwtService: JwtService);
    isUserExist(uuid: string): Promise<boolean>;
    googleLogin(req: GoogleRequest): Promise<{
        token: string;
    }>;
}
