import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

describe('SchedulerController', () => {
  let controller: SchedulerController;
  let service: jest.Mocked<SchedulerService>;

  beforeEach(() => {
    service = {
      findMany: jest.fn(),
      findById: jest.fn(),
      createRun: jest.fn(),
      completeRun: jest.fn(),
    } as unknown as jest.Mocked<SchedulerService>;

    controller = new SchedulerController(
      service,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMany', () => {
    it('should list scheduler runs with defaults', async () => {
      const runs = [
        { id: 'run-1' },
        { id: 'run-2' },
      ];

      service.findMany.mockResolvedValue(
        runs as never,
      );

      const result =
        await controller.findMany();

      expect(
        service.findMany,
      ).toHaveBeenCalledWith({
        jobName: undefined,
        status: undefined,
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual(runs);
    });

    it('should apply filters and pagination', async () => {
      const runs = [
        { id: 'run-1' },
      ];

      service.findMany.mockResolvedValue(
        runs as never,
      );

      const result =
        await controller.findMany(
          'monthly-billing',
          'completed',
          '3',
          '10',
        );

      expect(
        service.findMany,
      ).toHaveBeenCalledWith({
        jobName: 'monthly-billing',
        status: 'completed',
        limit: 10,
        offset: 20,
      });

      expect(result).toEqual(runs);
    });

    it('should normalize invalid pagination values', async () => {
      service.findMany.mockResolvedValue(
        [] as never,
      );

      await controller.findMany(
        undefined,
        undefined,
        'invalid',
        'invalid',
      );

      expect(
        service.findMany,
      ).toHaveBeenCalledWith({
        jobName: undefined,
        status: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('should cap the limit at 100', async () => {
      service.findMany.mockResolvedValue(
        [] as never,
      );

      await controller.findMany(
        undefined,
        undefined,
        '1',
        '500',
      );

      expect(
        service.findMany,
      ).toHaveBeenCalledWith({
        jobName: undefined,
        status: undefined,
        limit: 100,
        offset: 0,
      });
    });
  });

  describe('findById', () => {
    it('should return a scheduler run by id', async () => {
      const run = {
        id: 'run-id',
        status: 'completed',
        items: [],
      };

      service.findById.mockResolvedValue(
        run as never,
      );

      const result =
        await controller.findById('run-id');

      expect(
        service.findById,
      ).toHaveBeenCalledWith('run-id');

      expect(result).toEqual(run);
    });
  });
});