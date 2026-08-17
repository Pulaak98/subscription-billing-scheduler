import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';

import { Database } from '../database/database.types';
import {
  CreateSubscriptionData,
  SubscriptionStatus,
} from './subscription.types';
import { DatabaseService } from '../database/database.service';

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
}