import {
  ConflictException,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';

import { SchedulerLockRepository } from './scheduler-lock.repository';

export interface SchedulerCoordinatorOptions {
  lockName: string;
  ownerToken: string;
  leaseDurationMs: number;
  heartbeatIntervalMs: number;
}

@Injectable()
export class SchedulerCoordinatorService
  implements OnApplicationShutdown
{
  private readonly logger =
    new Logger(
      SchedulerCoordinatorService.name,
    );

  private heartbeatTimer:
    ReturnType<typeof setInterval> | null = null;

  private active = false;

  constructor(
    private readonly lockRepository: SchedulerLockRepository,
  ) {}

  async acquire(
    options: SchedulerCoordinatorOptions,
  ): Promise<void> {
    if (this.active) {
      throw new ConflictException(
        'Scheduler coordinator is already active',
      );
    }

    const now = new Date();

    const leaseExpiresAt = new Date(
      now.getTime() +
        options.leaseDurationMs,
    );

    const lock =
      await this.lockRepository.acquire({
        lockName: options.lockName,
        ownerToken: options.ownerToken,
        now,
        leaseExpiresAt,
      });

    if (!lock) {
      throw new ConflictException(
        'Scheduler coordinator lock is already held',
      );
    }

    this.active = true;

    this.heartbeatTimer =
      setInterval(() => {
        void this.heartbeat(options);
      }, options.heartbeatIntervalMs);

    this.logger.log(
      `Scheduler coordinator acquired lock "${options.lockName}"`,
    );
  }

  async heartbeat(
    options: SchedulerCoordinatorOptions,
  ): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    const now = new Date();

    const leaseExpiresAt = new Date(
      now.getTime() +
        options.leaseDurationMs,
    );

    const updated =
      await this.lockRepository.heartbeat(
        options.lockName,
        options.ownerToken,
        now,
        leaseExpiresAt,
      );

    if (!updated) {
      this.active = false;
      this.stopHeartbeat();

      this.logger.error(
        `Scheduler coordinator lost lock "${options.lockName}"`,
      );

      return false;
    }

    return true;
  }

  async release(
    options: SchedulerCoordinatorOptions,
  ): Promise<void> {
    this.stopHeartbeat();

    if (!this.active) {
      return;
    }

    this.active = false;

    await this.lockRepository.release(
      options.lockName,
      options.ownerToken,
    );

    this.logger.log(
      `Scheduler coordinator released lock "${options.lockName}"`,
    );
  }

  isActive(): boolean {
    return this.active;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async onApplicationShutdown(
    signal?: string,
  ): Promise<void> {
    this.stopHeartbeat();

    if (signal) {
      this.logger.log(
        `Scheduler coordinator shutting down because of ${signal}`,
      );
    }
  }
}