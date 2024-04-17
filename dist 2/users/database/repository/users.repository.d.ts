import { User } from "../entity/users.entity";
import { EntityManager, Repository } from "typeorm";
import { UserCreateDto } from "../../dtos/request/users.create.dto";
export declare class UsersRepository {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findOneById(id: number): Promise<User | null>;
    findOneByNickname(nickname: string): Promise<User | null>;
    findOneGetByEmail(email: string): Promise<User | null>;
    findOneAppleSub(sub: string): Promise<User | null>;
    findOneUserLocation(id: number): Promise<User | null>;
    refreshUserLocation(id: number, lon: number, lan: number): Promise<User | null>;
    findUsersNearLocaction(longitude: number, latitude: number, radius: number): Promise<User[] | null>;
    saveUser(user: UserCreateDto): Promise<User>;
    findByFilesKeys(id: number): Promise<User | null>;
    deleteUser(transactionalEntityManager: EntityManager, user: User): Promise<void>;
}
