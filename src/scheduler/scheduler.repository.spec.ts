import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SchedulerRepository } from './scheduler.repository';

describe('SchedulerRepository', () => {
  let repository: SchedulerRepository;
  let db: any;

  beforeEach(() => {
    db = {
      insertInto: jest.fn(),
      selectFrom: jest.fn(),
      updateTable: jest.fn(),
    };

    repository = new SchedulerRepository(db);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createRun', () => {
    it('should create a scheduler run', async () => {
      const run = {
        id: 'run-id',
        job_name: 'monthly-billing',
        status: 'running',
      };

      const executeTakeFirstOrThrow = jest.fn(
        async (..._args: unknown[]) => run,
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

      const triggeredAt = new Date(
        '2026-08-18T10:00:00.000Z',
      );

      const result =
        await repository.createRun({
          jobName: 'monthly-billing',
          triggerType: 'scheduled',
          triggeredAt,
          cutoffDate: '2026-08-18',
          instanceId: 'instance-1',
        });

      expect(
        db.insertInto,
      ).toHaveBeenCalledWith(
        'scheduler_runs',
      );

      expect(values).toHaveBeenCalledWith({
        job_name: 'monthly-billing',
        trigger_type: 'scheduled',
        triggered_at: triggeredAt,
        cutoff_date: '2026-08-18',
        status: 'running',
        instance_id: 'instance-1',
        lease_owner_token: null,
        started_at: triggeredAt,
        completed_at: null,
        last_heartbeat_at: null,
        eligible_count: 0,
        claimed_count: 0,
        succeeded_count: 0,
        failed_count: 0,
        skipped_count: 0,
        invoices_created_count: 0,
        error_code: null,
        error_message: null,
      });

      expect(result).toEqual(run);
    });
  });

  describe('findById', () => {
    it('should find a scheduler run by id', async () => {
      const run = {
        id: 'run-id',
        status: 'running',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => run,
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

      const result =
        await repository.findById('run-id');

      expect(
        db.selectFrom,
      ).toHaveBeenCalledWith(
        'scheduler_runs',
      );

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'run-id',
      );

      expect(result).toEqual(run);
    });
  });

  describe('findMany', () => {
    it('should return runs without filters', async () => {
      const runs = [
        { id: 'run-2' },
        { id: 'run-1' },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => runs,
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

      const secondOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const firstOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: secondOrderBy,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: firstOrderBy,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result =
        await repository.findMany({
          limit: 20,
          offset: 0,
        });

      expect(firstOrderBy).toHaveBeenCalledWith(
        'triggered_at',
        'desc',
      );

      expect(secondOrderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

      expect(limit).toHaveBeenCalledWith(20);
      expect(offset).toHaveBeenCalledWith(0);

      expect(result).toEqual(runs);
    });

    it('should apply job name and status filters', async () => {
      const runs = [
        {
          id: 'run-1',
          job_name: 'monthly-billing',
          status: 'completed',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => runs,
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

      const secondOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const firstOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: secondOrderBy,
        }),
      );

      const secondWhere = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: firstOrderBy,
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

      const result =
        await repository.findMany({
          jobName: 'monthly-billing',
          status: 'completed',
          limit: 10,
          offset: 20,
        });

      expect(firstWhere).toHaveBeenCalledWith(
        'job_name',
        '=',
        'monthly-billing',
      );

      expect(secondWhere).toHaveBeenCalledWith(
        'status',
        '=',
        'completed',
      );

      expect(limit).toHaveBeenCalledWith(10);
      expect(offset).toHaveBeenCalledWith(20);

      expect(result).toEqual(runs);
    });
  });

  describe('completeRun', () => {
    it('should complete a scheduler run', async () => {
      const completedAt = new Date(
        '2026-08-18T11:00:00.000Z',
      );

      const run = {
        id: 'run-id',
        status: 'completed',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => run,
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

      const set = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result =
        await repository.completeRun(
          'run-id',
          {
            status: 'completed',
            completedAt,
            eligibleCount: 10,
            claimedCount: 10,
            succeededCount: 9,
            failedCount: 1,
            skippedCount: 0,
            invoicesCreatedCount: 9,
          },
        );

      expect(
        db.updateTable,
      ).toHaveBeenCalledWith(
        'scheduler_runs',
      );

      expect(set).toHaveBeenCalledWith({
        status: 'completed',
        completed_at: completedAt,
        eligible_count: 10,
        claimed_count: 10,
        succeeded_count: 9,
        failed_count: 1,
        skipped_count: 0,
        invoices_created_count: 9,
        error_code: null,
        error_message: null,
      });

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'run-id',
      );

      expect(result).toEqual(run);
    });
  });

  describe('findRunItems', () => {
    it('should return run items', async () => {
      const items = [
        {
          id: 'item-1',
          run_id: 'run-id',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => items,
      );

      const secondOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const firstOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: secondOrderBy,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: firstOrderBy,
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

      const result =
        await repository.findRunItems(
          'run-id',
        );

      expect(
        db.selectFrom,
      ).toHaveBeenCalledWith(
        'scheduler_run_items',
      );

      expect(where).toHaveBeenCalledWith(
        'run_id',
        '=',
        'run-id',
      );

      expect(firstOrderBy).toHaveBeenCalledWith(
        'started_at',
        'asc',
      );

      expect(secondOrderBy).toHaveBeenCalledWith(
        'id',
        'asc',
      );

      expect(result).toEqual(items);
    });
  });
});