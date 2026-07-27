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


      callback(new Error("Not allowed by CORS"));

    },

    credentials: true,

  });


  await app.listen(
    process.env.PORT || 3000
  );

}

bootstrap();