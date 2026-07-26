import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    console.log(request.headers.authorization);

    return super.canActivate(context);
  }

  override handleRequest(err: any, user: any, info: any, context: any) {
    console.log('ERR:', err);
    console.log('USER:', user);
    console.log('INFO:', info);

    return super.handleRequest(err, user, info, context);
  }
}