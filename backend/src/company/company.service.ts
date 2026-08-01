import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

@Injectable()
export class CompanyService {

  constructor(
    private prisma: PrismaService,
  ) {}

  // ============================================================
  // RÉCUPÉRER L'ENTREPRISE
  // ============================================================

  async find(
    userId: string,
  ) {

    return this.prisma.company.findUnique({

      where: {
        userId,
      },

    });

  }

  // ============================================================
  // CRÉER OU MODIFIER L'ENTREPRISE
  // ============================================================

  async create(
    userId: string,
    data: any,
  ) {

    // ----------------------------------------------------------
    // Nettoyage du SIRET
    // ----------------------------------------------------------

    const siret =
      data.siret
        ? String(data.siret)
            .replace(/\s/g, '')
            .trim()
        : null;

    // ----------------------------------------------------------
    // Nettoyage TVA
    // ----------------------------------------------------------

    const vatNumber =
      data.vatNumber
        ? String(data.vatNumber)
            .replace(/\s/g, '')
            .trim()
            .toUpperCase()
        : null;

    // ----------------------------------------------------------
    // Données autorisées
    // ----------------------------------------------------------

    const companyData = {

      name:
        data.name ??
        'Mon entreprise',

      address:
        data.address ??
        null,

      city:
        data.city ??
        null,

      phone:
        data.phone ??
        null,

      email:
        data.email ??
        null,

      website:
        data.website ??
        null,

      siret,

      vatNumber,

    };

    // ----------------------------------------------------------
    // Création ou mise à jour
    // ----------------------------------------------------------

    return this.prisma.company.upsert({

      where: {
        userId,
      },

      create: {

        userId,

        ...companyData,

        // Si un logo est envoyé dans data,
        // on le conserve.
        ...(data.logo
          ? {
              logo: data.logo,
            }
          : {}),

      },

      update: {

        ...companyData,

        // On ne modifie le logo que s'il
        // est réellement fourni.
        ...(data.logo
          ? {
              logo: data.logo,
            }
          : {}),

      },

    });

  }

  // ============================================================
  // MODIFIER L'ENTREPRISE
  // ============================================================

  async update(
    userId: string,
    data: any,
  ) {

    const company =
      await this.prisma.company.findUnique({

        where: {
          userId,
        },

      });

    // ----------------------------------------------------------
    // Nettoyage SIRET
    // ----------------------------------------------------------

    const siret =
      data.siret
        ? String(data.siret)
            .replace(/\s/g, '')
            .trim()
        : null;

    // ----------------------------------------------------------
    // Nettoyage TVA
    // ----------------------------------------------------------

    const vatNumber =
      data.vatNumber
        ? String(data.vatNumber)
            .replace(/\s/g, '')
            .trim()
            .toUpperCase()
        : null;

    // ----------------------------------------------------------
    // Données entreprise
    // ----------------------------------------------------------

    const companyData = {

      name:
        data.name ??
        'Mon entreprise',

      address:
        data.address ??
        null,

      city:
        data.city ??
        null,

      phone:
        data.phone ??
        null,

      email:
        data.email ??
        null,

      website:
        data.website ??
        null,

      siret,

      vatNumber,

    };

    // ==========================================================
    // ENTREPRISE EXISTANTE
    // ==========================================================

    if (company) {

      return this.prisma.company.update({

        where: {
          userId,
        },

        data: {

          ...companyData,

          // Ne pas effacer le logo existant
          // lors d'une simple modification.
          ...(data.logo
            ? {
                logo: data.logo,
              }
            : {}),

        },

      });

    }

    // ==========================================================
    // ENTREPRISE INEXISTANTE
    // ==========================================================

    return this.prisma.company.create({

      data: {

        userId,

        ...companyData,

        ...(data.logo
          ? {
              logo: data.logo,
            }
          : {}),

      },

    });

  }

}