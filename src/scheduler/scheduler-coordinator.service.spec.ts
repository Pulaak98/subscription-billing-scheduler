import {
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { SchedulerCoordinatorService } from './scheduler-coordinator.service';
import { SchedulerLockRepository } from './scheduler-lock.repository';

describe('SchedulerCoordinatorService', () => {
  let service: SchedulerCoordinatorService;
  let repository: jest.Mocked<SchedulerLockRepository>;

  const options = {
    lockName: 'monthly-billing',
    ownerToken: 'owner-1',
    leaseDurationMs: 300_000,
    heartbeatIntervalMs: 60_000,
  };

  beforeEach(() => {
    jest.useFakeTimers();

    repository = {
      acquire: jest.fn(),
      heartbeat: jest.fn(),
      release: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<SchedulerLockRepository>;

    service =
      new SchedulerCoordinatorService(
        repository,
      );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('acquire', () => {
    it('should acquire and activate the coordinator', async () => {
      repository.acquire.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      await service.acquire(options);

      expect(
        repository.acquire,
      ).toHaveBeenCalled();

      expect(service.isActive()).toBe(true);
    });

    it('should reject when the lock is unavailable', async () => {
      repository.acquire.mockResolvedValue(
        undefined,
      );

      await expect(
        service.acquire(options),
      ).rejects.toThrow(
        'Scheduler coordinator lock is already held',
      );

      expect(service.isActive()).toBe(false);
    });

    it('should reject duplicate acquisition by the same coordinator', async () => {
      repository.acquire.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      await service.acquire(options);

      await expect(
        service.acquire(options),
      ).rejects.toThrow(
        'Scheduler coordinator is already active',
      );
    });
  });

  describe('heartbeat', () => {
    it('should renew an active coordinator lease', async () => {
      repository.acquire.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      repository.heartbeat.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      await service.acquire(options);

      const result =
        await service.heartbeat(options);

      expect(
        repository.heartbeat,
      ).toHaveBeenCalledWith(
        options.lockName,
        options.ownerToken,
        expect.any(Date),
        expect.any(Date),
      );

      expect(result).toBe(true);
      expect(service.isActive()).toBe(true);
    });

    it('should stop when the coordinator loses its lock', async () => {
      repository.acquire.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      repository.heartbeat.mockResolvedValue(
        undefined,
      );

      await service.acquire(options);

      const result =
        await service.heartbeat(options);

      expect(result).toBe(false);
      expect(service.isActive()).toBe(false);
    });

    it('should not heartbeat when inactive', async () => {
      const result =
        await service.heartbeat(options);

      expect(result).toBe(false);

      expect(
        repository.heartbeat,
      ).not.toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('should release an active coordinator', async () => {
      repository.acquire.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      repository.release.mockResolvedValue(
        { numDeletedRows: 1 } as never,
      );

      await service.acquire(options);
      await service.release(options);

      expect(
        repository.release,
      ).toHaveBeenCalledWith(
        options.lockName,
        options.ownerToken,
      );

      expect(service.isActive()).toBe(false);
    });

    it('should do nothing when already inactive', async () => {
      await service.release(options);

      expect(
        repository.release,
      ).not.toHaveBeenCalled();
    });
  });

  describe('onApplicationShutdown', () => {
    it('should stop the heartbeat timer', async () => {
      repository.acquire.mockResolvedValue(
        {
          lock_name: options.lockName,
          owner_token: options.ownerToken,
        } as never,
      );

      await service.acquire(options);

      await service.onApplicationShutdown(
        'SIGTERM',
      );

      expect(service.isActive()).toBe(true);
    });
  });
});