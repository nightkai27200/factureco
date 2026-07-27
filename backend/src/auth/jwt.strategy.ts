import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {

    const jwtSecret = process.env.JWT_SECRET;


    console.log("========================");
    console.log("JWT VERIFY SECRET LENGTH:", jwtSecret?.length);
    console.log("JWT VERIFY SECRET:", jwtSecret);
    console.log("========================");


    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET manquant"
      );
    }


    super({

      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey:
        jwtSecret,

    });

  }


  async validate(payload:any){

    console.log(
      "JWT VALIDATE OK",
      payload
    );


    return {

      id: payload.sub,

      email: payload.email,

      role: payload.role,

    };

  }

}