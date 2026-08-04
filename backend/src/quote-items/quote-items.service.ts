import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';

@Injectable()
export class QuoteItemsService {
  constructor(
    private readonly prisma: PrismaService,
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
  // CREER UNE LIGNE
  // =========================================================

  async create(
    dto: CreateQuoteItemDto,
    userId: string,
  ) {
    // Vérifier que le devis appartient bien à l'utilisateur
    const quote =
      await this.prisma.quote.findFirst({
        where: {
          id: dto.quoteId,
          userId,
        },
      });

    if (!quote) {
      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    // Vérifier la description
    if (
      !dto.description ||
      dto.description.trim().length === 0
    ) {
      throw new BadRequestException(
        'La description est obligatoire.',
      );
    }

    // Convertir en nombres
    const quantity =
      Number(dto.quantity);

    const unitPrice =
      Number(dto.unitPrice);

    // Vérifier quantité
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new BadRequestException(
        'La quantité doit être supérieure à 0.',
      );
    }

    // Vérifier prix
    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new BadRequestException(
        'Le prix unitaire est invalide.',
      );
    }

    // Total ligne
    const total =
      quantity *
      unitPrice;

    // Créer la ligne
    const item =
      await this.prisma.quoteItem.create({
        data: {
          description:
            dto.description.trim(),

          quantity,

          unitPrice,

          total,

          quoteId:
            dto.quoteId,
        },
      });

    // Recalculer HT / TVA / TTC
    await this.updateQuoteTotals(
      dto.quoteId,
    );

    // Retourner la ligne
    return item;
  }

  // =========================================================
  // TOUTES LES LIGNES D'UN DEVIS
  // =========================================================

  async findAll(
    quoteId: string,
    userId: string,
  ) {
    // Vérifier que le devis appartient
    // à l'utilisateur connecté
    const quote =
      await this.prisma.quote.findFirst({
        where: {
          id: quoteId,
          userId,
        },
      });

    if (!quote) {
      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    return this.prisma.quoteItem.findMany({
      where: {
        quoteId,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // =========================================================
  // UNE LIGNE
  // =========================================================

  async findOne(
    id: string,
    userId: string,
  ) {
    const item =
      await this.prisma.quoteItem.findFirst({
        where: {
          id,

          quote: {
            userId,
          },
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Ligne de devis introuvable.',
      );
    }

    return item;
  }

  // =========================================================
  // MODIFIER UNE LIGNE
  // =========================================================

  async update(
    id: string,
    dto: UpdateQuoteItemDto,
    userId: string,
  ) {
    // Vérifier que la ligne appartient
    // au devis de l'utilisateur
    const item =
      await this.findOne(
        id,
        userId,
      );

    // Garder les anciennes valeurs
    // si elles ne sont pas envoyées
    const quantity =
      dto.quantity !== undefined
        ? Number(dto.quantity)
        : item.quantity;

    const unitPrice =
      dto.unitPrice !== undefined
        ? Number(dto.unitPrice)
        : item.unitPrice;

    const description =
      dto.description !== undefined
        ? dto.description.trim()
        : item.description;

    // Description
    if (
      !description ||
      description.length === 0
    ) {
      throw new BadRequestException(
        'La description est obligatoire.',
      );
    }

    // Quantité
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new BadRequestException(
        'La quantité doit être supérieure à 0.',
      );
    }

    // Prix
    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new BadRequestException(
        'Le prix unitaire est invalide.',
      );
    }

    // Nouveau total
    const total =
      quantity *
      unitPrice;

    // Modifier la ligne
    const updated =
      await this.prisma.quoteItem.update({
        where: {
          id,
        },

        data: {
          description,

          quantity,

          unitPrice,

          total,
        },
      });

    // Recalculer le devis
    await this.updateQuoteTotals(
      item.quoteId,
    );

    return updated;
  }

  // =========================================================
  // SUPPRIMER UNE LIGNE
  // =========================================================

  async remove(
    id: string,
    userId: string,
  ) {
    // Vérifier propriétaire
    const item =
      await this.findOne(
        id,
        userId,
      );

    // Supprimer
    const deleted =
      await this.prisma.quoteItem.delete({
        where: {
          id,
        },
      });

    // Recalculer le devis
    await this.updateQuoteTotals(
      item.quoteId,
    );

    return deleted;
  }

  // =========================================================
  // RECALCUL HT / TVA / TTC
  // =========================================================

  private async updateQuoteTotals(
    quoteId: string,
  ) {
    // Récupérer le devis
    const quote =
      await this.prisma.quote.findUnique({
        where: {
          id: quoteId,
        },
      });

    if (!quote) {
      throw new NotFoundException(
        'Devis introuvable.',
      );
    }

    // Récupérer les lignes
    const items =
      await this.prisma.quoteItem.findMany({
        where: {
          quoteId,
        },
      });

    // Calcul HT
    const subtotal =
      items.reduce(
        (
          sum: number,
          item,
        ) => {
          return (
            sum +
            item.quantity *
            item.unitPrice
          );
        },
        0,
      );

    // TVA
    const vatRate =
      quote.vatRate ?? 20;

    // Vérifier le taux
    if (
      !this.allowedVatRates.includes(
        vatRate,
      )
    ) {
      throw new BadRequestException(
        'Taux de TVA invalide. Valeurs autorisées : 0, 5.5, 10, 20.',
      );
    }

    // Montant TVA
    const vatAmount =
      subtotal *
      vatRate /
      100;

    // TTC
    const amount =
      subtotal +
      vatAmount;

    // Mettre à jour le devis
    await this.prisma.quote.update({
      where: {
        id: quoteId,
      },

      data: {
        subtotal,

        vatRate,

        vatAmount,

        amount,
      },
    });
  }
}