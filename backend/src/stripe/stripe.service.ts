
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeKey =
      this.config.get<string>('STRIPE_SECRET_KEY');

    if (!stripeKey) {
      throw new Error(
        'STRIPE_SECRET_KEY manquante dans .env',
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createPortalSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    if (!user.stripeCustomerId) {
      throw new Error(
        "Cet utilisateur n'a pas encore de client Stripe",
      );
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ??
      'https://factureco.vercel.app';

    const session =
      await this.stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${frontendUrl}/account`,
      });

    return {
      url: session.url,
    };
  }

  async createCheckoutSession(
    plan: string,
    email: string,
    userId: string,
  ) {
    const subscriptionPlan =
      await this.prisma.subscriptionPlan.findUnique({
        where: {
          name: plan,
        },
      });

    if (!subscriptionPlan) {
      throw new Error('Plan introuvable');
    }

    if (!subscriptionPlan.stripePriceId) {
      throw new Error(
        "Ce plan n'a pas de prix Stripe configuré",
      );
    }

    const session =
      await this.stripe.checkout.sessions.create({
        mode: 'subscription',

        customer_email: email,

        line_items: [
          {
            price: subscriptionPlan.stripePriceId,
            quantity: 1,
          },
        ],

        success_url:
          'https://factureco.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}',

        cancel_url:
          'https://factureco.vercel.app/payment-cancel',

        metadata: {
          plan,
          email,
          userId,
        },
      });

    return {
      url: session.url,
    };
  }

  async handleWebhook(
    payload: any,
    signature: string,
  ) {
    const endpointSecret =
      this.config.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );

    if (!endpointSecret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET manquante',
      );
    }

    let event: Stripe.Event;

    try {
      event =
        this.stripe.webhooks.constructEvent(
          payload,
          signature,
          endpointSecret,
        );
    } catch {
      throw new Error(
        'Signature Stripe invalide',
      );
    }

    // ===========================
    // Paiement réussi
    // ===========================

    if (
      event.type === 'checkout.session.completed'
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      // LOGS TEMPORAIRES POUR DIAGNOSTIC
      console.log(
        '========== STRIPE WEBHOOK ==========',
      );

      console.log(
        'EVENT TYPE :',
        event.type,
      );

      console.log(
        'SESSION ID :',
        session.id,
      );

      console.log(
        'CUSTOMER :',
        session.customer,
      );

      console.log(
        'SUBSCRIPTION :',
        session.subscription,
      );

      console.log(
        'METADATA :',
        session.metadata,
      );

      console.log(
        '====================================',
      );

      const userId =
        session.metadata?.userId;

      const plan =
        session.metadata?.plan;

      if (!userId || !plan) {
        throw new Error(
          'Metadata Stripe manquante',
        );
      }

      const subscriptionPlan =
        await this.prisma.subscriptionPlan.findUnique({
          where: {
            name: plan,
          },
        });

      if (!subscriptionPlan) {
        throw new Error(
          'Plan abonnement introuvable',
        );
      }

      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          subscriptionId:
            subscriptionPlan.id,

          subscriptionStatus:
            'ACTIVE',

          stripeCustomerId:
            session.customer as string,

          stripeSubscriptionId:
            session.subscription as string,
        },
      });

      console.log(
        'UTILISATEUR MIS À JOUR :',
        userId,
      );
    }

    // ===========================
    // Abonnement supprimé
    // ===========================

    if (
      event.type ===
      'customer.subscription.deleted'
    ) {
      const subscription =
        event.data.object as Stripe.Subscription;

      const customerId =
        subscription.customer as string;

      const user =
        await this.prisma.user.findFirst({
          where: {
            stripeCustomerId: customerId,
          },
        });

      if (user) {
        const freePlan =
          await this.prisma.subscriptionPlan.findUnique({
            where: {
              name: 'FREE',
            },
          });

        if (freePlan) {
          await this.prisma.user.update({
            where: {
              id: user.id,
            },

            data: {
              subscriptionId:
                freePlan.id,

              subscriptionStatus:
                'FREE',

              stripeSubscriptionId:
                null,
            },
          });
        }
      }
    }

    return {
      received: true,
    };
  }
}

