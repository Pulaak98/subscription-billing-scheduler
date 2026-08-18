import { Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

import { Database } from '../database/database.types';
import { DatabaseService } from '../database/database.service';
import { InvoiceFilters } from './invoice.types';

export interface CreateInvoiceData {
  invoiceNumber: string;
  subscriptionId: string;
  customerReference: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  issueDate: string;
  currency: string;
  subtotal: string;
  taxTotal: string;
  discountTotal: string;
  total: string;
  idempotencyKey: string;
  generatedByRunId: string;
}

export interface CreateInvoiceItemData {
  invoiceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
}

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

  async findByInvoiceNumber(
    invoiceNumber: string,
  ) {
    return this.db
      .selectFrom('invoices')
      .selectAll()
      .where('invoice_number', '=', invoiceNumber)
      .executeTakeFirst();
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ) {
    return this.db
      .selectFrom('invoices')
      .selectAll()
      .where(
        'idempotency_key',
        '=',
        idempotencyKey,
      )
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

  async createInvoice(
    data: CreateInvoiceData,
    items: Omit<
      CreateInvoiceItemData,
      'invoiceId'
    >[],
  ) {
    const existingInvoice =
      await this.findByIdempotencyKey(
        data.idempotencyKey,
      );

    if (existingInvoice) {
      return existingInvoice;
    }

    try {
      return await this.db
        .transaction()
        .execute(
          async (
            trx: Transaction<Database>,
          ) => {
            const invoice = await trx
              .insertInto('invoices')
              .values({
                invoice_number:
                  data.invoiceNumber,
                subscription_id:
                  data.subscriptionId,
                customer_reference:
                  data.customerReference,
                billing_period_start:
                  data.billingPeriodStart,
                billing_period_end:
                  data.billingPeriodEnd,
                issue_date: data.issueDate,
                status: 'issued',
                currency: data.currency,
                subtotal: data.subtotal,
                tax_total: data.taxTotal,
                discount_total:
                  data.discountTotal,
                total: data.total,
                idempotency_key:
                  data.idempotencyKey,
                generated_by_run_id:
                  data.generatedByRunId,
              })
              .returningAll()
              .executeTakeFirstOrThrow();

            if (items.length > 0) {
              await trx
                .insertInto('invoice_items')
                .values(
                  items.map((item) => ({
                    invoice_id: invoice.id,
                    description:
                      item.description,
                    quantity: item.quantity,
                    unit_price:
                      item.unitPrice,
                    line_total:
                      item.lineTotal,
                  })),
                )
                .execute();
            }

            return invoice;
          },
        );
    } catch (error: unknown) {
      if (
        this.isUniqueViolation(error)
      ) {
        const duplicate =
          await this.findByIdempotencyKey(
            data.idempotencyKey,
          );

        if (duplicate) {
          return duplicate;
        }
      }

      throw error;
    }
  }

  private isUniqueViolation(
    error: unknown,
  ): boolean {
    if (
      typeof error !== 'object' ||
      error === null
    ) {
      return false;
    }

    const databaseError =
      error as {
        code?: string;
      };

    return databaseError.code === '23505';
  }
}