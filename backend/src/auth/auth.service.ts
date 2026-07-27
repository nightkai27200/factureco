import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { PrismaService } from '../prisma/prisma.service';



@Injectable()
export class AuthService {


  constructor(

    private usersService: UsersService,

    private jwtService: JwtService,

    private prisma: PrismaService,

  ) {}





async resetPassword(){

  const password = "123456";


  // création du hash
  const hash =
    await bcrypt.hash(
      password,
      10,
    );


  console.log(
    "NOUVEAU HASH :",
    hash
  );


  // sauvegarde en base
  await this.prisma.user.update({

    where:{
      email:"kevdev59177@gmail.com",
    },

    data:{
      passwordHash:hash,
    },

  });



  // récupération après sauvegarde
  const user =
    await this.prisma.user.findUnique({

      where:{
        email:"kevdev59177@gmail.com",
      },

    });



  console.log(
    "HASH APRES UPDATE :",
    user?.passwordHash
  );



  // test bcrypt immédiat
  const test =
    await bcrypt.compare(
      password,
      user!.passwordHash,
    );


  console.log(
    "TEST BCRYPT APRES RESET :",
    test
  );



  return {

    message:"Mot de passe changé",

    password:"123456",

    bcrypt:test,

  };

}









async validateUser(
  email:string,
  password:string,
){

  console.log("=== LOGIN TEST ===");
  console.log("EMAIL :", email);
  console.log("PASSWORD :", password);


  const user =
    await this.usersService.findOneByEmail(email);


  console.log("USER :", user);


  if(!user){
    throw new UnauthorizedException(
      "Identifiants invalides"
    );
  }


  console.log(
    "HASH DB :",
    user.passwordHash
  );


  const passwordValid =
    await bcrypt.compare(
      password,
      user.passwordHash,
    );


  console.log(
    "BCRYPT :",
    passwordValid
  );


  if(!passwordValid){
    throw new UnauthorizedException(
      "Identifiants invalides"
    );
  }


  return user;

}








async login(user:any){

  const userComplete =
    await this.prisma.user.findUnique({

      where:{
        id:user.id,
      },

      include:{
        subscription:true,
        company:true,
      },

    });


  const payload = {

    sub:user.id,

    email:user.email,

    role:user.role,

    subscription:
      userComplete?.subscription?.name 
      ||
      "FREE",

  };


  console.log(
    "JWT SIGN SECRET LENGTH:",
    process.env.JWT_SECRET?.length
  );


  const token =
    this.jwtService.sign(payload);


  console.log(
    "TOKEN CREE:",
    token.substring(0,30)
  );


  return {

    access_token: token,


    user:{


      id:userComplete?.id,

      email:userComplete?.email,

      name:userComplete?.name,


      subscription:
        userComplete?.subscription
        ||
        {
          name:"FREE",
          price:0,
        },


      company:
        userComplete?.company,


    },


  };


}

}



