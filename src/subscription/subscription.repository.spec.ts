import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SubscriptionRepository } from './subscription.repository';

describe('SubscriptionRepository', () => {
  let repository: SubscriptionRepository;

  let db: any;

  beforeEach(() => {
    db = {
      insertInto: jest.fn(),
      selectFrom: jest.fn(),
    };

    repository = new SubscriptionRepository(db);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});