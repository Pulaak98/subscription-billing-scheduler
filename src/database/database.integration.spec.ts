import { ConfigService } from '@nestjs/config';


import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { DatabaseService } from './database.service';

describe('Database connection', () => {
  let database: DatabaseService;

  beforeAll(async () => {
    const configService = {
      get: jest.fn().mockReturnValue(
        'postgresql://postgres:postgres@localhost:5432/subscription_billing',
      ),
    } as unknown as ConfigService;

    database = new DatabaseService(configService);

    await database
      .selectNoFrom((eb) => eb.val(1).as('result'))
      .execute();
  });

  afterAll(async () => {
    await database.onModuleDestroy();
  });

  it('should connect to PostgreSQL through Kysely', async () => {
    const result = await database
      .selectNoFrom((eb) => eb.val(1).as('result'))
      .executeTakeFirst();

    expect(result?.result).toBe('1');
  });
});