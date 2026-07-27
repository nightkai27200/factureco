import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });


  app.enableCors({
  origin: [
    "https://factureco.vercel.app",
    "https://factureco-e24f74xd7-ms-consulting.vercel.app",
    "https://factureco-ldcvitf5s-ms-consulting.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
});


  await app.listen(process.env.PORT || 3000);

}

bootstrap();