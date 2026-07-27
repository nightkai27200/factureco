import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {

  const app = await NestFactory.create(
    AppModule,
    {
      rawBody: true,
    }
  );


  app.enableCors({
    origin: [
      "https://factureco.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  });


  const port = process.env.PORT || 3000;

  await app.listen(
    port,
    "0.0.0.0"
  );


  console.log(`🚀 API running on port ${port}`);

}

bootstrap();