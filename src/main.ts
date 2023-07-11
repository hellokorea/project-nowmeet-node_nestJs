import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/exceptions/http_exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const PORT = process.env.PORT;

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} `);
  });
}

bootstrap();
