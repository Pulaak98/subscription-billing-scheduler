import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { Database } from './database.types';

@Injectable()
export class DatabaseService
  extends Kysely<Database>
  implements OnModuleDestroy
{
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('database.url');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured');
    }

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    super({
      dialect: new PostgresDialect({
        pool,
      }),
    });

    this.pool = pool;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}