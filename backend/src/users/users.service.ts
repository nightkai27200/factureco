import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { SubscriptionStatus } from '@prisma/client';


@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
  ) {}


  // ==========================================
  // CRÉATION UTILISATEUR
  // ==========================================

  async create(data: {
    email: string;
    name?: string;
    password: string;
    plan?: string;
  }) {

    console.log(
      "DONNEES RECUES :",
      data
    );


    const selectedPlan =
      await this.prisma.subscriptionPlan.findUnique({

        where: {
          name: data.plan || "FREE",
        },

      });


    if (!selectedPlan) {

      throw new Error(
        `Le plan ${data.plan || "FREE"} n'existe pas`
      );

    }


    const hash =
      await bcrypt.hash(
        data.password,
        10,
      );


    return this.prisma.$transaction(
      async (tx) => {

        const user =
          await tx.user.create({

            data: {

              email: data.email,

              name:
                data.name ||
                "Utilisateur",

              passwordHash: hash,

              subscriptionId:
                selectedPlan.id,

              subscriptionStatus:
                data.plan === "STARTER"
                  ? SubscriptionStatus.PENDING
                  : SubscriptionStatus.FREE,

            },

          });


        await tx.company.create({

          data: {

            name:
              `${data.name || "Mon"} Entreprise`,

            userId:
              user.id,

          },

        });


        return user;

      }
    );

  }


  // ==========================================
  // RECHERCHE PAR EMAIL
  // ==========================================

  async findOneByEmail(
    email: string,
  ) {

    return this.prisma.user.findUnique({

      where: {
        email,
      },

      include: {

        subscription: true,

        company: true,

      },

    });

  }


  // ==========================================
  // MON PROFIL
  // GET /users/me
  // ==========================================

  async getMe(
    userId: string,
  ) {

    const user =
      await this.prisma.user.findUnique({

        where: {
          id: userId,
        },

        select: {

          id: true,

          name: true,

          email: true,

          role: true,

        },

      });


    if (!user) {

      throw new NotFoundException(
        'Utilisateur introuvable.',
      );

    }


    return user;

  }


  // ==========================================
  // MODIFIER MON PROFIL
  // PATCH /users/me
  // ==========================================

  async updateMe(
    userId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {

    const user =
      await this.prisma.user.findUnique({

        where: {
          id: userId,
        },

      });


    if (!user) {

      throw new NotFoundException(
        'Utilisateur introuvable.',
      );

    }


    // ------------------------------------------
    // Vérification de l'email
    // ------------------------------------------

    if (
      data.email &&
      data.email !== user.email
    ) {

      const existingUser =
        await this.prisma.user.findUnique({

          where: {
            email: data.email,
          },

        });


      if (
        existingUser &&
        existingUser.id !== userId
      ) {

        throw new BadRequestException(
          'Cette adresse email est déjà utilisée.',
        );

      }

    }


    const updatedUser =
      await this.prisma.user.update({

        where: {
          id: userId,
        },

        data: {

          ...(data.name !== undefined && {
            name: data.name,
          }),

          ...(data.email !== undefined && {
            email: data.email,
          }),

        },

        select: {

          id: true,

          name: true,

          email: true,

          role: true,

        },

      });


    return updatedUser;

  }


  // ==========================================
  // MODIFIER MOT DE PASSE
  // PATCH /users/me/password
  // ==========================================

  async updatePassword(
    userId: string,
    password: string,
  ) {

    if (!password) {

      throw new BadRequestException(
        'Le mot de passe est obligatoire.',
      );

    }


    if (password.length < 6) {

      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 6 caractères.',
      );

    }


    const user =
      await this.prisma.user.findUnique({

        where: {
          id: userId,
        },

      });


    if (!user) {

      throw new NotFoundException(
        'Utilisateur introuvable.',
      );

    }


    const hash =
      await bcrypt.hash(
        password,
        10,
      );


    await this.prisma.user.update({

      where: {
        id: userId,
      },

      data: {

        passwordHash: hash,

      },

    });


    return {

      message:
        'Mot de passe modifié avec succès.',

    };

  }


  // ==========================================
  // RESET PASSWORD
  // ==========================================

  async resetPassword(
    email: string,
    newPassword: string,
  ) {

    const hash =
      await bcrypt.hash(
        newPassword,
        10,
      );


    return this.prisma.user.update({

      where: {
        email,
      },

      data: {

        passwordHash: hash,

      },

    });

  }

}