import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export interface AcquireLockData {
  lockName: string;
  ownerToken: string;
  now: Date;
  leaseExpiresAt: Date;
}

@Injectable()
export class SchedulerLockRepository {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async acquire(
    data: AcquireLockData,
  ) {
    return this.db
      .insertInto('scheduler_locks')
      .values({
        lock_name: data.lockName,
        owner_token: data.ownerToken,
        acquired_at: data.now,
        lease_expires_at:
          data.leaseExpiresAt,
        heartbeat_at: data.now,
        version: 1,
      })
      .onConflict((oc) =>
        oc
          .column('lock_name')
          .doUpdateSet({
            owner_token: data.ownerToken,
            acquired_at: data.now,
            lease_expires_at:
              data.leaseExpiresAt,
            heartbeat_at: data.now,
            version: 1,
          })
          .where(
            'scheduler_locks.lease_expires_at',
            '<',
            data.now,
          ),
      )
      .returningAll()
      .executeTakeFirst();
  }

  async heartbeat(
    lockName: string,
    ownerToken: string,
    now: Date,
    leaseExpiresAt: Date,
  ) {
    return this.db
      .updateTable('scheduler_locks')
      .set({
        heartbeat_at: now,
        lease_expires_at: leaseExpiresAt,
      })
      .where('lock_name', '=', lockName)
      .where('owner_token', '=', ownerToken)
      .returningAll()
      .executeTakeFirst();
  }

  async release(
    lockName: string,
    ownerToken: string,
  ) {
    return this.db
      .deleteFrom('scheduler_locks')
      .where('lock_name', '=', lockName)
      .where('owner_token', '=', ownerToken)
      .executeTakeFirst();
  }

  async find(
    lockName: string,
  ) {
    return this.db
      .selectFrom('scheduler_locks')
      .selectAll()
      .where('lock_name', '=', lockName)
      .executeTakeFirst();
  }
}