import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SchedulerRepository } from './scheduler.repository';
import { SchedulerService } from './scheduler.service';
import { SubscriptionRepository } from '../subscription/subscription.repository';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let repository: SchedulerRepository;
  let subscriptionRepository: SubscriptionRepository;

  beforeEach(() => {
    repository = {
      createRun: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      findRunItems: jest.fn(),
      completeRun: jest.fn(),
    } as unknown as SchedulerRepository;

    subscriptionRepository = {
      claimBatch: jest.fn(),
    } as unknown as SubscriptionRepository;

    service = new SchedulerService(
      repository,
      subscriptionRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRun', () => {
    it('should create a scheduler run', async () => {
      const run = {
        id: 'run-id',
        status: 'running',
      };

      jest
        .spyOn(repository, 'createRun')
        .mockResolvedValue(run as never);

      const data = {
        jobName: 'billing-scheduler',
        triggerType: 'scheduled' as const,
        triggeredAt: new Date(
          '2026-08-18T12:00:00.000Z',
        ),
        cutoffDate: '2026-08-18',
        instanceId: 'instance-1',
      };

      const result =
        await service.createRun(data);

      expect(
        repository.createRun,
      ).toHaveBeenCalledWith(data);

      expect(result).toEqual(run);
    });
  });

  describe('findMany', () => {
    it('should return scheduler runs', async () => {
      const runs = [
        {
          id: 'run-1',
          status: 'completed',
        },
      ];

      jest
        .spyOn(repository, 'findMany')
        .mockResolvedValue(runs as never);

      const filters = {
        limit: 20,
        offset: 0,
      };

      const result =
        await service.findMany(filters);

      expect(
        repository.findMany,
      ).toHaveBeenCalledWith(filters);

      expect(result).toEqual(runs);
    });
  });

  describe('findById', () => {
    it('should return a scheduler run with items', async () => {
      const run = {
        id: 'run-id',
        status: 'completed',
      };

      const items = [
        {
          id: 'item-1',
          run_id: 'run-id',
        },
      ];

      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(run as never);

      jest
        .spyOn(repository, 'findRunItems')
        .mockResolvedValue(items as never);

      const result =
        await service.findById('run-id');

      expect(
        repository.findById,
      ).toHaveBeenCalledWith('run-id');

      expect(
        repository.findRunItems,
      ).toHaveBeenCalledWith('run-id');

      expect(result).toEqual({
        ...run,
        items,
      });
    });

    it('should throw when scheduler run does not exist', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(undefined);

      await expect(
        service.findById('missing-run'),
      ).rejects.toThrow(
        'Scheduler run not found',
      );

      expect(
        repository.findRunItems,
      ).not.toHaveBeenCalled();
    });
  });

  describe('completeRun', () => {
    it('should complete an existing scheduler run', async () => {
      const run = {
        id: 'run-id',
        status: 'running',
      };

      const updated = {
        id: 'run-id',
        status: 'completed',
      };

      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(run as never);

      jest
        .spyOn(repository, 'completeRun')
        .mockResolvedValue(updated as never);

      const data = {
        status: 'completed' as const,
        completedAt: new Date(
          '2026-08-18T12:05:00.000Z',
        ),
        eligibleCount: 10,
        claimedCount: 10,
        succeededCount: 10,
        failedCount: 0,
        skippedCount: 0,
        invoicesCreatedCount: 10,
      };

      const result =
        await service.completeRun(
          'run-id',
          data,
        );

      expect(
        repository.findById,
      ).toHaveBeenCalledWith('run-id');

      expect(
        repository.completeRun,
      ).toHaveBeenCalledWith(
        'run-id',
        data,
      );

      expect(result).toEqual(updated);
    });

    it('should throw when scheduler run does not exist', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(undefined);

      const data = {
        status: 'completed' as const,
        completedAt: new Date(
          '2026-08-18T12:05:00.000Z',
        ),
        eligibleCount: 0,
        claimedCount: 0,
        succeededCount: 0,
        failedCount: 0,
        skippedCount: 0,
        invoicesCreatedCount: 0,
      };

      await expect(
        service.completeRun(
          'missing-run',
          data,
        ),
      ).rejects.toThrow(
        'Scheduler run not found',
      );

      expect(
        repository.completeRun,
      ).not.toHaveBeenCalled();
    });
  });

  describe('claimBatch', () => {
    it('should claim a bounded batch of subscriptions', async () => {
      const subscriptions = [
        {
          id: 'subscription-1',
          processing_run_id: 'run-id',
        },
        {
          id: 'subscription-2',
          processing_run_id: 'run-id',
        },
      ];

      jest
        .spyOn(subscriptionRepository, 'claimBatch')
        .mockResolvedValue(
          subscriptions as never,
        );

      const options = {
        cutoffDate: '2026-08-18',
        batchSize: 2,
        ownerToken: 'owner-token',
        processingRunId: 'run-id',
        processingStartedAt: new Date(
          '2026-08-18T12:00:00.000Z',
        ),
        processingExpiresAt: new Date(
          '2026-08-18T12:01:00.000Z',
        ),
      };

      const result =
        await service.claimBatch(options);

      expect(
        subscriptionRepository.claimBatch,
      ).toHaveBeenCalledWith(options);

      expect(result).toEqual(
        subscriptions,
      );
    });
  });
});