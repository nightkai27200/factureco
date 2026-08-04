import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

import { InvoiceComplianceValidator } from './compliance/invoice-compliance.validator';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly complianceValidator: InvoiceComplianceValidator,
  ) {}

  // ============================================================
  // CRÉER UNE FACTURE
  // ============================================================

  async create(data: any) {
    const {
      items,
      ...invoiceData
    } = data;

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException(
        'Une facture doit contenir au moins une ligne.',
      );
    }

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

    const vatRate = Number(
      data.vatRate ?? 20,
    );

    const allowedVatRates = [
      0,
      5.5,
      10,
      20,
    ];

    if (
      !allowedVatRates.includes(
        vatRate,
      )
    ) {
      throw new BadRequestException(
        'Taux de TVA invalide. Autorisés : 0, 5.5, 10, 20.',
      );
    }

    const subtotal =
      this.roundMoney(
        items.reduce(
          (
            sum: number,
            item: any,
          ) =>
            sum +
            Number(item.quantity) *
              Number(item.unitPrice),
          0,
        ),
      );

    const vatAmount =
      this.roundMoney(
        (subtotal * vatRate) / 100,
      );

    const amount =
      this.roundMoney(
        subtotal + vatAmount,
      );

    const number =
      await this.generateInvoiceNumber();

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
          create: items.map(
            (item: any) => ({
              description:
                item.description,

              quantity: Number(
                item.quantity,
              ),

              unitPrice: Number(
                item.unitPrice,
              ),

              vatRate: Number(
                item.vatRate ??
                  vatRate,
              ),

              vatAmount:
                this.roundMoney(
                  Number(
                    item.quantity,
                  ) *
                    Number(
                      item.unitPrice,
                    ) *
                    Number(
                      item.vatRate ??
                        vatRate,
                    ) /
                    100,
                ),

              total:
                this.roundMoney(
                  Number(
                    item.quantity,
                  ) *
                    Number(
                      item.unitPrice,
                    ),
                ),
            }),
          ),
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

  // ============================================================
  // NUMÉRO DE FACTURE
  // ============================================================

  private async generateInvoiceNumber(): Promise<string> {
    const year =
      new Date().getFullYear();

    const prefix =
      `FAC-${year}-`;

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
          lastInvoice.number.replace(
            prefix,
            '',
          ),
        );

      if (
        Number.isFinite(
          lastSequence,
        )
      ) {
        sequence =
          lastSequence + 1;
      }
    }

    return (
      prefix +
      String(sequence).padStart(
        6,
        '0',
      )
    );
  }

  // ============================================================
  // ARRONDI
  // ============================================================

  private roundMoney(
    value: number,
  ): number {
    return (
      Math.round(
        (value + Number.EPSILON) *
          100,
      ) / 100
    );
  }

  // ============================================================
  // TOUTES LES FACTURES
  // ============================================================

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

  // ============================================================
  // UNE FACTURE
  // ============================================================

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

  // ============================================================
  // MODIFIER
  // ============================================================

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

  // ============================================================
  // SUPPRIMER
  // ============================================================

  async remove(
    id: string,
    userId: string,
  ) {
    const invoice =
      await this.findOne(
        id,
        userId,
      );

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

  // ============================================================
  // FACTURE POUR PDF
  // ============================================================

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

  // ============================================================
  // CHANGER LE STATUT
  // ============================================================

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

  // ============================================================
  // VALIDATION E-INVOICE
  // ============================================================

  async validateForElectronicInvoicing(
    id: string,
    userId: string,
  ) {
    const invoice =
      await this.findOne(
        id,
        userId,
      );

    const result =
      this.complianceValidator.validate(
        invoice,
      );

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,

      valid: result.valid,

      errors: result.errors,

      warnings: result.warnings,
    };
  }
}