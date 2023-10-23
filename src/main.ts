import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/exceptions/http_exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import * as expressBasicAuth from "express-basic-auth";
import { ENV_VARS } from "./configService";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Global Use Inspector
  app.enableCors({
    origin: process.env.AWS,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(
    ["/docs", "/docs-json"],
    expressBasicAuth({
      challenge: true,
      users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD },
    })
  );

  //Env Rogic
  const configService = app.get(ConfigService);

  const missingVars = [];

  for (const key in ENV_VARS) {
    if (ENV_VARS.hasOwnProperty(key)) {
      const envValue = configService.get<string>(ENV_VARS[key]);
      if (!envValue) {
        missingVars.push(ENV_VARS[key]);
      }
    }
  }

  if (missingVars.length > 0) {
    console.error(`ERROR: 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(", ")}`);
    process.exit(1);
  }

  //Swagger Setting
  const config = new DocumentBuilder()
    .setTitle("Now Meet")
    .setDescription("Now Meet API")
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("Now Meet")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  //Local PORT!
  const PORT = process.env.PORT;

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}

bootstrap();
