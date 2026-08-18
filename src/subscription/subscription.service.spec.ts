import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';


import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import { MonthlyBillingRecurrenceCalculator } from './recurrence/monthly-billing-recurrence.calculator';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: jest.Mocked<SubscriptionRepository>;
  let recurrenceCalculator: MonthlyBillingRecurrenceCalculator;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      cancel: jest.fn(),
      resetBillingFailure: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    recurrenceCalculator =
      {} as MonthlyBillingRecurrenceCalculator;

    service = new SubscriptionService(
      repository,
      recurrenceCalculator,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription when billing dates are valid', async () => {
      const dto = {
        customerReference: 'CUST-1001',
        description: 'Pro Plan - Monthly',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      };

      const createdSubscription = {
        id: 'subscription-id',
        ...dto,
        status: 'active',
        billing_state: 'ready',
      };

      repository.create.mockResolvedValue(
        createdSubscription as never,
      );

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        customerReference: 'CUST-1001',
        description: 'Pro Plan - Monthly',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      });

      expect(result).toEqual(createdSubscription);
    });

    it('should reject a next billing date before the start date', async () => {
      const dto = {
        customerReference: 'CUST-1001',
        description: 'Pro Plan - Monthly',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-31',
        nextBillingDate: '2026-08-16',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      };

      await expect(
        service.create(dto),
      ).rejects.toThrow(BadRequestException);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return the subscription when it exists', async () => {
      const subscription = {
        id: 'subscription-id',
        customer_reference: 'CUST-1001',
      };

      repository.findById.mockResolvedValue(
        subscription as never,
      );

      const result =
        await service.findById('subscription-id');

      expect(repository.findById).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(subscription);
    });

    it('should throw NotFoundException when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.findById('subscription-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMany', () => {
    it('should calculate the offset and return subscriptions', async () => {
      const subscriptions = [
        {
          id: 'subscription-2',
        },
        {
          id: 'subscription-1',
        },
      ];

      repository.findMany.mockResolvedValue(
        subscriptions as never,
      );

      const result = await service.findMany({
        page: 3,
        limit: 10,
      });

      expect(repository.findMany).toHaveBeenCalledWith(
        undefined,
        undefined,
        10,
        20,
      );

      expect(result).toEqual(subscriptions);
    });

    it('should pass customer and status filters', async () => {
      repository.findMany.mockResolvedValue(
        [] as never,
      );

      await service.findMany({
        customerReference: 'CUST-1001',
        status: 'active',
        page: 1,
        limit: 20,
      });

      expect(repository.findMany).toHaveBeenCalledWith(
        'CUST-1001',
        'active',
        20,
        0,
      );
    });
  });

  describe('update', () => {
    const existingSubscription = {
      id: 'subscription-id',
      status: 'active',
      start_date: '2026-08-16',
      next_billing_date: '2026-08-31',
    };

    it('should update editable subscription fields', async () => {
      const updatedSubscription = {
        ...existingSubscription,
        description: 'Updated Plan',
      };

      repository.findById.mockResolvedValue(
        existingSubscription as never,
      );

      repository.update.mockResolvedValue(
        updatedSubscription as never,
      );

      const result = await service.update(
        'subscription-id',
        {
          description: 'Updated Plan',
        },
      );

      expect(repository.update).toHaveBeenCalledWith(
        'subscription-id',
        {
          description: 'Updated Plan',
          amount: undefined,
          currency: undefined,
          startDate: undefined,
          nextBillingDate: undefined,
          billingAnchorDay: undefined,
          anchorIsMonthEnd: undefined,
        },
      );

      expect(result).toEqual(updatedSubscription);
    });

    it('should reject editing a canceled subscription', async () => {
      repository.findById.mockResolvedValue({
        ...existingSubscription,
        status: 'canceled',
      } as never);

      await expect(
        service.update('subscription-id', {
          description: 'Updated Plan',
        }),
      ).rejects.toThrow(ConflictException);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should reject a next billing date before the start date', async () => {
      repository.findById.mockResolvedValue(
        existingSubscription as never,
      );

      await expect(
        service.update('subscription-id', {
          nextBillingDate: '2026-08-01',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should reject an update with no editable fields', async () => {
      repository.findById.mockResolvedValue(
        existingSubscription as never,
      );

      await expect(
        service.update('subscription-id', {}),
      ).rejects.toThrow(BadRequestException);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow a valid start date and next billing date update', async () => {
      repository.findById.mockResolvedValue(
        existingSubscription as never,
      );

      const updatedSubscription = {
        ...existingSubscription,
        start_date: '2026-08-20',
        next_billing_date: '2026-09-01',
      };

      repository.update.mockResolvedValue(
        updatedSubscription as never,
      );

      const result = await service.update(
        'subscription-id',
        {
          startDate: '2026-08-20',
          nextBillingDate: '2026-09-01',
        },
      );

      expect(repository.update).toHaveBeenCalledWith(
        'subscription-id',
        {
          description: undefined,
          amount: undefined,
          currency: undefined,
          startDate: '2026-08-20',
          nextBillingDate: '2026-09-01',
          billingAnchorDay: undefined,
          anchorIsMonthEnd: undefined,
        },
      );

      expect(result).toEqual(updatedSubscription);
    });
  });

  describe('pause', () => {
    it('should pause an active subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'active',
      };

      const updatedSubscription = {
        ...subscription,
        status: 'paused',
      };

      repository.findById.mockResolvedValue(
        subscription as never,
      );

      repository.pause.mockResolvedValue(
        updatedSubscription as never,
      );

      const result =
        await service.pause('subscription-id');

      expect(repository.pause).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(updatedSubscription);
    });

    it('should throw when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject pausing a canceled subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'canceled',
      } as never);

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject pausing an already paused subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'paused',
      } as never);

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject when repository cannot pause the subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'active',
      } as never);

      repository.pause.mockResolvedValue(
        undefined as never,
      );

      await expect(
        service.pause('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('resume', () => {
    it('should resume a paused subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'paused',
      };

      const updatedSubscription = {
        ...subscription,
        status: 'active',
      };

      repository.findById.mockResolvedValue(
        subscription as never,
      );

      repository.resume.mockResolvedValue(
        updatedSubscription as never,
      );

      const result =
        await service.resume('subscription-id');

      expect(repository.resume).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(updatedSubscription);
    });

    it('should throw when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject resuming a canceled subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'canceled',
      } as never);

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject resuming an already active subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'active',
      } as never);

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject when repository cannot resume the subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'paused',
      } as never);

      repository.resume.mockResolvedValue(
        undefined as never,
      );

      await expect(
        service.resume('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    it('should cancel an active subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'active',
      };

      const canceledSubscription = {
        ...subscription,
        status: 'canceled',
      };

      repository.findById.mockResolvedValue(
        subscription as never,
      );

      repository.cancel.mockResolvedValue(
        canceledSubscription as never,
      );

      const result =
        await service.cancel('subscription-id');

      expect(repository.cancel).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(canceledSubscription);
    });

    it('should cancel a paused subscription', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'paused',
      };

      const canceledSubscription = {
        ...subscription,
        status: 'canceled',
      };

      repository.findById.mockResolvedValue(
        subscription as never,
      );

      repository.cancel.mockResolvedValue(
        canceledSubscription as never,
      );

      const result =
        await service.cancel('subscription-id');

      expect(repository.cancel).toHaveBeenCalledWith(
        'subscription-id',
      );

      expect(result).toEqual(canceledSubscription);
    });

    it('should throw when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.cancel('subscription-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject canceling an already canceled subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'canceled',
      } as never);

      await expect(
        service.cancel('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject when repository cannot cancel the subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'active',
      } as never);

      repository.cancel.mockResolvedValue(
        undefined as never,
      );

      await expect(
        service.cancel('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('billingRetry', () => {
    it('should reset billing failure state', async () => {
      const subscription = {
        id: 'subscription-id',
        status: 'active',
      };

      const updatedSubscription = {
        ...subscription,
        billing_state: 'ready',
        billing_failure_count: 0,
        billing_retry_at: null,
      };

      repository.findById.mockResolvedValue(
        subscription as never,
      );

      repository.resetBillingFailure.mockResolvedValue(
        updatedSubscription as never,
      );

      const result =
        await service.billingRetry('subscription-id');

      expect(
        repository.resetBillingFailure,
      ).toHaveBeenCalledWith('subscription-id');

      expect(result).toEqual(updatedSubscription);
    });

    it('should throw when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.billingRetry('subscription-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject billing retry for a canceled subscription', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'canceled',
      } as never);

      await expect(
        service.billingRetry('subscription-id'),
      ).rejects.toThrow(ConflictException);

      expect(
        repository.resetBillingFailure,
      ).not.toHaveBeenCalled();
    });

    it('should reject when billing failure reset cannot be applied', async () => {
      repository.findById.mockResolvedValue({
        id: 'subscription-id',
        status: 'active',
      } as never);

      repository.resetBillingFailure.mockResolvedValue(
        undefined as never,
      );

      await expect(
        service.billingRetry('subscription-id'),
      ).rejects.toThrow(ConflictException);
    });
  });
});