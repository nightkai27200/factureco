import {
Controller,
Post,
Body,
Req,
UseGuards
} from '@nestjs/common';


import {
StripeService
} from './stripe.service';


import {
JwtAuthGuard
} from '../auth/jwt-auth.guard';

import {
  Headers
} from '@nestjs/common';



@Controller('stripe')
export class StripeController {



constructor(
private stripeService:StripeService
){}





@Post('create-checkout')

@Post('webhook')
async webhook(

@Req() req:any,

@Headers('stripe-signature') signature:string

){

return this.stripeService.handleWebhook(

  req.body,

  signature

);

}

@UseGuards(JwtAuthGuard)

createCheckout(

@Body() body:any,

@Req() req:any

)

{


return this.stripeService.createCheckoutSession(

  body.plan,

  req.user.email,

  req.user.id

);






}





}