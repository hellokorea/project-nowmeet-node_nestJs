import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
export declare class DatabaseConfigService implements TypeOrmOptionsFactory {
    private configService;
    private DELAY_TIME;
    constructor(configService: ConfigService);
    createTypeOrmOptions(): Promise<TypeOrmModuleOptions>;
}
