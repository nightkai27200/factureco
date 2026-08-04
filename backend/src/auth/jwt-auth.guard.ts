import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';

import {
  AuthGuard,
} from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard
  extends AuthGuard('jwt') {

  canActivate(
    context: ExecutionContext,
  ) {

    const request =
      context.switchToHttp().getRequest();

    console.log(
      '========== JWT GUARD ==========',
    );

    console.log(
      'METHOD:',
      request.method,
    );

    console.log(
      'URL:',
      request.url,
    );

    console.log(
      'AUTHORIZATION:',
      request.headers.authorization
        ? 'PRESENT'
        : 'ABSENT',
    );

    console.log(
      'TOKEN START:',
      request.headers.authorization
        ?.substring(0, 40),
    );

    console.log(
      '===============================',
    );

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {

    console.log(
      '========== JWT RESULT ==========',
    );

    console.log(
      'ERR:',
      err,
    );

    console.log(
      'USER:',
      user,
    );

    console.log(
      'INFO:',
      info,
    );

    console.log(
      '===============================',
    );

    return super.handleRequest(
      err,
      user,
      info,
      context,
    );
  }
}