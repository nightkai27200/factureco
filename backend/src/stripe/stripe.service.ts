
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

  // ==========================================
  // Stripe Customer Portal
  // ==========================================

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

  // ==========================================
  // Création Checkout Stripe
  // ==========================================

  async createCheckoutSession(
    plan: string,
    email: string,
    userId: string,
  ) {
    // Plans autorisés
    const allowedPlans = [
      'FREE',
      'FONDATEUR',
      'STARTER',
      'PRO',
    ];

    const normalizedPlan = plan.toUpperCase();

    if (!allowedPlans.includes(normalizedPlan)) {
      throw new Error(
        `Plan "${plan}" non autorisé`,
      );
    }

    // Le plan FREE ne doit pas passer par Stripe
    if (normalizedPlan === 'FREE') {
      throw new Error(
        'Le plan FREE ne nécessite pas de paiement Stripe',
      );
    }

    // Recherche du plan en base
    const subscriptionPlan =
      await this.prisma.subscriptionPlan.findUnique({
        where: {
          name: normalizedPlan,
        },
      });

    if (!subscriptionPlan) {
      throw new Error(
        `Plan "${normalizedPlan}" introuvable dans la base de données`,
      );
    }

    // Vérification du Price ID Stripe
    if (!subscriptionPlan.stripePriceId) {
      throw new Error(
        `Le plan "${normalizedPlan}" n'a pas de prix Stripe configuré`,
      );
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ??
      'https://factureco.vercel.app';

    // Création de la session Stripe
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
          `${frontendUrl}/payment-success` +
          '?session_id={CHECKOUT_SESSION_ID}',

        cancel_url:
          `${frontendUrl}/payment-cancel`,

        metadata: {
          plan: normalizedPlan,
          email,
          userId,
        },

        subscription_data: {
          metadata: {
            plan: normalizedPlan,
            userId,
          },
        },
      });

    console.log(
      '========== CHECKOUT STRIPE =========='
    );

    console.log(
      'PLAN :',
      normalizedPlan,
    );

    console.log(
      'PRICE ID :',
      subscriptionPlan.stripePriceId,
    );

    console.log(
      'USER ID :',
      userId,
    );

    console.log(
      'SESSION ID :',
      session.id,
    );

    console.log(
      '====================================='
    );

    return {
      url: session.url,
    };
  }

  // ==========================================
  // Webhook Stripe
  // ==========================================

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

    // ==========================================
    // Paiement réussi
    // ==========================================

    if (
      event.type ===
      'checkout.session.completed'
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

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

      // Vérifier le Customer
      if (!session.customer) {
        throw new Error(
          'Customer Stripe manquant dans la session Checkout',
        );
      }

      // Vérifier l'abonnement
      if (!session.subscription) {
        throw new Error(
          'Subscription Stripe manquante dans la session Checkout',
        );
      }

      const normalizedPlan =
        plan.toUpperCase();

      // Recherche du plan correspondant
      const subscriptionPlan =
        await this.prisma.subscriptionPlan.findUnique({
          where: {
            name: normalizedPlan,
          },
        });

      if (!subscriptionPlan) {
        throw new Error(
          `Plan "${normalizedPlan}" introuvable`,
        );
      }

      // Mise à jour de l'utilisateur
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
        '========== UTILISATEUR MIS À JOUR ==========',
      );

      console.log(
        'USER ID :',
        userId,
      );

      console.log(
        'PLAN :',
        normalizedPlan,
      );

      console.log(
        'STRIPE CUSTOMER ID :',
        session.customer,
      );

      console.log(
        'STRIPE SUBSCRIPTION ID :',
        session.subscription,
      );

      console.log(
        '============================================',
      );
    }

    // ==========================================
    // Abonnement supprimé
    // ==========================================

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

          console.log(
            'Abonnement supprimé pour :',
            user.id,
          );
        }
      }
    }

    return {
      received: true,
    };
  }
}

