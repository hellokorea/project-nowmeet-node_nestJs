import { UsersRepository } from "src/users/database/repository/users.repository";
export declare class InAppService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    getProfile(): Promise<string>;
    sendLike(): Promise<string>;
    openChat(): Promise<string>;
}
