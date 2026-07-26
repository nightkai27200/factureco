import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';


@Controller('auth')
export class AuthController {

  constructor(
  private authService: AuthService,
  private jwtService: JwtService,
  private usersService: UsersService,
) {}

@Post('reset-password-test')
resetPassword(){

  return this.usersService.resetPassword(
    'kevdev59177@gmail.com',
    'password123',
  );

}

  @Get('test')
  test() {
    const token = this.jwtService.sign({
      sub: '123',
      email: 'test@test.fr',
      role: 'USER',
    });

    console.log('TOKEN:', token);
    console.log('VERIFY:', this.jwtService.verify(token));

    return { token };
  }

  @Post('login')
async login(
  @Body() loginDto: LoginDto,
) {

  console.log("BODY RECU :", loginDto);


  const user =
    await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );


  return this.authService.login(user);
}
  

}