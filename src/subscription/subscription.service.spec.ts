import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionData,
  SubscriptionStatus,
  UpdateSubscriptionData,
} from './subscription.types';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const repository = {
    create: jest.fn(
      async (_data: CreateSubscriptionData): Promise<unknown> =>
        undefined,
    ),

    findById: jest.fn(
      async (_id: string): Promise<unknown> =>
        undefined,
    ),

    findMany: jest.fn(
      async (
        _customerReference?: string,
        _status?: SubscriptionStatus,
        _limit?: number,
        _offset?: number,
      ): Promise<unknown[]> => [],
    ),

    update: jest.fn(
      async (
        _id: string,
        _data: UpdateSubscriptionData,
      ): Promise<unknown> => undefined,
    ),

    pause: jest.fn(
      async (_id: string): Promise<unknown> =>
        undefined,
    ),

    resume: jest.fn(
      async (_id: string): Promise<unknown> =>
        undefined,
    ),

    cancel: jest.fn(
      async (_id: string): Promise<unknown> =>
        undefined,
    ),

    resetBillingFailure: jest.fn(
      async (_id: string): Promise<unknown> =>
        undefined,
    ),
  };

  const activeSubscription = {
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

  const pausedSubscription = {
    ...activeSubscription,
    status: 'paused' as const,
  };

  const canceledSubscription = {
    ...activeSubscription,
    status: 'canceled' as const,
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

      repository.create.mockResolvedValue(
        activeSubscription,
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

      expect(result).toEqual(activeSubscription);
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
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      const result = await service.findById(
        'subscription-id',
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(activeSubscription);
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

  describe('update', () => {
    const updateDto: UpdateSubscriptionDto = {
      description: 'Updated Plan',
      amount: '59.0000',
      currency: 'USD',
    };

    it('should update an existing subscription', async () => {
      const updatedSubscription = {
        ...activeSubscription,
        description: 'Updated Plan',
        amount: '59.0000',
        version: 2,
      };

      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      repository.update.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.update(
        'subscription-id',
        updateDto,
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(
        repository.update,
      ).toHaveBeenCalledWith(
        'subscription-id',
        {
          description: 'Updated Plan',
          amount: '59.0000',
          currency: 'USD',
          startDate: undefined,
          nextBillingDate: undefined,
          billingAnchorDay: undefined,
          anchorIsMonthEnd: undefined,
        },
      );

      expect(result).toEqual(updatedSubscription);
    });

    it('should reject updating a missing subscription', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.update(
          'missing-id',
          updateDto,
        ),
      ).rejects.toThrow(
        'Subscription not found',
      );

      expect(
        repository.update,
      ).not.toHaveBeenCalled();
    });

    it('should reject updating a canceled subscription', async () => {
      repository.findById.mockResolvedValue(
        canceledSubscription,
      );

      await expect(
        service.update(
          'subscription-id',
          updateDto,
        ),
      ).rejects.toThrow(
        'Canceled subscriptions cannot be edited',
      );

      expect(
        repository.update,
      ).not.toHaveBeenCalled();
    });

    it('should reject when nextBillingDate is before the existing startDate', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      const dto: UpdateSubscriptionDto = {
        nextBillingDate: '2026-08-10',
      };

      await expect(
        service.update(
          'subscription-id',
          dto,
        ),
      ).rejects.toThrow(
        'nextBillingDate cannot be before startDate',
      );

      expect(
        repository.update,
      ).not.toHaveBeenCalled();
    });

    it('should reject when startDate is after the existing nextBillingDate', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      const dto: UpdateSubscriptionDto = {
        startDate: '2026-09-01',
      };

      await expect(
        service.update(
          'subscription-id',
          dto,
        ),
      ).rejects.toThrow(
        'nextBillingDate cannot be before startDate',
      );

      expect(
        repository.update,
      ).not.toHaveBeenCalled();
    });

    it('should reject when no editable field is supplied', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      await expect(
        service.update(
          'subscription-id',
          {},
        ),
      ).rejects.toThrow(
        'At least one editable field is required',
      );

      expect(
        repository.update,
      ).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should pause an active subscription', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      const updatedSubscription = {
        ...activeSubscription,
        status: 'paused' as const,
        version: 2,
      };

      repository.pause.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.pause(
        'subscription-id',
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(
        repository.pause,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(
        updatedSubscription,
      );
    });

    it('should reject when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.pause('missing-id'),
      ).rejects.toThrow(
        'Subscription not found',
      );

      expect(
        repository.pause,
      ).not.toHaveBeenCalled();
    });

    it('should reject pausing a canceled subscription', async () => {
      repository.findById.mockResolvedValue(
        canceledSubscription,
      );

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(
        'Canceled subscriptions cannot be paused',
      );

      expect(
        repository.pause,
      ).not.toHaveBeenCalled();
    });

    it('should reject an already paused subscription', async () => {
      repository.findById.mockResolvedValue(
        pausedSubscription,
      );

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(
        'Subscription is already paused',
      );

      expect(
        repository.pause,
      ).not.toHaveBeenCalled();
    });

    it('should reject when repository cannot pause the subscription', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      repository.pause.mockResolvedValue(
        undefined,
      );

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(
        'Subscription could not be paused',
      );
    });
  });

  describe('resume', () => {
    it('should resume a paused subscription', async () => {
      repository.findById.mockResolvedValue(
        pausedSubscription,
      );

      const updatedSubscription = {
        ...activeSubscription,
        version: 2,
      };

      repository.resume.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.resume(
        'subscription-id',
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(
        repository.resume,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(
        updatedSubscription,
      );
    });

    it('should reject when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.resume('missing-id'),
      ).rejects.toThrow(
        'Subscription not found',
      );

      expect(
        repository.resume,
      ).not.toHaveBeenCalled();
    });

    it('should reject resuming a canceled subscription', async () => {
      repository.findById.mockResolvedValue(
        canceledSubscription,
      );

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(
        'Canceled subscriptions cannot be resumed',
      );

      expect(
        repository.resume,
      ).not.toHaveBeenCalled();
    });

    it('should reject an already active subscription', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(
        'Subscription is already active',
      );

      expect(
        repository.resume,
      ).not.toHaveBeenCalled();
    });

    it('should reject when repository cannot resume the subscription', async () => {
      repository.findById.mockResolvedValue(
        pausedSubscription,
      );

      repository.resume.mockResolvedValue(
        undefined,
      );

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(
        'Subscription could not be resumed',
      );
    });
  });

  describe('cancel', () => {
    it('should cancel an active subscription', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      const updatedSubscription = {
        ...canceledSubscription,
        version: 2,
      };

      repository.cancel.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.cancel(
        'subscription-id',
      );

      expect(
        repository.cancel,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(
        updatedSubscription,
      );
    });

    it('should cancel a paused subscription', async () => {
      repository.findById.mockResolvedValue(
        pausedSubscription,
      );

      const updatedSubscription = {
        ...canceledSubscription,
        version: 2,
      };

      repository.cancel.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.cancel(
        'subscription-id',
      );

      expect(
        repository.cancel,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(
        updatedSubscription,
      );
    });

    it('should reject when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.cancel('missing-id'),
      ).rejects.toThrow(
        'Subscription not found',
      );

      expect(
        repository.cancel,
      ).not.toHaveBeenCalled();
    });

    it('should reject canceling an already canceled subscription', async () => {
      repository.findById.mockResolvedValue(
        canceledSubscription,
      );

      await expect(
        service.cancel('subscription-id'),
      ).rejects.toThrow(
        'Subscription is already canceled',
      );

      expect(
        repository.cancel,
      ).not.toHaveBeenCalled();
    });

    it('should reject when repository cannot cancel the subscription', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      repository.cancel.mockResolvedValue(
        undefined,
      );

      await expect(
        service.cancel('subscription-id'),
      ).rejects.toThrow(
        'Subscription could not be canceled',
      );
    });
  });

  describe('billingRetry', () => {
    it('should reset billing failure state', async () => {
      const failedSubscription = {
        ...activeSubscription,
        billing_state: 'retry_wait' as const,
        billing_failure_count: 3,
      };

      const updatedSubscription = {
        ...activeSubscription,
        billing_state: 'ready' as const,
        billing_failure_count: 0,
        version: 2,
      };

      repository.findById.mockResolvedValue(
        failedSubscription,
      );

      repository.resetBillingFailure.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.billingRetry(
        'subscription-id',
      );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(
        repository.resetBillingFailure,
      ).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(
        updatedSubscription,
      );
    });

    it('should reject when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.billingRetry('missing-id'),
      ).rejects.toThrow(
        'Subscription not found',
      );

      expect(
        repository.resetBillingFailure,
      ).not.toHaveBeenCalled();
    });

    it('should reject retrying a canceled subscription', async () => {
      repository.findById.mockResolvedValue(
        canceledSubscription,
      );

      await expect(
        service.billingRetry('subscription-id'),
      ).rejects.toThrow(
        'Canceled subscriptions cannot be retried',
      );

      expect(
        repository.resetBillingFailure,
      ).not.toHaveBeenCalled();
    });

    it('should reject when repository cannot apply the retry', async () => {
      repository.findById.mockResolvedValue(
        activeSubscription,
      );

      repository.resetBillingFailure.mockResolvedValue(
        undefined,
      );

      await expect(
        service.billingRetry('subscription-id'),
      ).rejects.toThrow(
        'Billing retry could not be applied',
      );
    });
  });
});