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
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  const service = {
    create: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    findMany: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    findById: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    update: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    pause: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    resume: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    cancel: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),

    billingRetry: jest.fn(
      async (..._args: unknown[]): Promise<unknown> =>
        undefined,
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new SubscriptionController(
      service as unknown as SubscriptionService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to the service', async () => {
    const dto = {
      customerReference: 'CUST-1001',
    } as CreateSubscriptionDto;

    const result = {
      id: 'subscription-id',
    };

    service.create.mockResolvedValue(result);

    await expect(
      controller.create(dto),
    ).resolves.toEqual(result);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should delegate findMany to the service', async () => {
    const query = {
      page: 1,
      limit: 20,
    } as ListSubscriptionsDto;

    const result: unknown[] = [];

    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany(query),
    ).resolves.toEqual(result);

    expect(service.findMany).toHaveBeenCalledWith(
      query,
    );
  });

  it('should delegate findById to the service', async () => {
    const result = {
      id: 'subscription-id',
    };

    service.findById.mockResolvedValue(result);

    await expect(
      controller.findById('subscription-id'),
    ).resolves.toEqual(result);

    expect(service.findById).toHaveBeenCalledWith(
      'subscription-id',
    );
  });

  it('should delegate update to the service', async () => {
    const dto = {
      description: 'Updated Plan',
    } as UpdateSubscriptionDto;

    const result = {
      id: 'subscription-id',
    };

    service.update.mockResolvedValue(result);

    await expect(
      controller.update(
        'subscription-id',
        dto,
      ),
    ).resolves.toEqual(result);

    expect(service.update).toHaveBeenCalledWith(
      'subscription-id',
      dto,
    );
  });

  it('should delegate pause to the service', async () => {
    const result = {
      id: 'subscription-id',
      status: 'paused',
    };

    service.pause.mockResolvedValue(result);

    await expect(
      controller.pause('subscription-id'),
    ).resolves.toEqual(result);

    expect(service.pause).toHaveBeenCalledWith(
      'subscription-id',
    );
  });

  it('should delegate resume to the service', async () => {
    const result = {
      id: 'subscription-id',
      status: 'active',
    };

    service.resume.mockResolvedValue(result);

    await expect(
      controller.resume('subscription-id'),
    ).resolves.toEqual(result);

    expect(service.resume).toHaveBeenCalledWith(
      'subscription-id',
    );
  });

  it('should delegate cancel to the service', async () => {
    const result = {
      id: 'subscription-id',
      status: 'canceled',
    };

    service.cancel.mockResolvedValue(result);

    await expect(
      controller.cancel('subscription-id'),
    ).resolves.toEqual(result);

    expect(service.cancel).toHaveBeenCalledWith(
      'subscription-id',
    );
  });

  it('should delegate billing retry to the service', async () => {
    const result = {
      id: 'subscription-id',
      billing_state: 'ready',
    };

    service.billingRetry.mockResolvedValue(result);

    await expect(
      controller.billingRetry(
        'subscription-id',
      ),
    ).resolves.toEqual(result);

    expect(
      service.billingRetry,
    ).toHaveBeenCalledWith(
      'subscription-id',
    );
  });
});