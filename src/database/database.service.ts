import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';

import { Database } from './database.types';

// PostgreSQL DATE is a calendar date, not a point in time.
// Keep it as YYYY-MM-DD instead of converting it to a JavaScript Date.
types.setTypeParser(1082, (value) => value);

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