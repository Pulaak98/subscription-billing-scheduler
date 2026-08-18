import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import {
  CreateSubscriptionData,
  SubscriptionStatus,
  UpdateSubscriptionData,
} from './subscription.types';

export interface ClaimSubscriptionsData {
  cutoffDate: string;
  batchSize: number;
  ownerToken: string;
  processingRunId: string;
  processingStartedAt: Date;
  processingExpiresAt: Date;
}

export interface MarkTransientFailureData {
  id: string;
  errorCode: string;
  errorMessage: string;
  retryAt: Date;
}

export interface MarkPermanentFailureData {
  id: string;
  errorCode: string;
  errorMessage: string;
}

export interface CompleteBillingData {
  id: string;
  expectedBillingDate: string;
  nextBillingDate: string;
  processingRunId: string;
  processingOwner: string;
}

@Injectable()
export class SubscriptionRepository {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async create(data: CreateSubscriptionData) {
    return this.db
      .insertInto('subscriptions')
      .values({
        customer_reference: data.customerReference,
        description: data.description,
        status: 'active',
        billing_state: 'ready',
        currency: data.currency,
        amount: data.amount,
        start_date: data.startDate,
        next_billing_date: data.nextBillingDate,
        billing_anchor_day: data.billingAnchorDay,
        anchor_is_month_end: data.anchorIsMonthEnd,
        billing_failure_count: 0,
        version: 1,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findMany(
    customerReference?: string,
    status?: SubscriptionStatus,
    limit = 20,
    offset = 0,
  ) {
    let query = this.db
      .selectFrom('subscriptions')
      .selectAll();

    if (customerReference) {
      query = query.where(
        'customer_reference',
        '=',
        customerReference,
      );
    }

    if (status) {
      query = query.where(
        'status',
        '=',
        status,
      );
    }

    return query
      .orderBy('id', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
  }

  async claimBatch(data: ClaimSubscriptionsData) {
    return this.db
      .updateTable('subscriptions')
      .set({
        processing_run_id:
          data.processingRunId,
        processing_owner:
          data.ownerToken,
        processing_started_at:
          data.processingStartedAt,
        processing_expires_at:
          data.processingExpiresAt,
      })
      .where(
        'id',
        'in',
        this.db
          .selectFrom('subscriptions')
          .select('id')
          .where('status', '=', 'active')
          .where(
            'next_billing_date',
            '<=',
            data.cutoffDate,
          )
          .where((eb) =>
            eb.or([
              eb(
                'billing_state',
                '=',
                'ready',
              ),
              eb.and([
                eb(
                  'billing_state',
                  '=',
                  'retry_wait',
                ),
                eb(
                  'billing_retry_at',
                  '<=',
                  data.processingStartedAt,
                ),
              ]),
            ]),
          )
          .where((eb) =>
            eb.or([
              eb(
                'processing_expires_at',
                'is',
                null,
              ),
              eb(
                'processing_expires_at',
                '<',
                data.processingStartedAt,
              ),
            ]),
          )
          .orderBy(
            'next_billing_date',
            'asc',
          )
          .orderBy('id', 'asc')
          .limit(data.batchSize),
      )
      .returningAll()
      .execute();
  }

  async markTransientFailure(
    data: MarkTransientFailureData,
  ) {
    return this.db
      .updateTable('subscriptions')
      .set({
        billing_state: 'retry_wait',
        billing_retry_at: data.retryAt,
        last_billing_error_code:
          data.errorCode,
        last_billing_error_message:
          data.errorMessage,
      })
      .set(
        'billing_failure_count',
        (eb) =>
          eb('billing_failure_count', '+', 1),
      )
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', data.id)
      .returningAll()
      .executeTakeFirst();
  }

  async markPermanentFailure(
    data: MarkPermanentFailureData,
  ) {
    return this.db
      .updateTable('subscriptions')
      .set({
        billing_state: 'blocked',
        billing_retry_at: null,
        last_billing_error_code:
          data.errorCode,
        last_billing_error_message:
          data.errorMessage,
      })
      .set(
        'billing_failure_count',
        (eb) =>
          eb('billing_failure_count', '+', 1),
      )
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', data.id)
      .returningAll()
      .executeTakeFirst();
  }

  async recoverExpiredClaims(now: Date) {
    return this.db
      .updateTable('subscriptions')
      .set({
        processing_run_id: null,
        processing_owner: null,
        processing_started_at: null,
        processing_expires_at: null,
      })
      .where(
        'processing_expires_at',
        '<=',
        now,
      )
      .returningAll()
      .execute();
  }

  async completeBilling(
    data: CompleteBillingData,
  ) {
    return this.db
      .updateTable('subscriptions')
      .set({
        next_billing_date:
          data.nextBillingDate,
        billing_state: 'ready',
        billing_retry_at: null,
        billing_failure_count: 0,
        last_billing_error_code: null,
        last_billing_error_message: null,
        processing_run_id: null,
        processing_owner: null,
        processing_started_at: null,
        processing_expires_at: null,
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', data.id)
      .where(
        'next_billing_date',
        '=',
        data.expectedBillingDate,
      )
      .where(
        'processing_run_id',
        '=',
        data.processingRunId,
      )
      .where(
        'processing_owner',
        '=',
        data.processingOwner,
      )
      .returningAll()
      .executeTakeFirst();
  }

  async unblock(id: string) {
    return this.db
      .updateTable('subscriptions')
      .set({
        billing_state: 'ready',
        billing_retry_at: null,
        billing_failure_count: 0,
        last_billing_error_code: null,
        last_billing_error_message: null,
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', id)
      .where(
        'billing_state',
        '=',
        'blocked',
      )
      .returningAll()
      .executeTakeFirst();
  }

  async update(
    id: string,
    data: UpdateSubscriptionData,
  ) {
    return this.db
      .updateTable('subscriptions')
      .set({
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.amount !== undefined
          ? { amount: data.amount }
          : {}),
        ...(data.currency !== undefined
          ? { currency: data.currency }
          : {}),
        ...(data.startDate !== undefined
          ? { start_date: data.startDate }
          : {}),
        ...(data.nextBillingDate !== undefined
          ? {
              next_billing_date:
                data.nextBillingDate,
            }
          : {}),
        ...(data.billingAnchorDay !== undefined
          ? {
              billing_anchor_day:
                data.billingAnchorDay,
            }
          : {}),
        ...(data.anchorIsMonthEnd !== undefined
          ? {
              anchor_is_month_end:
                data.anchorIsMonthEnd,
            }
          : {}),
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async pause(id: string) {
    return this.db
      .updateTable('subscriptions')
      .set({
        status: 'paused',
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', id)
      .where('status', '=', 'active')
      .returningAll()
      .executeTakeFirst();
  }

  async resume(id: string) {
    return this.db
      .updateTable('subscriptions')
      .set({
        status: 'active',
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', id)
      .where('status', '=', 'paused')
      .returningAll()
      .executeTakeFirst();
  }

  async cancel(id: string) {
    return this.db
      .updateTable('subscriptions')
      .set({
        status: 'canceled',
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', id)
      .where(
        'status',
        'in',
        ['active', 'paused'],
      )
      .returningAll()
      .executeTakeFirst();
  }

  async resetBillingFailure(id: string) {
    return this.db
      .updateTable('subscriptions')
      .set({
        billing_state: 'ready',
        billing_retry_at: null,
        billing_failure_count: 0,
        last_billing_error_code: null,
        last_billing_error_message: null,
      })
      .set(
        'version',
        (eb) => eb('version', '+', 1),
      )
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}