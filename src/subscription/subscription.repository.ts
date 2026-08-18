import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import {
  CreateSubscriptionData,
  SubscriptionStatus,
  UpdateSubscriptionData,
} from './subscription.types';

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

  async update(
    id: string,
    data: UpdateSubscriptionData,
  ) {
    return this.db
      .updateTable('subscriptions')
      .set({
        ...data.description !== undefined
          ? { description: data.description }
          : {},
        ...data.amount !== undefined
          ? { amount: data.amount }
          : {},
        ...data.currency !== undefined
          ? { currency: data.currency }
          : {},
        ...data.startDate !== undefined
          ? { start_date: data.startDate }
          : {},
        ...data.nextBillingDate !== undefined
          ? { next_billing_date: data.nextBillingDate }
          : {},
        ...data.billingAnchorDay !== undefined
          ? { billing_anchor_day: data.billingAnchorDay }
          : {},
        ...data.anchorIsMonthEnd !== undefined
          ? { anchor_is_month_end: data.anchorIsMonthEnd }
          : {},
      })
      .set('version', (eb) => eb('version', '+', 1))
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
      .set('version', (eb) => eb('version', '+', 1))
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
      .set('version', (eb) => eb('version', '+', 1))
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
      .set('version', (eb) => eb('version', '+', 1))
      .where('id', '=', id)
      .where('status', 'in', ['active', 'paused'])
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
      .set('version', (eb) => eb('version', '+', 1))
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}