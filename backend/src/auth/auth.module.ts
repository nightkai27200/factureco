import {
  Module,
} from '@nestjs/common';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  AuthService,
} from './auth.service';

import {
  UsersModule,
} from '../users/users.module';

import {
  AuthController,
} from './auth.controller';

import {
  JwtStrategy,
} from './jwt.strategy';

import {
  PrismaModule,
} from '../prisma/prisma.module';


@Module({

  imports: [

    ConfigModule,

    PrismaModule,

    UsersModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {

        const secret =
          configService.get<string>(
            'JWT_SECRET',
          );


        if (!secret) {

          throw new Error(
            'JWT_SECRET manquant',
          );

        }


        return {

          secret,

          signOptions: {
            expiresIn: '1d',
          },

        };

      },

    }),

  ],


  controllers: [
    AuthController,
  ],


  providers: [

    AuthService,

    JwtStrategy,

  ],


  exports: [

    AuthService,

    JwtModule,

  ],

})

export class AuthModule {}