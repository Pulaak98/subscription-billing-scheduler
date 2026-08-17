import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';


describe('SubscriptionService', () => {
  let service: SubscriptionService;

  let repository: {
    create: jest.MockedFunction<SubscriptionRepository['create']>;
    findById: jest.MockedFunction<SubscriptionRepository['findById']>;
    findMany: jest.MockedFunction<SubscriptionRepository['findMany']>;
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
    };

    service = new SubscriptionService(
      repository as unknown as SubscriptionRepository,
    );
  });

  describe('create', () => {
    it('should create a subscription', async () => {
      const dto: CreateSubscriptionDto = {
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
        id: 'subscription-1',
        customer_reference: 'CUST-1001',
        description: 'Pro Plan - Monthly',
      };

      repository.create.mockResolvedValue(
        createdSubscription as Awaited<
          ReturnType<SubscriptionRepository['create']>
        >,
      );

      const result = await service.create(dto);

      expect(result).toEqual(createdSubscription);

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
    });

    it('should reject when next billing date is before start date', async () => {
      const dto: CreateSubscriptionDto = {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-20',
        nextBillingDate: '2026-08-19',
        billingAnchorDay: 20,
        anchorIsMonthEnd: false,
      };

      await expect(
        service.create(dto),
      ).rejects.toThrow(BadRequestException);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a subscription when it exists', async () => {
      const subscription = {
        id: 'subscription-1',
        customer_reference: 'CUST-1001',
      };

      repository.findById.mockResolvedValue(
        subscription as Awaited<
          ReturnType<SubscriptionRepository['findById']>
        >,
      );

      const result =
        await service.findById('subscription-1');

      expect(result).toEqual(subscription);

      expect(repository.findById).toHaveBeenCalledWith(
        'subscription-1',
      );
    });

    it('should throw NotFoundException when subscription does not exist', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.findById('missing-id'),
      ).rejects.toThrow(NotFoundException);

      expect(repository.findById).toHaveBeenCalledWith(
        'missing-id',
      );
    });
  });

  describe('findMany', () => {
    it('should return subscriptions with pagination', async () => {
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
        subscriptions as Awaited<
          ReturnType<SubscriptionRepository['findMany']>
        >,
      );

      const dto: ListSubscriptionsDto = {
        page: 2,
        limit: 10,
      };

      const result =
        await service.findMany(dto);

      expect(result).toEqual(subscriptions);

      expect(repository.findMany).toHaveBeenCalledWith(
        undefined,
        undefined,
        10,
        10,
      );
    });

    it('should pass filters to the repository', async () => {
      const subscriptions = [
        {
          id: 'subscription-1',
          customer_reference: 'CUST-1001',
        },
      ];

      repository.findMany.mockResolvedValue(
        subscriptions as Awaited<
          ReturnType<SubscriptionRepository['findMany']>
        >,
      );

      const dto: ListSubscriptionsDto = {
        customerReference: 'CUST-1001',
        status: 'active',
        page: 1,
        limit: 20,
      };

      const result =
        await service.findMany(dto);

      expect(result).toEqual(subscriptions);

      expect(repository.findMany).toHaveBeenCalledWith(
        'CUST-1001',
        'active',
        20,
        0,
      );
    });
  });
});