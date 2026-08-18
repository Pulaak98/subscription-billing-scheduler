import { ConfigService } from '@nestjs/config';

import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeAll(() => {
    const configService = {
      get: jest.fn().mockReturnValue(
        'postgresql://postgres:postgres@localhost:5432/subscription_billing',
      ),
    } as unknown as ConfigService;

    databaseService = new DatabaseService(configService);
  });

  afterAll(async () => {
    await databaseService.onModuleDestroy();
  });

  it('should create a Kysely database instance', () => {
    expect(databaseService).toBeDefined();
  });

  it('should expose a Kysely query interface', () => {
    expect(typeof databaseService.selectFrom).toBe('function');
  });
});