import {
 Controller,
 Get,
 Post,
 Patch,
 Body,
 Req,
 UseGuards,
 UseInterceptors,
 UploadedFile,
} from '@nestjs/common';


import {
 FileInterceptor,
} from '@nestjs/platform-express';


import {
 diskStorage,
} from 'multer';


import {
   join,
 extname,
} from 'path';


import { CompanyService } from './company.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {


constructor(
 private companyService:CompanyService,
){}





@Get()
find(
 @Req() req:any,
){

 return this.companyService.find(
   req.user.id,
 );

}






@Post()
create(
 @Req() req:any,
 @Body() data:any,
){

 return this.companyService.create(
   req.user.id,
   data,
 );

}







@Patch()
update(
 @Req() req:any,
 @Body() data:any,
){

 return this.companyService.update(
   req.user.id,
   data,
 );

}







@Post('logo')
@UseInterceptors(
  FileInterceptor(
    'logo',
    {
      storage: diskStorage({

        destination: (
          req,
          file,
          callback
        ) => {

          callback(
            null,
            join(
              process.cwd(),
              'uploads',
              'logos'
            )
          );

        },


        filename(
          req,
          file,
          callback
        ){

          const filename =
            Date.now()
            +
            extname(file.originalname);


          callback(
            null,
            filename
          );

        },


      }),


      fileFilter(
        req,
        file,
        callback
      ){

        if(!file.mimetype.startsWith('image')){

          return callback(
            new Error(
              "Le fichier doit être une image"
            ),
            false
          );

        }


        callback(
          null,
          true
        );

      },


    }
  )
)
async uploadLogo(

 @Req() req:any,

 @UploadedFile() file:any,

){


 console.log(
   "USER =>",
   req.user
 );


 console.log(
   "FILE =>",
   file
 );



 if(!file){

  throw new Error(
    "Aucun logo envoyé"
  );

 }



 const company =

 await this.companyService.update(

  req.user.id,


  {

   logo:
   `/uploads/logos/${file.filename}`

  }

 );


 console.log(
  "COMPANY =>",
  company
 );


 return company;


}
}