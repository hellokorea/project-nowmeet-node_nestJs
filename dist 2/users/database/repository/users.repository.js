"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_entity_1 = require("../entity/users.entity");
const typeorm_2 = require("typeorm");
let UsersRepository = class UsersRepository {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findAll() {
        return await this.usersRepository.find();
    }
    async findOneById(id) {
        const option = {
            where: { id },
        };
        return await this.usersRepository.findOne(option);
    }
    async findOneByNickname(nickname) {
        const option = {
            where: { nickname },
        };
        return await this.usersRepository.findOne(option);
    }
    async findOneGetByEmail(email) {
        const option = {
            where: { email },
        };
        return await this.usersRepository.findOne(option);
    }
    async findOneAppleSub(sub) {
        const option = {
            where: { sub },
        };
        console.log(sub);
        return await this.usersRepository.findOne(option);
    }
    async findOneUserLocation(id) {
        const option = {
            where: { id },
            select: ["longitude", "latitude"],
        };
        return await this.usersRepository.findOne(option);
    }
    async refreshUserLocation(id, lon, lan) {
        const userLocation = await this.usersRepository.findOne({ where: { id } });
        userLocation.latitude = lan;
        userLocation.longitude = lon;
        return await this.usersRepository.save(userLocation);
    }
    async findUsersNearLocaction(longitude, latitude, radius) {
        const distanceInMeters = radius * 1000;
        return await this.usersRepository
            .createQueryBuilder("user")
            .where(`ST_Distance_Sphere(POINT(:longitude, :latitude), POINT(user.longitude, user.latitude)) < :distance`)
            .setParameters({
            longitude,
            latitude,
            distance: distanceInMeters,
        })
            .getMany();
    }
    async saveUser(user) {
        return await this.usersRepository.save(user);
    }
    async findByFilesKeys(id) {
        const option = {
            where: { id },
            select: ["profileImages"],
        };
        return await this.usersRepository.findOne(option);
    }
    async deleteUser(transactionalEntityManager, user) {
        try {
            await transactionalEntityManager.remove(users_entity_1.User, user);
        }
        catch (error) {
            console.error("Error deleting user:", error);
            throw new common_1.InternalServerErrorException("유저 삭제 중 오류가 발생했습니다.");
        }
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map