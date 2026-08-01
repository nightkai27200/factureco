import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.subscriptionPlan.upsert({
    where: {
      name: 'FONDATEUR',
    },

    update: {
      price: 4.99,
      stripeProductId: 'prod_TON_PRODUIT_STRIPE',
      stripePriceId: 'price_TON_PRIX_STRIPE',

      features: [
        'Clients illimités',
        'Factures PDF',
        'Logo entreprise',
        'Tarif fondateur à vie',
      ],
    },

    create: {
      name: 'FONDATEUR',
      price: 4.99,

      stripeProductId: 'prod_UzbMnYV326xjDg',
      stripePriceId: 'price_1TzcA8KfWRAApe6rQJlQ4x8h',

      features: [
        'Clients illimités',
        'Factures PDF',
        'Logo entreprise',
        'Tarif fondateur à vie',
      ],
    },
  });

  console.log('Plan FONDATEUR créé/mis à jour');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());