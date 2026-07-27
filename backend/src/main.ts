import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });


  app.enableCors({

  origin: (origin, callback) => {

    if (!origin) {
      return callback(null, true);
    }

    if (
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost")
    ) {
      return callback(null, true);
    }

    callback(new Error("CORS blocked"));

  },

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