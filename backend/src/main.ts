import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });


  app.enableCors({
    origin: [
      "https://factureco.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  });


  app.getHttpAdapter().get('/', (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "FactureCo API running"
    });
  });


  await app.listen(
    process.env.PORT || 3000,
    "0.0.0.0"
  );


  console.log(
    `🚀 API running on port ${process.env.PORT}`
  );

}

bootstrap();