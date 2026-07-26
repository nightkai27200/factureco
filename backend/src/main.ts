import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';



async function bootstrap() {


  const app =
    await NestFactory.create(
      AppModule,
      {
        rawBody:true
      }
    );



  app.enableCors({

    origin:[
      "http://localhost:3001",
      "http://localhost:3000",
      "http://192.168.1.43:3001",
    ],

    credentials:true,

  });



  await app.listen(3000);


}


bootstrap();