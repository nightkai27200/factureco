import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

import { PrismaModule } from '../prisma/prisma.module';


@Module({

  imports: [

    PrismaModule,

    UsersModule,

    PassportModule,


    JwtModule.register({

      secret: 'secret-key-dev',

      signOptions: {
        expiresIn: '1d',
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

  ],

})

export class AuthModule {}