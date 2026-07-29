import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';

import { SubscriptionService } from './subscription.service';
import { StripeService } from '../stripe/stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@Controller('subscription')
export class SubscriptionController {


constructor(

 private subscriptionService: SubscriptionService,

 private stripeService: StripeService,

){}






@Get('me')
@UseGuards(JwtAuthGuard)
async getMySubscription(
@Req() req:any,
){

return this.subscriptionService.getUserSubscription(
  req.user.id
);

}







@Post('upgrade/:plan')
@UseGuards(JwtAuthGuard)
async upgrade(

  @Req() req:any,

  @Param('plan') plan:string,

){

  return this.stripeService.createCheckoutSession(

    plan,

    req.user.email,

    req.user.id,

  );

}


}