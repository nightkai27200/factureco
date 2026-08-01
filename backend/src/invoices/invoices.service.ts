import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ============================================================
   * CRÉER UNE FACTURE
   * ============================================================
   */
  async create(data: any) {
    const {
      items,
      ...invoiceData
    } = data;

    // ------------------------------------------------------------
    // Vérification des lignes
    // ------------------------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException(
        'Une facture doit contenir au moins une ligne.',
      );
    }

    // ------------------------------------------------------------
    // Vérification des articles
    // ------------------------------------------------------------

    for (const item of items) {
      if (!item.description) {
        throw new BadRequestException(
          'La description d’une ligne est obligatoire.',
        );
      }

      if (
        item.quantity === undefined ||
        Number(item.quantity) <= 0
      ) {
        throw new BadRequestException(
          'La quantité doit être supérieure à 0.',
        );
      }

      if (
        item.unitPrice === undefined ||
        Number(item.unitPrice) < 0
      ) {
        throw new BadRequestException(
          'Le prix unitaire ne peut pas être négatif.',
        );
      }
    }

    // ------------------------------------------------------------
    // TVA
    // ------------------------------------------------------------

    const vatRate = Number(data.vatRate ?? 20);

    const allowedVatRates = [
      0,
      5.5,
      10,
      20,
    ];

    if (!allowedVatRates.includes(vatRate)) {
      throw new BadRequestException(
        'Taux de TVA invalide. Autorisés : 0, 5.5, 10, 20.',
      );
    }

    // ------------------------------------------------------------
    // Calcul HT
    // ------------------------------------------------------------

    const subtotal = this.roundMoney(
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity) *
            Number(item.unitPrice),
        0,
      ),
    );

    // ------------------------------------------------------------
    // Calcul TVA
    // ------------------------------------------------------------

    const vatAmount = this.roundMoney(
      subtotal * vatRate / 100,
    );

    // ------------------------------------------------------------
    // Calcul TTC
    // ------------------------------------------------------------

    const amount = this.roundMoney(
      subtotal + vatAmount,
    );

    // ------------------------------------------------------------
    // Numéro de facture
    // ------------------------------------------------------------

    const number =
      await this.generateInvoiceNumber();

    // ------------------------------------------------------------
    // Création
    // ------------------------------------------------------------

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,

        number,

        status: InvoiceStatus.DRAFT,

        subtotal,

        vatRate,

        vatAmount,

        amount,

        invoiceItems: {
          create: items.map((item) => ({
            description: item.description,

            quantity: Number(
              item.quantity,
            ),

            unitPrice: Number(
              item.unitPrice,
            ),

            total: this.roundMoney(
              Number(item.quantity) *
                Number(item.unitPrice),
            ),
          })),
        },
      },

      include: {
        client: true,

        invoiceItems: true,

        user: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  /**
   * ============================================================
   * NUMÉRO DE FACTURE
   * ============================================================
   *
   * Exemple :
   *
   * FAC-2026-000001
   * FAC-2026-000002
   * FAC-2026-000003
   *
   * IMPORTANT :
   * Cette méthode est une première version.
   * Pour une application avec beaucoup d'utilisateurs,
   * il faudra idéalement gérer la séquence en base de données.
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date()
      .getFullYear();

    const prefix = `FAC-${year}-`;

    const lastInvoice =
      await this.prisma.invoice.findFirst({
        where: {
          number: {
            startsWith: prefix,
          },
        },

        orderBy: {
          number: 'desc',
        },

        select: {
          number: true,
        },
      });

    let sequence = 1;

    if (lastInvoice?.number) {
      const lastSequence =
        Number(
          lastInvoice.number
            .replace(prefix, ''),
        );

      if (
        Number.isFinite(lastSequence)
      ) {
        sequence =
          lastSequence + 1;
      }
    }

    return (
      prefix +
      String(sequence).padStart(6, '0')
    );
  }

  /**
   * ============================================================
   * ARRONDI MONÉTAIRE
   * ============================================================
   */
  private roundMoney(
    value: number,
  ): number {
    return Math.round(
      (value + Number.EPSILON) * 100,
    ) / 100;
  }

  /**
   * ============================================================
   * TOUTES LES FACTURES
   * ============================================================
   */
  async findAll(
    userId: string,
  ) {
    return this.prisma.invoice.findMany({
      where: {
        userId,
      },

      include: {
        client: true,

        quote: true,

        invoiceItems: true,

        user: {
          include: {
            company: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * ============================================================
   * UNE FACTURE
   * ============================================================
   */
  async findOne(
    id: string,
    userId: string,
  ) {
    const invoice =
      await this.prisma.invoice.findFirst({
        where: {
          id,
          userId,
        },

        include: {
          client: true,

          quote: true,

          invoiceItems: true,

          user: {
            include: {
              company: true,
            },
          },
        },
      });

    if (!invoice) {
      throw new NotFoundException(
        'Facture introuvable.',
      );
    }

    return invoice;
  }

  /**
   * ============================================================
   * MODIFIER UNE FACTURE
   * ============================================================
   */
  async update(
    id: string,
    userId: string,
    data: any,
  ) {
    const invoice =
      await this.findOne(
        id,
        userId,
      );

    // ----------------------------------------------------------
    // Ne pas modifier une facture payée ou annulée
    // ----------------------------------------------------------

    if (
      invoice.status ===
        InvoiceStatus.PAID ||
      invoice.status ===
        InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cette facture ne peut plus être modifiée.',
      );
    }

    return this.prisma.invoice.update({
      where: {
        id: invoice.id,
      },

      data,

      include: {
        client: true,

        invoiceItems: true,

        user: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  /**
   * ============================================================
   * SUPPRIMER UNE FACTURE
   * ============================================================
   */
  async remove(
    id: string,
    userId: string,
  ) {
    const invoice =
      await this.findOne(
        id,
        userId,
      );

    // ----------------------------------------------------------
    // Protection
    // ----------------------------------------------------------

    if (
      invoice.status ===
        InvoiceStatus.PAID
    ) {
      throw new BadRequestException(
        'Une facture payée ne peut pas être supprimée.',
      );
    }

    return this.prisma.invoice.delete({
      where: {
        id: invoice.id,
      },
    });
  }

  /**
   * ============================================================
   * FACTURE COMPLÈTE POUR PDF
   * ============================================================
   */
  async findOneForPdf(
    id: string,
    userId: string,
  ) {
    const invoice =
      await this.prisma.invoice.findFirst({
        where: {
          id,
          userId,
        },

        include: {
          client: true,

          quote: true,

          invoiceItems: true,

          user: {
            include: {
              company: true,
            },
          },
        },
      });

    if (!invoice) {
      throw new NotFoundException(
        'Facture introuvable.',
      );
    }

    return invoice;
  }

  /**
   * ============================================================
   * CHANGEMENT DE STATUT
   * ============================================================
   */
  async updateStatus(
    id: string,
    userId: string,
    status: InvoiceStatus,
  ) {
    const invoice =
      await this.findOne(
        id,
        userId,
      );

    // Même statut
    if (
      invoice.status === status
    ) {
      return invoice;
    }

    const allowedTransitions:
      Record<
        InvoiceStatus,
        InvoiceStatus[]
      > = {
        DRAFT: [
          InvoiceStatus.SENT,
          InvoiceStatus.CANCELLED,
        ],

        SENT: [
          InvoiceStatus.PAID,
          InvoiceStatus.CANCELLED,
        ],

        PAID: [],

        CANCELLED: [],
      };

    const allowed =
      allowedTransitions[
        invoice.status
      ] ?? [];

    if (
      !allowed.includes(status)
    ) {
      throw new BadRequestException(
        `Impossible de passer de ${invoice.status} à ${status}.`,
      );
    }

    return this.prisma.invoice.update({
      where: {
        id: invoice.id,
      },

      data: {
        status,
      },

      include: {
        client: true,

        quote: true,

        invoiceItems: true,

        user: {
          include: {
            company: true,
          },
        },
      },
    });
  }
}