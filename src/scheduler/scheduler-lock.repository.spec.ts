import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SchedulerLockRepository } from './scheduler-lock.repository';

describe('SchedulerLockRepository', () => {
  let repository: SchedulerLockRepository;
  let db: any;

  beforeEach(() => {
    db = {
      insertInto: jest.fn(),
      selectFrom: jest.fn(),
      updateTable: jest.fn(),
      deleteFrom: jest.fn(),
    };

    repository = new SchedulerLockRepository(db);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('acquire', () => {
    it('should acquire an available lock', async () => {
      const now = new Date(
        '2026-08-18T12:00:00.000Z',
      );

      const leaseExpiresAt = new Date(
        '2026-08-18T12:01:00.000Z',
      );

      const lock = {
        lock_name: 'billing-scheduler',
        owner_token: 'owner-token',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => lock,
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

      const doUpdateSet = jest.fn(
        (..._args: unknown[]) => ({
          where,
        }),
      );

      const column = jest.fn(
        (..._args: unknown[]) => ({
          doUpdateSet,
        }),
      );

      const onConflict = jest.fn(
        (
          callback: (
            oc: any,
          ) => unknown,
        ) => {
          return callback({
            column,
          });
        },
      );

      const values = jest.fn(
        (..._args: unknown[]) => ({
          onConflict,
          returningAll,
        }),
      );

      db.insertInto.mockReturnValue({
        values,
      });

      const result =
        await repository.acquire({
          lockName: 'billing-scheduler',
          ownerToken: 'owner-token',
          now,
          leaseExpiresAt,
        });

      expect(
        db.insertInto,
      ).toHaveBeenCalledWith(
        'scheduler_locks',
      );

      expect(values).toHaveBeenCalledWith({
        lock_name: 'billing-scheduler',
        owner_token: 'owner-token',
        acquired_at: now,
        lease_expires_at: leaseExpiresAt,
        heartbeat_at: now,
        version: 1,
      });

      expect(column).toHaveBeenCalledWith(
        'lock_name',
      );

      expect(doUpdateSet).toHaveBeenCalledWith({
        owner_token: 'owner-token',
        acquired_at: now,
        lease_expires_at: leaseExpiresAt,
        heartbeat_at: now,
        version: 1,
      });

      expect(where).toHaveBeenCalledWith(
        'scheduler_locks.lease_expires_at',
        '<',
        now,
      );

      expect(returningAll).toHaveBeenCalled();

      expect(executeTakeFirst).toHaveBeenCalled();

      expect(result).toEqual(lock);
    });
  });

  describe('heartbeat', () => {
    it('should update the lock heartbeat', async () => {
      const now = new Date(
        '2026-08-18T12:00:00.000Z',
      );

      const leaseExpiresAt = new Date(
        '2026-08-18T12:01:00.000Z',
      );

      const lock = {
        lock_name: 'billing-scheduler',
        owner_token: 'owner-token',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => lock,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const secondWhere = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const firstWhere = jest.fn(
        (..._args: unknown[]) => ({
          where: secondWhere,
        }),
      );

      const set = jest.fn(
        (..._args: unknown[]) => ({
          where: firstWhere,
        }),
      );

      db.updateTable.mockReturnValue({
        set,
      });

      const result =
        await repository.heartbeat(
          'billing-scheduler',
          'owner-token',
          now,
          leaseExpiresAt,
        );

      expect(
        db.updateTable,
      ).toHaveBeenCalledWith(
        'scheduler_locks',
      );

      expect(set).toHaveBeenCalledWith({
        heartbeat_at: now,
        lease_expires_at: leaseExpiresAt,
      });

      expect(firstWhere).toHaveBeenCalledWith(
        'lock_name',
        '=',
        'billing-scheduler',
      );

      expect(secondWhere).toHaveBeenCalledWith(
        'owner_token',
        '=',
        'owner-token',
      );

      expect(returningAll).toHaveBeenCalled();

      expect(result).toEqual(lock);
    });
  });

  describe('release', () => {
    it('should release the lock', async () => {
      const result = {
        numDeletedRows: 1n,
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) =>
          result,
      );

      const secondWhere = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirst,
        }),
      );

      const firstWhere = jest.fn(
        (..._args: unknown[]) => ({
          where: secondWhere,
        }),
      );

      db.deleteFrom.mockReturnValue({
        where: firstWhere,
      });

      const response =
        await repository.release(
          'billing-scheduler',
          'owner-token',
        );

      expect(
        db.deleteFrom,
      ).toHaveBeenCalledWith(
        'scheduler_locks',
      );

      expect(firstWhere).toHaveBeenCalledWith(
        'lock_name',
        '=',
        'billing-scheduler',
      );

      expect(secondWhere).toHaveBeenCalledWith(
        'owner_token',
        '=',
        'owner-token',
      );

      expect(executeTakeFirst).toHaveBeenCalled();

      expect(response).toEqual(result);
    });
  });

  describe('find', () => {
    it('should find a scheduler lock', async () => {
      const lock = {
        lock_name: 'billing-scheduler',
        owner_token: 'owner-token',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => lock,
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
        await repository.find(
          'billing-scheduler',
        );

      expect(
        db.selectFrom,
      ).toHaveBeenCalledWith(
        'scheduler_locks',
      );

      expect(where).toHaveBeenCalledWith(
        'lock_name',
        '=',
        'billing-scheduler',
      );

      expect(executeTakeFirst).toHaveBeenCalled();

      expect(result).toEqual(lock);
    });
  });
});