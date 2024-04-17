"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./common/exceptions/http_exception.filter");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const expressBasicAuth = require("express-basic-auth");
const configService_1 = require("./configService");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.AWS,
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.use(["/docs", "/docs-json"], expressBasicAuth({
        challenge: true,
        users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD },
    }));
    const configService = app.get(config_1.ConfigService);
    const missingVars = [];
    for (const key in configService_1.ENV_VARS) {
        if (configService_1.ENV_VARS.hasOwnProperty(key)) {
            const envValue = configService.get(configService_1.ENV_VARS[key]);
            if (!envValue) {
                missingVars.push(configService_1.ENV_VARS[key]);
            }
        }
    }
    if (missingVars.length > 0) {
        console.error(`ERROR: 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(", ")}`);
        process.exit(1);
    }
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Now Meet")
        .setDescription("Now Meet API")
        .setVersion("1.0.0")
        .addBearerAuth()
        .addTag("Now Meet")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document);
    const PORT = process.env.PORT;
    const MODE = process.env.MODE;
    const MODE_CONFIG = {
        dev: {
            address: process.env.LOCAL_IP,
            message: `Server is Running in Dev Mode at port : ${PORT}`,
        },
        prod: {
            address: undefined,
            message: `Server is Running in Production Mode at port : ${PORT}`,
        },
    };
    const currentConfig = MODE_CONFIG[MODE];
    if (!currentConfig) {
        console.error(`Unknown MODE: ${MODE}. 서버 실행에 실패 했습니다.`);
        process.exit(1);
    }
    await app.listen(PORT, currentConfig.address, () => {
        console.log(currentConfig.message);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map