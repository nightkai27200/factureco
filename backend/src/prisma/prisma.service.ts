
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL n\'est pas configurée');
    }

    try {
      const parsedUrl = new URL(databaseUrl);

      console.log(
        'DATABASE HOST:',
        parsedUrl.hostname
      );

      console.log(
        'DATABASE PORT:',
        parsedUrl.port || '5432'
      );

      console.log(
        'DATABASE USER:',
        parsedUrl.username
      );

    } catch (error) {
      console.error(
        'DATABASE_URL invalide'
      );

      throw error;
    }

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();

    console.log(
      'Prisma connecté à la base de données'
    );
  }
}

