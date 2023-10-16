import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/exceptions/http_exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as expressBasicAuth from "express-basic-auth";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Global Use Inspector
  app.enableCors({
    origin: "https://port-0-now-meet-backend-k19y2klk157645.sel4.cloudtype.app",
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

  //Local PORT
  const PORT = process.env.PORT;

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}

bootstrap();
