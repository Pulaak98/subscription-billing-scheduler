import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SchedulerRepository } from './scheduler.repository';
import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let repository: jest.Mocked<
    SchedulerRepository
  >;

  beforeEach(() => {
    repository = {
      createRun: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      findRunItems: jest.fn(),
      completeRun: jest.fn(),
    } as unknown as jest.Mocked<SchedulerRepository>;

    service = new SchedulerService(repository);
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

      repository.createRun.mockResolvedValue(
        run as never,
      );

      const data = {
        jobName: 'monthly-billing',
        triggerType: 'scheduled' as const,
        triggeredAt: new Date(
          '2026-08-18T10:00:00.000Z',
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
        { id: 'run-1' },
        { id: 'run-2' },
      ];

      repository.findMany.mockResolvedValue(
        runs as never,
      );

      const filters = {
        jobName: 'monthly-billing',
        status: 'completed' as const,
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
    it('should return a run with its items', async () => {
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

      repository.findById.mockResolvedValue(
        run as never,
      );

      repository.findRunItems.mockResolvedValue(
        items as never,
      );

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

    it('should throw when the run does not exist', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.findById('missing-id'),
      ).rejects.toThrow(
        'Scheduler run not found',
      );

      expect(
        repository.findRunItems,
      ).not.toHaveBeenCalled();
    });
  });

  describe('completeRun', () => {
    it('should complete an existing run', async () => {
      const run = {
        id: 'run-id',
        status: 'running',
      };

      const completed = {
        id: 'run-id',
        status: 'completed',
      };

      repository.findById.mockResolvedValue(
        run as never,
      );

      repository.completeRun.mockResolvedValue(
        completed as never,
      );

      const data = {
        status: 'completed' as const,
        completedAt: new Date(
          '2026-08-18T11:00:00.000Z',
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

      expect(result).toEqual(completed);
    });

    it('should throw when completing a missing run', async () => {
      repository.findById.mockResolvedValue(
        undefined,
      );

      await expect(
        service.completeRun(
          'missing-id',
          {
            status: 'completed',
            completedAt: new Date(),
            eligibleCount: 0,
            claimedCount: 0,
            succeededCount: 0,
            failedCount: 0,
            skippedCount: 0,
            invoicesCreatedCount: 0,
          },
        ),
      ).rejects.toThrow(
        'Scheduler run not found',
      );

      expect(
        repository.completeRun,
      ).not.toHaveBeenCalled();
    });
  });
});