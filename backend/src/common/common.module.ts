import { Module } from '@nestjs/common';
import { NumberGeneratorService } from './number-generator.service';
import { PrismaModule } from '../prisma/prisma.module';


@Module({

  imports:[
    PrismaModule,
  ],

  providers:[
    NumberGeneratorService,
  ],

  exports:[
    NumberGeneratorService,
  ],

})
export class CommonModule {}