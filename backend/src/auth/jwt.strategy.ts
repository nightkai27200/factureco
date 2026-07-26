import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {

    console.log('JWT STRATEGY CHARGEE');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret-key-dev',
    });

  }


  async validate(payload: any) {

    console.log('========== JWT VALIDATE ==========');
    console.log(payload);
    console.log('=================================');

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

  }

}