import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { InvoiceFilters } from './invoice.types';

@Injectable()
export class InvoiceRepository {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async findById(id: string) {
    return this.db
      .selectFrom('invoices')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    return this.db
      .selectFrom('invoices')
      .selectAll()
      .where('invoice_number', '=', invoiceNumber)
      .executeTakeFirst();
  }

  async findMany(filters: InvoiceFilters) {
    let query = this.db
      .selectFrom('invoices')
      .selectAll();

    if (filters.subscriptionId) {
      query = query.where(
        'subscription_id',
        '=',
        filters.subscriptionId,
      );
    }

    if (filters.customerReference) {
      query = query.where(
        'customer_reference',
        '=',
        filters.customerReference,
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
      .orderBy('issue_date', 'desc')
      .orderBy('id', 'desc')
      .limit(filters.limit)
      .offset(filters.offset)
      .execute();
  }

  async findItems(invoiceId: string) {
    return this.db
      .selectFrom('invoice_items')
      .selectAll()
      .where('invoice_id', '=', invoiceId)
      .orderBy('id', 'asc')
      .execute();
  }

  async findByIdWithItems(id: string) {
    const invoice = await this.findById(id);

    if (!invoice) {
      return undefined;
    }

    const items = await this.findItems(id);

    return {
      ...invoice,
      items,
    };
  }
}