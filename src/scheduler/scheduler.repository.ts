import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import {
  CompleteSchedulerRunData,
  CreateSchedulerRunData,
  SchedulerRunFilters,
} from './scheduler.types';

@Injectable()
export class SchedulerRepository {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async createRun(data: CreateSchedulerRunData) {
    return this.db
      .insertInto('scheduler_runs')
      .values({
        job_name: data.jobName,
        trigger_type: data.triggerType,
        triggered_at: data.triggeredAt,
        cutoff_date: data.cutoffDate,
        status: 'running',
        instance_id: data.instanceId,
        lease_owner_token: null,
        started_at: data.triggeredAt,
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
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return this.db
      .selectFrom('scheduler_runs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findMany(filters: SchedulerRunFilters) {
    let query = this.db
      .selectFrom('scheduler_runs')
      .selectAll();

    if (filters.jobName) {
      query = query.where(
        'job_name',
        '=',
        filters.jobName,
      );
    }

    if (filters.status) {
      query = query.where(
        'status',
        '=',
        filters.status,
      );
    }

    return query
      .orderBy('triggered_at', 'desc')
      .orderBy('id', 'desc')
      .limit(filters.limit)
      .offset(filters.offset)
      .execute();
  }

  async completeRun(
    id: string,
    data: CompleteSchedulerRunData,
  ) {
    return this.db
      .updateTable('scheduler_runs')
      .set({
        status: data.status,
        completed_at: data.completedAt,
        eligible_count: data.eligibleCount,
        claimed_count: data.claimedCount,
        succeeded_count: data.succeededCount,
        failed_count: data.failedCount,
        skipped_count: data.skippedCount,
        invoices_created_count:
          data.invoicesCreatedCount,
        error_code: data.errorCode ?? null,
        error_message:
          data.errorMessage ?? null,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async findRunItems(runId: string) {
    return this.db
      .selectFrom('scheduler_run_items')
      .selectAll()
      .where('run_id', '=', runId)
      .orderBy('started_at', 'asc')
      .orderBy('id', 'asc')
      .execute();
  }
}