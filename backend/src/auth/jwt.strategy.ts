import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  ConfigService,
} from '@nestjs/config';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
{
  constructor(
    private readonly configService: ConfigService,
  ) {

    const jwtSecret =
      configService.get<string>('JWT_SECRET');

    console.log(
      '==============================',
    );

    console.log(
      'JWT STRATEGY START',
    );

    console.log(
      'JWT SECRET EXISTS:',
      !!jwtSecret,
    );

    console.log(
      'JWT SECRET LENGTH:',
      jwtSecret?.length,
    );

    console.log(
      '==============================',
    );

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET manquant',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey:
        jwtSecret,

      ignoreExpiration: false,
    });
  }

  async validate(
    payload: any,
  ) {

    console.log(
      '==============================',
    );

    console.log(
      'JWT VALIDATE OK',
    );

    console.log(
      'PAYLOAD:',
      payload,
    );

    console.log(
      '==============================',
    );

    if (!payload?.sub) {
      throw new UnauthorizedException(
        'Token JWT invalide.',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}