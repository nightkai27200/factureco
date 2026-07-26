import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';

import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('subscription')
export class SubscriptionController {


constructor(
 private subscriptionService: SubscriptionService,
){}




// abonnement actuel
@Get('me')
@UseGuards(JwtAuthGuard)
async getMySubscription(
@Req() req:any,
){


return this.subscriptionService.getUserSubscription(
req.user.id,
);


}





// changement de plan
@Post('upgrade/:plan')
@UseGuards(JwtAuthGuard)
async upgrade(

@Req() req:any,

@Param('plan') plan:string,

){



console.log(
"Upgrade demandé :",
plan
);



return this.subscriptionService.changePlan(

req.user.id,

plan,

);


}


}