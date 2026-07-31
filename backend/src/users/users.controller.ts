import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

  constructor(
    private usersService: UsersService,
  ) {}


  // ==========================================
  // CRÉATION UTILISATEUR
  // ==========================================

  @Post()
  create(@Body() body: any) {

    return this.usersService.create(body);

  }


  // ==========================================
  // MON PROFIL
  // GET /users/me
  // ==========================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {

    return this.usersService.getMe(
      req.user.id,
    );

  }


  // ==========================================
  // MODIFIER MON PROFIL
  // PATCH /users/me
  // ==========================================

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      email?: string;
    },
  ) {

    return this.usersService.updateMe(
      req.user.id,
      body,
    );

  }


  // ==========================================
  // MODIFIER MOT DE PASSE
  // PATCH /users/me/password
  // ==========================================

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @Req() req: any,
    @Body()
    body: {
      password: string;
    },
  ) {

    return this.usersService.updatePassword(
      req.user.id,
      body.password,
    );

  }

}