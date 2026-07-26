import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService
} from '../prisma/prisma.service';



@Injectable()
export class CompanyService {


constructor(
 private prisma: PrismaService,
){}





async find(
 userId:string,
){

return this.prisma.company.findUnique({

 where:{
  userId,
 },

});

}







async create(
 userId:string,
 data:any,
){


return this.prisma.company.upsert({

where:{
 userId,
},


create:{

 ...data,

 userId,

},


update:data,


});


}







async update(
 userId:string,
 data:any,
){


return this.prisma.company.upsert({

where:{
 userId,
},


create:{

 ...data,

 userId,

},


update:data,


});


}




}