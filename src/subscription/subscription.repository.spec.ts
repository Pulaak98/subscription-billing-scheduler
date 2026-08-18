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
      };

      const executeTakeFirstOrThrow = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirstOrThrow,
        }),
      );

      const values = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

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

      expect(db.insertInto).toHaveBeenCalledWith(
        'subscriptions',
      );

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

      expect(returningAll).toHaveBeenCalled();
      expect(
        executeTakeFirstOrThrow,
      ).toHaveBeenCalled();

      expect(result).toEqual(subscription);
    });
  });

  describe('findById', () => {
    it('should find a subscription by id', async () => {
      const subscription = {
        id: 'subscription-id',
        customer_reference: 'CUST-1001',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findById(
        'subscription-id',
      );

      expect(db.selectFrom).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(selectAll).toHaveBeenCalled();

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

      expect(executeTakeFirst).toHaveBeenCalled();

      expect(result).toEqual(subscription);
    });

    it('should return undefined when subscription does not exist', async () => {
      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          undefined,
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findById(
        'missing-subscription-id',
      );

      expect(result).toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('should return subscriptions with default pagination', async () => {
      const subscriptions = [
        { id: 'subscription-2' },
        { id: 'subscription-1' },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]): Promise<unknown[]> =>
          subscriptions,
      );

      const offset = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const limit = jest.fn(
        (..._args: unknown[]) => ({
          offset,
        }),
      );

      const orderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          orderBy,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany();

      expect(db.selectFrom).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(orderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

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

      const execute = jest.fn(
        async (..._args: unknown[]): Promise<unknown[]> =>
          subscriptions,
      );

      const offset = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const limit = jest.fn(
        (..._args: unknown[]) => ({
          offset,
        }),
      );

      const orderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const secondWhere = jest.fn(
        (..._args: unknown[]) => ({
          orderBy,
        }),
      );

      const firstWhere = jest.fn(
        (..._args: unknown[]) => ({
          where: secondWhere,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          where: firstWhere,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany(
        'CUST-1001',
        'active',
        10,
        20,
      );

      expect(firstWhere).toHaveBeenCalledWith(
        'customer_reference',
        '=',
        'CUST-1001',
      );

      expect(secondWhere).toHaveBeenCalledWith(
        'status',
        '=',
        'active',
      );

      expect(orderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

      expect(limit).toHaveBeenCalledWith(10);
      expect(offset).toHaveBeenCalledWith(20);

      expect(result).toEqual(subscriptions);
    });

    it('should apply only the customer filter', async () => {
      const subscriptions = [
        {
          id: 'subscription-1',
          customer_reference: 'CUST-1001',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]): Promise<unknown[]> =>
          subscriptions,
      );

      const offset = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const limit = jest.fn(
        (..._args: unknown[]) => ({
          offset,
        }),
      );

      const orderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          orderBy,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany(
        'CUST-1001',
      );

      expect(where).toHaveBeenCalledWith(
        'customer_reference',
        '=',
        'CUST-1001',
      );

      expect(orderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

      expect(limit).toHaveBeenCalledWith(20);
      expect(offset).toHaveBeenCalledWith(0);

      expect(result).toEqual(subscriptions);
    });

    it('should apply only the status filter', async () => {
      const subscriptions = [
        {
          id: 'subscription-1',
          status: 'paused',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]): Promise<unknown[]> =>
          subscriptions,
      );

      const offset = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const limit = jest.fn(
        (..._args: unknown[]) => ({
          offset,
        }),
      );

      const orderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          orderBy,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany(
        undefined,
        'paused',
        5,
        10,
      );

      expect(where).toHaveBeenCalledWith(
        'status',
        '=',
        'paused',
      );

      expect(orderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

      expect(limit).toHaveBeenCalledWith(5);
      expect(offset).toHaveBeenCalledWith(10);

      expect(result).toEqual(subscriptions);
    });
  });

  describe('update', () => {
    it('should update all supplied subscription fields', async () => {
      const subscription = {
        id: 'subscription-id',
        description: 'Updated Plan',
        amount: '59.0000',
        currency: 'USD',
        start_date: '2026-08-16',
        next_billing_date: '2026-08-31',
        billing_anchor_day: 31,
        anchor_is_month_end: true,
        version: 2,
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.update(
        'subscription-id',
        {
          description: 'Updated Plan',
          amount: '59.0000',
          currency: 'USD',
          startDate: '2026-08-16',
          nextBillingDate: '2026-08-31',
          billingAnchorDay: 31,
          anchorIsMonthEnd: true,
        },
      );

      expect(db.updateTable).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(set).toHaveBeenCalledWith({
        description: 'Updated Plan',
        amount: '59.0000',
        currency: 'USD',
        start_date: '2026-08-16',
        next_billing_date: '2026-08-31',
        billing_anchor_day: 31,
        anchor_is_month_end: true,
      });

      expect(setVersion).toHaveBeenCalled();

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

      expect(returningAll).toHaveBeenCalled();
      expect(result).toEqual(subscription);
    });

    it('should update only the supplied fields', async () => {
      const subscription = {
        id: 'subscription-id',
        description: 'Updated Plan',
        version: 2,
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.update(
        'subscription-id',
        {
          description: 'Updated Plan',
        },
      );

      expect(set).toHaveBeenCalledWith({
        description: 'Updated Plan',
      });

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

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
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const whereStatus = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const whereId = jest.fn(
        (..._args: unknown[]) => ({
          where: whereStatus,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where: whereId,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.pause(
        'subscription-id',
      );

      expect(db.updateTable).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(set).toHaveBeenCalledWith({
        status: 'paused',
      });

      expect(whereId).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

      expect(whereStatus).toHaveBeenCalledWith(
        'status',
        '=',
        'active',
      );

      expect(result).toEqual(subscription);
    });

    it('should return undefined when the subscription cannot be paused', async () => {
      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          undefined,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const whereStatus = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const whereId = jest.fn(
        (..._args: unknown[]) => ({
          where: whereStatus,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where: whereId,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.pause(
        'subscription-id',
      );

      expect(result).toBeUndefined();
    });
  });

  describe('resume', () => {
    it('should resume a paused subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'active',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const whereStatus = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const whereId = jest.fn(
        (..._args: unknown[]) => ({
          where: whereStatus,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where: whereId,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.resume(
        'subscription-id',
      );

      expect(db.updateTable).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(set).toHaveBeenCalledWith({
        status: 'active',
      });

      expect(whereId).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

      expect(whereStatus).toHaveBeenCalledWith(
        'status',
        '=',
        'paused',
      );

      expect(result).toEqual(subscription);
    });

    it('should return undefined when the subscription cannot be resumed', async () => {
      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          undefined,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const whereStatus = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const whereId = jest.fn(
        (..._args: unknown[]) => ({
          where: whereStatus,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where: whereId,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.resume(
        'subscription-id',
      );

      expect(result).toBeUndefined();
    });
  });

  describe('cancel', () => {
    it('should cancel an active or paused subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'canceled',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const whereStatus = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const whereId = jest.fn(
        (..._args: unknown[]) => ({
          where: whereStatus,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where: whereId,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.cancel(
        'subscription-id',
      );

      expect(db.updateTable).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(set).toHaveBeenCalledWith({
        status: 'canceled',
      });

      expect(whereId).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

      expect(whereStatus).toHaveBeenCalledWith(
        'status',
        'in',
        ['active', 'paused'],
      );

      expect(result).toEqual(subscription);
    });

    it('should return undefined when the subscription cannot be canceled', async () => {
      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          undefined,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const whereStatus = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const whereId = jest.fn(
        (..._args: unknown[]) => ({
          where: whereStatus,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where: whereId,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result = await repository.cancel(
        'subscription-id',
      );

      expect(result).toBeUndefined();
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
        async (..._args: unknown[]): Promise<unknown> =>
          subscription,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result =
        await repository.resetBillingFailure(
          'subscription-id',
        );

      expect(db.updateTable).toHaveBeenCalledWith(
        'subscriptions',
      );

      expect(set).toHaveBeenCalledWith({
        billing_state: 'ready',
        billing_retry_at: null,
        billing_failure_count: 0,
        last_billing_error_code: null,
        last_billing_error_message: null,
      });

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'subscription-id',
      );

      expect(returningAll).toHaveBeenCalled();
      expect(result).toEqual(subscription);
    });

    it('should return undefined when the subscription does not exist', async () => {
      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]): Promise<unknown> =>
          undefined,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const setVersion = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          set: setVersion,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result =
        await repository.resetBillingFailure(
          'missing-subscription-id',
        );

      expect(result).toBeUndefined();
    });
  });
});