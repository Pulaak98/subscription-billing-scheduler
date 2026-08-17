import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionData,
  SubscriptionStatus,
} from './subscription.types';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const repository = {
    create: jest.fn(
      async (_data: CreateSubscriptionData): Promise<unknown> => {
        return undefined;
      },
    ),

    findById: jest.fn(
      async (_id: string): Promise<unknown> => {
        return undefined;
      },
    ),

    findMany: jest.fn(
      async (
        _customerReference?: string,
        _status?: SubscriptionStatus,
        _limit?: number,
        _offset?: number,
      ): Promise<unknown> => {
        return [];
      },
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new SubscriptionService(
      repository as unknown as SubscriptionRepository,
    );
  });

  describe('create', () => {
    it('should create a subscription', async () => {
      const dto: CreateSubscriptionDto = {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      };

      const createdSubscription = {
        id: 'subscription-id',
        customer_reference: 'CUST-1001',
        description: 'Pro Plan',
        status: 'active' as const,
        billing_state: 'ready' as const,
        currency: 'USD',
        amount: '49.0000',
        start_date: '2026-08-16',
        next_billing_date: '2026-08-31',
        billing_anchor_day: 31,
        anchor_is_month_end: true,
        billing_failure_count: 0,
        billing_retry_at: null,
        last_billing_error_code: null,
        last_billing_error_message: null,
        processing_run_id: null,
        processing_owner: null,
        processing_started_at: null,
        processing_expires_at: null,
        version: 1,
      };

      repository.create.mockResolvedValue(
        createdSubscription,
      );

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      });

      expect(result).toEqual(createdSubscription);
    });

    it('should reject when nextBillingDate is before startDate', async () => {
      const dto: CreateSubscriptionDto = {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-31',
        nextBillingDate: '2026-08-16',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      };

      await expect(
        service.create(dto),
      ).rejects.toThrow(
        'nextBillingDate cannot be before startDate',
      );

      expect(
        repository.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a subscription when it exists', async () => {
      const subscription = {
        id: 'subscription-id',
        customer_reference: 'CUST-1001',
        description: 'Pro Plan',
        status: 'active' as const,
        billing_state: 'ready' as const,
        currency: 'USD',
        amount: '49.0000',
        start_date: '2026-08-16',
        next_billing_date: '2026-08-31',
        billing_anchor_day: 31,
        anchor_is_month_end: true,
        billing_failure_count: 0,
        billing_retry_at: null,
        last_billing_error_code: null,
        last_billing_error_message: null,
        processing_run_id: null,
        processing_owner: null,
        processing_started_at: null,
        processing_expires_at: null,
        version: 1,
      };

      repository.findById.mockResolvedValue(
        subscription,
      );

      const result = await service.findById(
        'subscription-id',
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(subscription);
    });

    it('should throw when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.findById('missing-id'),
      ).rejects.toThrow(
        'Subscription not found',
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'missing-id',
      );
    });
  });

  describe('findMany', () => {
    it('should return subscriptions using pagination and filters', async () => {
      const subscriptions = [
        {
          id: 'subscription-1',
          customer_reference: 'CUST-1001',
        },
        {
          id: 'subscription-2',
          customer_reference: 'CUST-1002',
        },
      ];

      repository.findMany.mockResolvedValue(
        subscriptions,
      );

      const dto: ListSubscriptionsDto = {
        page: 2,
        limit: 10,
        customerReference: 'CUST-1001',
        status: 'active',
      };

      const result = await service.findMany(dto);

      expect(
        repository.findMany,
      ).toHaveBeenCalledWith(
        'CUST-1001',
        'active',
        10,
        10,
      );

      expect(result).toEqual(subscriptions);
    });

    it('should calculate offset correctly without filters', async () => {
      repository.findMany.mockResolvedValue([]);

      const dto: ListSubscriptionsDto = {
        page: 3,
        limit: 20,
      };

      const result = await service.findMany(dto);

      expect(
        repository.findMany,
      ).toHaveBeenCalledWith(
        undefined,
        undefined,
        20,
        40,
      );

      expect(result).toEqual([]);
    });
  });
});