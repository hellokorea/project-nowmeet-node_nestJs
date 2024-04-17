/// <reference types="multer" />
import { UserCreateDto } from "../dtos/request/users.create.dto";
import { UsersRepository } from "../database/repository/users.repository";
import { AwsService } from "src/aws.service";
export declare class UserSignupService {
    private readonly usersRepository;
    private readonly awsService;
    constructor(usersRepository: UsersRepository, awsService: AwsService);
    createUser(body: UserCreateDto, files: Array<Express.Multer.File>, request: Request): Promise<import("../database/entity/users.entity").User>;
    nicknameDuplicate(nickname: string): Promise<boolean>;
}
