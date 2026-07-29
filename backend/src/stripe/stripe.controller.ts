import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';

import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('stripe')
export class StripeController {

  constructor(
    private stripeService: StripeService
  ) {}



  // Création session paiement
  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(

    @Body() body:any,

    @Req() req:any

  ){

    return this.stripeService.createCheckoutSession(

      body.plan,

      req.user.email,

      req.user.id,

    );

  }




  // Webhook Stripe
  @Post('webhook')
  async webhook(

    @Req() req:any,

    @Headers('stripe-signature') signature:string

  ){

    return this.stripeService.handleWebhook(

      req.rawBody,

      signature

    );

  }

}