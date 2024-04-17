import { ApplePayload, GooglePayload } from "./jwt.payload";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { User } from "src/users/database/entity/users.entity";
declare const GooleJwtStrategy_base: new (...args: any[]) => any;
export declare class GooleJwtStrategy extends GooleJwtStrategy_base {
    private readonly userRepository;
    constructor(userRepository: UsersRepository);
    validate(payload: GooglePayload): Promise<User>;
}
declare const AppleJwtStrategy_base: new (...args: any[]) => any;
export declare class AppleJwtStrategy extends AppleJwtStrategy_base {
    private readonly userRepository;
    constructor(userRepository: UsersRepository);
    validate(payload: ApplePayload): Promise<User>;
}
export {};
