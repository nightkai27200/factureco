import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  QuoteStatus,
  InvoiceStatus,
} from '@prisma/client';

import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class QuotesService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // =========================================================
  // TVA AUTORISEE
  // =========================================================

  private readonly allowedVatRates = [
    0,
    5.5,
    10,
    20,
  ];

  // =========================================================
  // CALCULER LES TOTAUX
  // =========================================================

  private calculateTotals(
    items: any[],
    vatRate: number,
  ) {

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new BadRequestException(
        'Le devis doit contenir au moins une ligne.',
      );
    }

    if (
      !this.allowedVatRates.includes(vatRate)
    ) {
      throw new BadRequestException(
        'Taux de TVA invalide. Valeurs autorisées : 0, 5.5, 10, 20.',
      );
    }

    const subtotal = items.reduce(
      (
        sum: number,
        item: any,
      ) => {

        const quantity =
          Number(item.quantity);

        const unitPrice =
          Number(item.unitPrice);

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          throw new BadRequestException(
            'La quantité doit être supérieure à 0.',
          );
        }

        if (
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          throw new BadRequestException(
            'Le prix unitaire est invalide.',
          );
        }

        if (
          !item.description ||
          typeof item.description !== 'string'
        ) {
          throw new BadRequestException(
            'La description de chaque ligne est obligatoire.',
          );
        }

        return (
          sum +
          quantity *
          unitPrice
        );
      },
      0,
    );

    const vatAmount =
      subtotal *
      vatRate /
      100;

    const amount =
      subtotal +
      vatAmount;

    return {
      subtotal,
      vatRate,
      vatAmount,
      amount,
    };
  }

  // =========================================================
  // VERIFIER LE CLIENT
  // =========================================================

  private async verifyClient(
    clientId: string,
    userId: string,
  ) {

    const client =
      await this.prisma.client.findFirst({
        where: {
          id: clientId,
          userId,
        },
      });

    if (!client) {
      throw new NotFoundException(
        'Client introuvable.',
      );
    }

    return client;
  }

  // =========================================================
  // CREER UN DEVIS
  // =========================================================

  async create(data: any) {

    console.log(
      '=== CREATION DEVIS ===',
    );

    console.log(
      'DATA DEVIS :',
      data,
    );

    // -------------------------------------------------------
    // Vérification limite abonnement
    // -------------------------------------------------------

    await this.subscriptionService.checkQuoteLimit(
      data.userId,
    );

    console.log(
      'LIMITE DEVIS OK',
    );

    // -------------------------------------------------------
    // Vérifier le client
    // -------------------------------------------------------

    await this.verifyClient(
      data.clientId,
      data.userId,
    );

    // -------------------------------------------------------
    // TVA
    // -------------------------------------------------------

    const vatRate =
      data.vatRate ?? 20;

    // -------------------------------------------------------
    // Calcul
    // -------------------------------------------------------

    const totals =
      this.calculateTotals(
        data.items,
        Number(vatRate),
      );

    // -------------------------------------------------------
    // Numéro devis
    // -------------------------------------------------------

    const number =
      `DEV-${Date.now()}`;

    // -------------------------------------------------------
    // Création
    // -------------------------------------------------------

    const quote =
      await this.prisma.quote.create({

        data: {

          number,

          status:
            QuoteStatus.DRAFT,

          title:
            data.title,

          description:
            data.description,

          subtotal:
            totals.subtotal,

          vatRate:
            totals.vatRate,

          vatAmount:
            totals.vatAmount,

          amount:
            totals.amount,

          clientId:
            data.clientId,

          userId:
            data.userId,

          quoteItems: {

            create:
              data.items.map(
                (item: any) => {

                  const quantity =
                    Number(
                      item.quantity,
                    );

                  const unitPrice =
                    Number(
                      item.unitPrice,
                    );

                  return {

                    description:
                      item.description,

                    quantity,

                    unitPrice,

                    total:
                      quantity *
                      unitPrice,
                  };
                },
              ),
          },
        },

        include: {

          client: true,

          quoteItems: true,
        },
      });

    console.log(
      'DEVIS CREE :',
      quote,
    );

    return quote;
  }

  // =========================================================
  // TOUS LES DEVIS
  // =========================================================

  async findAllByUser(
    userId: string,
  ) {

    return this.prisma.quote.findMany({

      where: {
        userId,
      },

      include: {

        client: true,

        quoteItems: true,
      },

      orderBy: {

        createdAt:
          'desc',
      },
    });
  }

  // =========================================================
  // UN DEVIS
  // =========================================================

  async findOne(
    id: string,
    userId: string,
  ) {

    const quote =
      await this.prisma.quote.findFirst({

        where: {

          id,

          userId,
        },

        include: {

          client: true,

          quoteItems: true,
        },
      });

    if (!quote) {

      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    return quote;
  }

  // =========================================================
  // DEVIS POUR PDF
  // =========================================================

  async findOneForPdf(
    id: string,
    userId: string,
  ) {

    const quote =
      await this.prisma.quote.findFirst({

        where: {

          userId,

          OR: [

            {
              id,
            },

            {
              number: id,
            },
          ],
        },

        include: {

          client: true,

          quoteItems: true,

          user: {

            include: {

              company: true,
            },
          },
        },
      });

    if (!quote) {

      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    return quote;
  }

 // =========================================================
// MODIFIER UN DEVIS
// =========================================================

async update(
  id: string,
  userId: string,
  data: any,
) {
  // -------------------------------------------------------
  // Vérifier que le devis existe
  // -------------------------------------------------------

  const quote =
    await this.prisma.quote.findFirst({
      where: {
        id,
        userId,
      },

      include: {
        quoteItems: true,
      },
    });

  if (!quote) {
    throw new NotFoundException(
      'Devis introuvable.',
    );
  }

  // -------------------------------------------------------
  // Un devis converti ne peut plus être modifié
  // -------------------------------------------------------

  if (
    quote.status === QuoteStatus.CONVERTED
  ) {
    throw new BadRequestException(
      'Un devis converti en facture ne peut plus être modifié.',
    );
  }

  // -------------------------------------------------------
  // Récupérer uniquement les champs autorisés
  // -------------------------------------------------------

  const title =
    data?.title;

  const description =
    data?.description;

  const clientId =
    data?.clientId;

  const items =
    data?.items;

  const receivedVatRate =
    data?.vatRate;

  // -------------------------------------------------------
  // TITRE
  // -------------------------------------------------------

  if (
    title !== undefined &&
    typeof title !== 'string'
  ) {
    throw new BadRequestException(
      'Le titre du devis est invalide.',
    );
  }

  // -------------------------------------------------------
  // DESCRIPTION
  // -------------------------------------------------------

  if (
    description !== undefined &&
    typeof description !== 'string'
  ) {
    throw new BadRequestException(
      'La description du devis est invalide.',
    );
  }

  // -------------------------------------------------------
  // CLIENT
  // -------------------------------------------------------

  if (clientId !== undefined) {
    if (
      typeof clientId !== 'string' ||
      clientId.trim() === ''
    ) {
      throw new BadRequestException(
        'Le client est invalide.',
      );
    }

    await this.verifyClient(
      clientId,
      userId,
    );
  }

  // -------------------------------------------------------
  // TVA
  // -------------------------------------------------------

  let vatRate =
    Number(quote.vatRate ?? 20);

  if (
    receivedVatRate !== undefined
  ) {
    vatRate =
      Number(receivedVatRate);
  }

  if (
    !Number.isFinite(vatRate)
  ) {
    throw new BadRequestException(
      'Le taux de TVA est invalide.',
    );
  }

  if (
    !this.allowedVatRates.includes(
      vatRate,
    )
  ) {
    throw new BadRequestException(
      'Taux de TVA invalide. Valeurs autorisées : 0, 5.5, 10, 20.',
    );
  }

  // -------------------------------------------------------
  // DÉTERMINER LES LIGNES
  // -------------------------------------------------------

  let quoteItems: any[];

  if (items !== undefined) {
    // -----------------------------------------------------
    // Nouvelles lignes envoyées
    // -----------------------------------------------------

    if (!Array.isArray(items)) {
      throw new BadRequestException(
        'Les lignes du devis doivent être un tableau.',
      );
    }

    if (items.length === 0) {
      throw new BadRequestException(
        'Le devis doit contenir au moins une ligne.',
      );
    }

    quoteItems =
      items.map((item: any) => ({
        description:
          item?.description,

        quantity:
          Number(item?.quantity),

        unitPrice:
          Number(item?.unitPrice),
      }));

  } else {
    // -----------------------------------------------------
    // Aucune ligne envoyée
    // On conserve les lignes existantes
    // -----------------------------------------------------

    quoteItems =
      quote.quoteItems.map(
        (item) => ({
          description:
            item.description,

          quantity:
            Number(item.quantity),

          unitPrice:
            Number(item.unitPrice),
        }),
      );
  }

  // -------------------------------------------------------
  // RECALCULER LES TOTAUX
  // -------------------------------------------------------

  const totals =
    this.calculateTotals(
      quoteItems,
      vatRate,
    );

  // -------------------------------------------------------
  // DONNÉES À METTRE À JOUR
  // -------------------------------------------------------

  const updateData: any = {
    subtotal:
      totals.subtotal,

    vatRate:
      totals.vatRate,

    vatAmount:
      totals.vatAmount,

    amount:
      totals.amount,
  };

  if (
    title !== undefined
  ) {
    updateData.title =
      title;
  }

  if (
    description !== undefined
  ) {
    updateData.description =
      description;
  }

  if (
    clientId !== undefined
  ) {
    updateData.clientId =
      clientId;
  }

  // -------------------------------------------------------
  // TRANSACTION
  // -------------------------------------------------------

  const updatedQuote =
    await this.prisma.$transaction(
      async (tx) => {

        // -------------------------------------------------
        // SI LES LIGNES SONT MODIFIÉES
        // -------------------------------------------------

        if (
          items !== undefined
        ) {

          await tx.quoteItem.deleteMany({
            where: {
              quoteId:
                quote.id,
            },
          });

          return tx.quote.update({

            where: {
              id:
                quote.id,
            },

            data: {

              ...updateData,

              quoteItems: {

                create:
                  quoteItems.map(
                    (item: any) => {

                      const quantity =
                        Number(
                          item.quantity,
                        );

                      const unitPrice =
                        Number(
                          item.unitPrice,
                        );

                      return {

                        description:
                          item.description,

                        quantity,

                        unitPrice,

                        total:
                          quantity *
                          unitPrice,
                      };
                    },
                  ),
              },
            },

            include: {

              client: true,

              quoteItems: true,
            },
          });
        }

        // -------------------------------------------------
        // SI LES LIGNES NE SONT PAS MODIFIÉES
        // -------------------------------------------------

        return tx.quote.update({

          where: {
            id:
              quote.id,
          },

          data:
            updateData,

          include: {

            client: true,

            quoteItems: true,
          },
        });
      },
    );



    // -------------------------------------------------------
    // Ne jamais modifier le statut ici
    // -------------------------------------------------------

    delete data.status;

    // -------------------------------------------------------
    // Ne jamais permettre de changer le propriétaire
    // -------------------------------------------------------

    delete data.userId;

    // -------------------------------------------------------
    // Ne jamais permettre de changer les montants
    // directement depuis ce PATCH
    // -------------------------------------------------------

    delete data.amount;

    delete data.subtotal;

    delete data.vatAmount;

    // -------------------------------------------------------
    // Client
    // -------------------------------------------------------

    if (data.clientId) {

      await this.verifyClient(
        data.clientId,
        userId,
      );

    }

    // -------------------------------------------------------
    // TVA
    // -------------------------------------------------------

    if (
      data.vatRate !== undefined
    ) {

      const vatRate =
        Number(data.vatRate);

      if (
        !this.allowedVatRates.includes(
          vatRate,
        )
      ) {

        throw new BadRequestException(
          'Taux de TVA invalide. Valeurs autorisées : 0, 5.5, 10, 20.',
        );
      }

      data.vatRate =
        vatRate;
    }

    // -------------------------------------------------------
    // Modification classique
    // -------------------------------------------------------

    return this.prisma.quote.update({

      where: {

        id,
      },

      data,

      include: {

        client: true,

        quoteItems: true,
      },
    });
  }

  // =========================================================
  // SUPPRIMER
  // =========================================================

  async remove(
    id: string,
    userId: string,
  ) {

    const quote =
      await this.prisma.quote.findFirst({

        where: {

          id,

          userId,
        },
      });

    if (!quote) {

      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    // -------------------------------------------------------
    // Un devis converti ne doit pas être supprimé
    // -------------------------------------------------------

    if (
      quote.status ===
      QuoteStatus.CONVERTED
    ) {

      throw new BadRequestException(
        'Un devis converti en facture ne peut pas être supprimé.',
      );
    }

    return this.prisma.quote.delete({

      where: {

        id,
      },
    });
  }

  // =========================================================
  // MODIFIER LE STATUT
  // =========================================================

  async updateStatus(
    id: string,
    userId: string,
    status: QuoteStatus,
  ) {

    const quote =
      await this.findOne(
        id,
        userId,
      );

    if (
      !Object.values(
        QuoteStatus,
      ).includes(status)
    ) {

      throw new BadRequestException(
        'Statut de devis invalide.',
      );
    }

    if (
      !this.canChangeStatus(
        quote.status,
        status,
      )
    ) {

      throw new BadRequestException(
        `Impossible de passer de ${quote.status} à ${status}.`,
      );
    }

    return this.prisma.quote.update({

      where: {

        id:
          quote.id,
      },

      data: {

        status,
      },

      include: {

        client: true,

        quoteItems: true,
      },
    });
  }

  // =========================================================
  // TRANSITIONS DE STATUT
  // =========================================================

  private canChangeStatus(
    current: QuoteStatus,
    next: QuoteStatus,
  ): boolean {

    const transitions:
      Record<
        QuoteStatus,
        QuoteStatus[]
      > = {

      DRAFT: [

        QuoteStatus.SENT,

      ],

      SENT: [

        QuoteStatus.ACCEPTED,

        QuoteStatus.REFUSED,

      ],

      ACCEPTED: [

        QuoteStatus.CONVERTED,

      ],

      REFUSED: [],

      CONVERTED: [],
    };

    return transitions[
      current
    ].includes(next);
  }

  // =========================================================
  // CONVERTIR EN FACTURE
  // =========================================================

  async convertToInvoice(
    id: string,
    userId: string,
  ) {

    const quote =
      await this.prisma.quote.findFirst({

        where: {

          id,

          userId,
        },

        include: {

          client: true,

          quoteItems: true,
        },
      });

    if (!quote) {

      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    // -------------------------------------------------------
    // Vérifier le statut
    // -------------------------------------------------------

    if (
      quote.status !==
      QuoteStatus.ACCEPTED
    ) {

      throw new BadRequestException(
        'Seul un devis accepté peut être converti en facture.',
      );
    }

    // -------------------------------------------------------
    // Vérifier les lignes
    // -------------------------------------------------------

    if (
      !quote.quoteItems ||
      quote.quoteItems.length === 0
    ) {

      throw new BadRequestException(
        'Impossible de convertir : le devis ne contient aucune ligne.',
      );
    }

    // -------------------------------------------------------
    // Vérifier si facture déjà créée
    // -------------------------------------------------------

    const existingInvoice =
      await this.prisma.invoice.findUnique({

        where: {

          quoteId:
            quote.id,
        },

        include: {

          client: true,

          invoiceItems: true,
        },
      });

    if (existingInvoice) {

      return existingInvoice;
    }

    // -------------------------------------------------------
    // Recalcul sécurisé
    // -------------------------------------------------------

    const subtotal =
      quote.quoteItems.reduce(

        (
          sum: number,
          item,
        ) =>
          sum +
          item.quantity *
          item.unitPrice,

        0,
      );

    const vatRate =
      quote.vatRate ?? 20;

    if (
      !this.allowedVatRates.includes(
        vatRate,
      )
    ) {

      throw new BadRequestException(
        'Le taux de TVA du devis est invalide.',
      );
    }

    const vatAmount =
      subtotal *
      vatRate /
      100;

    const amount =
      subtotal +
      vatAmount;

    // -------------------------------------------------------
    // Création facture
    // -------------------------------------------------------

    const invoice =
      await this.prisma.invoice.create({

        data: {

          number:
            `FAC-${Date.now()}`,

          status:
            InvoiceStatus.DRAFT,

          subtotal,

          vatRate,

          vatAmount,

          amount,

          clientId:
            quote.clientId,

          userId:
            quote.userId,

          quoteId:
            quote.id,

          invoiceItems: {

            create:
              quote.quoteItems.map(
                item => ({

                  description:
                    item.description,

                  quantity:
                    item.quantity,

                  unitPrice:
                    item.unitPrice,

                  vatRate:
                    vatRate,

                  vatAmount:
                    item.quantity *
                    item.unitPrice *
                    vatRate /
                    100,

                  total:
                    item.quantity *
                    item.unitPrice,
                }),
              ),
          },
        },

        include: {

          client: true,

          invoiceItems: true,
        },
      });

    // -------------------------------------------------------
    // Marquer le devis comme converti
    // -------------------------------------------------------

    await this.prisma.quote.update({

      where: {

        id:
          quote.id,
      },

      data: {

        status:
          QuoteStatus.CONVERTED,
      },
    });

    console.log(
      'FACTURE CREEE :',
      invoice,
    );

    return invoice;
  }
}