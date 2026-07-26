import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class NumberGeneratorService {


constructor(
 private prisma: PrismaService,
){}



async generate(
 type:'FAC'|'DEV'
){


const year =
new Date().getFullYear();



const counter =
await this.prisma.documentCounter.upsert({


where:{
 type_year:{
  type,
  year,
 }
},


create:{

 type,
 year,
 value:1,

},


update:{

 value:{
  increment:1,
 }

},


});



const number =
String(counter.value)
.padStart(5,'0');



return `${type}-${year}-${number}`;


}


}
