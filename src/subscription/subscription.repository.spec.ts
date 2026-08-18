import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { SubscriptionRepository } from './subscription.repository';

describe('SubscriptionRepository', () => {
  let repository: SubscriptionRepository;
  let db: any;

  beforeEach(() => {
    db = {
      insertInto: jest.fn(),
      selectFrom: jest.fn(),
      updateTable: jest.fn(),
    };

    repository = new SubscriptionRepository(db);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        customer_reference: 'CUST-1001',
        status: 'active',
      };

      const executeTakeFirstOrThrow = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirstOrThrow,
      }));

      const values = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      db.insertInto.mockReturnValue({
        values,
      });

      const data = {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      };

      const result = await repository.create(data);

      expect(db.insertInto).toHaveBeenCalledWith('subscriptions');

      expect(values).toHaveBeenCalledWith({
        customer_reference: 'CUST-1001',
        description: 'Pro Plan',
        status: 'active',
        billing_state: 'ready',
        currency: 'USD',
        amount: '49.0000',
        start_date: '2026-08-16',
        next_billing_date: '2026-08-31',
        billing_anchor_day: 31,
        anchor_is_month_end: true,
        billing_failure_count: 0,
        version: 1,
      });

      expect(result).toEqual(subscription);
    });
  });

  describe('findById', () => {
    it('should find a subscription by id', async () => {
      const subscription = {
        id: 'subscription-id',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const where = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const selectAll = jest.fn((..._args: unknown[]) => ({
        where,
      }));

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findById('subscription-id');

      expect(db.selectFrom).toHaveBeenCalledWith('subscriptions');

      expect(where).toHaveBeenCalledWith('id', '=', 'subscription-id');

      expect(result).toEqual(subscription);
    });
  });

  describe('findMany', () => {
    it('should return subscriptions with no filters', async () => {
      const subscriptions = [
        { id: 'subscription-2' },
        { id: 'subscription-1' },
      ];

      const execute = jest.fn(async (..._args: unknown[]) => subscriptions);

      const offset = jest.fn((..._args: unknown[]) => ({
        execute,
      }));

      const limit = jest.fn((..._args: unknown[]) => ({
        offset,
      }));

      const orderBy = jest.fn((..._args: unknown[]) => ({
        limit,
      }));

      const selectAll = jest.fn((..._args: unknown[]) => ({
        orderBy,
      }));

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany();

      expect(orderBy).toHaveBeenCalledWith('id', 'desc');

      expect(limit).toHaveBeenCalledWith(20);
      expect(offset).toHaveBeenCalledWith(0);
      expect(result).toEqual(subscriptions);
    });

    it('should apply customer and status filters', async () => {
      const subscriptions = [
        {
          id: 'subscription-1',
          customer_reference: 'CUST-1001',
          status: 'active',
        },
      ];

      const execute = jest.fn(async (..._args: unknown[]) => subscriptions);

      const offset = jest.fn((..._args: unknown[]) => ({
        execute,
      }));

      const limit = jest.fn((..._args: unknown[]) => ({
        offset,
      }));

      const orderBy = jest.fn((..._args: unknown[]) => ({
        limit,
      }));

      const secondWhere = jest.fn((..._args: unknown[]) => ({
        orderBy,
      }));

      const firstWhere = jest.fn((..._args: unknown[]) => ({
        where: secondWhere,
      }));

      const selectAll = jest.fn((..._args: unknown[]) => ({
        where: firstWhere,
      }));

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany('CUST-1001', 'active', 10, 20);

      expect(firstWhere).toHaveBeenCalledWith(
        'customer_reference',
        '=',
        'CUST-1001',
      );

      expect(secondWhere).toHaveBeenCalledWith('status', '=', 'active');

      expect(limit).toHaveBeenCalledWith(10);
      expect(offset).toHaveBeenCalledWith(20);
      expect(result).toEqual(subscriptions);
    });
  });

  describe('claimBatch', () => {
    it('should claim an eligible bounded batch', async () => {
      const claimedSubscriptions = [
        {
          id: 'subscription-1',
          status: 'active',
          billing_state: 'ready',
        },
        {
          id: 'subscription-2',
          status: 'active',
          billing_state: 'ready',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => claimedSubscriptions,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        execute,
      }));

      const whereProcessingExpiry = jest.fn((..._args: unknown[]) => ({
        orderBy: jest.fn((..._args: unknown[]) => ({
          orderBy: jest.fn((..._args: unknown[]) => ({
            limit: jest.fn((..._args: unknown[]) => ({
              id: 'claimed-subquery',
            })),
          })),
        })),
      }));

      const whereBillingState = jest.fn((..._args: unknown[]) => ({
        where: whereProcessingExpiry,
      }));

      const whereBillingDate = jest.fn((..._args: unknown[]) => ({
        where: whereBillingState,
      }));

      const whereStatus = jest.fn((..._args: unknown[]) => ({
        where: whereBillingDate,
      }));

      const select = jest.fn((..._args: unknown[]) => ({
        where: whereStatus,
      }));

      const selectFrom = jest.fn((..._args: unknown[]) => ({
        select,
      }));

      db.selectFrom = selectFrom;

      const whereId = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        where: whereId,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const processingStartedAt = new Date('2026-08-18T12:00:00.000Z');

      const processingExpiresAt = new Date('2026-08-18T12:05:00.000Z');

      const result = await repository.claimBatch({
        cutoffDate: '2026-08-18',
        batchSize: 2,
        ownerToken: 'owner-token',
        processingRunId: 'run-id',
        processingStartedAt,
        processingExpiresAt,
      });

      expect(db.updateTable).toHaveBeenCalledWith('subscriptions');

      expect(set).toHaveBeenCalledWith({
        processing_run_id: 'run-id',
        processing_owner: 'owner-token',
        processing_started_at: processingStartedAt,
        processing_expires_at: processingExpiresAt,
      });

      expect(whereStatus).toHaveBeenCalledWith('status', '=', 'active');

      expect(whereBillingDate).toHaveBeenCalledWith(
        'next_billing_date',
        '<=',
        '2026-08-18',
      );

      expect(result).toEqual(claimedSubscriptions);
    });
  });

  describe('update', () => {
    it('should update subscription fields', async () => {
      const subscription = {
        id: 'subscription-id',
        description: 'Updated Plan',
        version: 2,
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const where = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const setVersion = jest.fn((..._args: unknown[]) => ({
        where,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        set: setVersion,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.update('subscription-id', {
        description: 'Updated Plan',
        amount: '59.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      });

      expect(db.updateTable).toHaveBeenCalledWith('subscriptions');

      expect(set).toHaveBeenCalledWith({
        description: 'Updated Plan',
        amount: '59.0000',
        currency: 'USD',
        start_date: '2026-08-16',
        next_billing_date: '2026-08-31',
        billing_anchor_day: 31,
        anchor_is_month_end: true,
      });

      expect(where).toHaveBeenCalledWith('id', '=', 'subscription-id');

      expect(result).toEqual(subscription);
    });
  });

  describe('pause', () => {
    it('should pause an active subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'paused',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const whereStatus = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const whereId = jest.fn((..._args: unknown[]) => ({
        where: whereStatus,
      }));

      const setVersion = jest.fn((..._args: unknown[]) => ({
        where: whereId,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        set: setVersion,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.pause('subscription-id');

      expect(set).toHaveBeenCalledWith({
        status: 'paused',
      });

      expect(whereId).toHaveBeenCalledWith('id', '=', 'subscription-id');

      expect(whereStatus).toHaveBeenCalledWith('status', '=', 'active');

      expect(result).toEqual(subscription);
    });
  });

  describe('resume', () => {
    it('should resume a paused subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'active',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const whereStatus = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const whereId = jest.fn((..._args: unknown[]) => ({
        where: whereStatus,
      }));

      const setVersion = jest.fn((..._args: unknown[]) => ({
        where: whereId,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        set: setVersion,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.resume('subscription-id');

      expect(set).toHaveBeenCalledWith({
        status: 'active',
      });

      expect(whereStatus).toHaveBeenCalledWith('status', '=', 'paused');

      expect(result).toEqual(subscription);
    });
  });

  describe('cancel', () => {
    it('should cancel an active or paused subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'canceled',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const whereStatus = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const whereId = jest.fn((..._args: unknown[]) => ({
        where: whereStatus,
      }));

      const setVersion = jest.fn((..._args: unknown[]) => ({
        where: whereId,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        set: setVersion,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.cancel('subscription-id');

      expect(set).toHaveBeenCalledWith({
        status: 'canceled',
      });

      expect(whereStatus).toHaveBeenCalledWith('status', 'in', [
        'active',
        'paused',
      ]);

      expect(result).toEqual(subscription);
    });
  });

  describe('resetBillingFailure', () => {
    it('should reset billing failure fields', async () => {
      const subscription = {
        id: 'subscription-id',
        billing_state: 'ready',
        billing_failure_count: 0,
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => subscription,
      );

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const where = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const setVersion = jest.fn((..._args: unknown[]) => ({
        where,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        set: setVersion,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.resetBillingFailure('subscription-id');

      expect(set).toHaveBeenCalledWith({
        billing_state: 'ready',
        billing_retry_at: null,
        billing_failure_count: 0,
        last_billing_error_code: null,
        last_billing_error_message: null,
      });

      expect(where).toHaveBeenCalledWith('id', '=', 'subscription-id');

      expect(result).toEqual(subscription);
    });
  });
  describe('markTransientFailure', () => {
    it('should move the subscription to retry_wait', async () => {
      const executeTakeFirst = jest.fn(async (..._args: unknown[]) => ({
        id: 'subscription-id',
        billing_state: 'retry_wait',
      }));

      const where = jest.fn((..._args: unknown[]) => ({
        returningAll: jest.fn((..._args: unknown[]) => ({
          executeTakeFirst,
        })),
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        set,
      }));

      const firstSet = jest.fn((..._args: unknown[]) => ({
        set: jest.fn((..._args: unknown[]) => ({
          set: jest.fn((..._args: unknown[]) => ({
            where,
          })),
        })),
      }));

      db.updateTable.mockReturnValue({
        set: firstSet,
      });

      const result = await repository.markTransientFailure({
        id: 'subscription-id',
        errorCode: 'PAYMENT_TIMEOUT',
        errorMessage: 'Payment provider timeout',
        retryAt: new Date('2026-08-18T12:05:00.000Z'),
      });

      expect(db.updateTable).toHaveBeenCalledWith('subscriptions');

      expect(result).toEqual({
        id: 'subscription-id',
        billing_state: 'retry_wait',
      });
    });
  });

  describe('markPermanentFailure', () => {
    it('should move the subscription to blocked', async () => {
      const executeTakeFirst = jest.fn(async (..._args: unknown[]) => ({
        id: 'subscription-id',
        billing_state: 'blocked',
      }));

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const where = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const set3 = jest.fn((..._args: unknown[]) => ({
        where,
      }));

      const set2 = jest.fn((..._args: unknown[]) => ({
        set: set3,
      }));

      const set1 = jest.fn((..._args: unknown[]) => ({
        set: set2,
      }));

      db.updateTable.mockReturnValue({
        set: set1,
      });

      const result = await repository.markPermanentFailure({
        id: 'subscription-id',
        errorCode: 'INVALID_CUSTOMER',
        errorMessage: 'Customer data is invalid',
      });

      expect(db.updateTable).toHaveBeenCalledWith('subscriptions');

      expect(result).toEqual({
        id: 'subscription-id',
        billing_state: 'blocked',
      });
    });
  });

  describe('recoverExpiredClaims', () => {
    it('should release expired processing claims', async () => {
      const subscriptions = [
        {
          id: 'subscription-id',
          processing_run_id: null,
          processing_owner: null,
        },
      ];

      const execute = jest.fn(async (..._args: unknown[]) => subscriptions);

      const returningAll = jest.fn((..._args: unknown[]) => ({
        execute,
      }));

      const where = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const set = jest.fn((..._args: unknown[]) => ({
        where,
      }));

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.recoverExpiredClaims(
        new Date('2026-08-18T12:00:00.000Z'),
      );

      expect(db.updateTable).toHaveBeenCalledWith('subscriptions');

      expect(where).toHaveBeenCalledWith(
        'processing_expires_at',
        '<=',
        new Date('2026-08-18T12:00:00.000Z'),
      );

      expect(result).toEqual(subscriptions);
    });
  });

  describe('unblock', () => {
    it('should move a blocked subscription back to ready', async () => {
      const executeTakeFirst = jest.fn(async (..._args: unknown[]) => ({
        id: 'subscription-id',
        billing_state: 'ready',
      }));

      const returningAll = jest.fn((..._args: unknown[]) => ({
        executeTakeFirst,
      }));

      const where2 = jest.fn((..._args: unknown[]) => ({
        returningAll,
      }));

      const where1 = jest.fn((..._args: unknown[]) => ({
        where: where2,
      }));

      const set2 = jest.fn((..._args: unknown[]) => ({
        where: where1,
      }));

      const set1 = jest.fn((..._args: unknown[]) => ({
        set: set2,
      }));

      db.updateTable.mockReturnValue({
        set: set1,
      });

      const result = await repository.unblock('subscription-id');

      expect(result).toEqual({
        id: 'subscription-id',
        billing_state: 'ready',
      });
    });
  });
});
