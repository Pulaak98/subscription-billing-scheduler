import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { InvoiceRepository } from './invoice.repository';

describe('InvoiceRepository', () => {
  let repository: InvoiceRepository;
  let db: any;

  beforeEach(() => {
    db = {
      selectFrom: jest.fn(),
      transaction: jest.fn(),
    };

    repository = new InvoiceRepository(db);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find an invoice by id', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => invoice,
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
        await repository.findById('invoice-id');

      expect(db.selectFrom).toHaveBeenCalledWith(
        'invoices',
      );

      expect(where).toHaveBeenCalledWith(
        'id',
        '=',
        'invoice-id',
      );

      expect(result).toEqual(invoice);
    });
  });

  describe('findByInvoiceNumber', () => {
    it('should find an invoice by invoice number', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => invoice,
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
        await repository.findByInvoiceNumber(
          'INV-000001',
        );

      expect(where).toHaveBeenCalledWith(
        'invoice_number',
        '=',
        'INV-000001',
      );

      expect(result).toEqual(invoice);
    });
  });

  describe('findByIdempotencyKey', () => {
    it('should find an invoice by idempotency key', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
        idempotency_key:
          'subscription-id:2026-08-31',
      };

      const executeTakeFirst = jest.fn(
        async (..._args: unknown[]) => invoice,
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
        await repository.findByIdempotencyKey(
          'subscription-id:2026-08-31',
        );

      expect(db.selectFrom).toHaveBeenCalledWith(
        'invoices',
      );

      expect(where).toHaveBeenCalledWith(
        'idempotency_key',
        '=',
        'subscription-id:2026-08-31',
      );

      expect(result).toEqual(invoice);
    });
  });

  describe('findItems', () => {
    it('should return invoice items', async () => {
      const items = [
        {
          id: 'item-1',
          invoice_id: 'invoice-id',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => items,
      );

      const orderBy = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const where = jest.fn(
        (..._args: unknown[]) => ({
          orderBy,
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
        await repository.findItems('invoice-id');

      expect(db.selectFrom).toHaveBeenCalledWith(
        'invoice_items',
      );

      expect(where).toHaveBeenCalledWith(
        'invoice_id',
        '=',
        'invoice-id',
      );

      expect(orderBy).toHaveBeenCalledWith(
        'id',
        'asc',
      );

      expect(result).toEqual(items);
    });
  });

  describe('findByIdWithItems', () => {
    it('should return invoice with items', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
      };

      const items = [
        {
          id: 'item-1',
          invoice_id: 'invoice-id',
        },
      ];

      const findById = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(invoice as any);

      const findItems = jest
        .spyOn(repository, 'findItems')
        .mockResolvedValue(items as any);

      const result =
        await repository.findByIdWithItems(
          'invoice-id',
        );

      expect(findById).toHaveBeenCalledWith(
        'invoice-id',
      );

      expect(findItems).toHaveBeenCalledWith(
        'invoice-id',
      );

      expect(result).toEqual({
        ...invoice,
        items,
      });
    });

    it('should return undefined when invoice does not exist', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(undefined);

      const findItems = jest.spyOn(
        repository,
        'findItems',
      );

      const result =
        await repository.findByIdWithItems(
          'invoice-id',
        );

      expect(result).toBeUndefined();
      expect(findItems).not.toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('should return invoices without filters', async () => {
      const invoices = [
        {
          id: 'invoice-id',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => invoices,
      );

      const offset = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const limit = jest.fn(
        (..._args: unknown[]) => ({
          offset,
        }),
      );

      const secondOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const firstOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: secondOrderBy,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: firstOrderBy,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany({
        limit: 20,
        offset: 0,
      });

      expect(db.selectFrom).toHaveBeenCalledWith(
        'invoices',
      );

      expect(firstOrderBy).toHaveBeenCalledWith(
        'issue_date',
        'desc',
      );

      expect(secondOrderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

      expect(limit).toHaveBeenCalledWith(20);
      expect(offset).toHaveBeenCalledWith(0);

      expect(result).toEqual(invoices);
    });

    it('should return invoices with all filters', async () => {
      const invoices = [
        {
          id: 'invoice-id',
          subscription_id: 'subscription-id',
          customer_reference: 'CUST-1001',
          status: 'issued',
        },
      ];

      const execute = jest.fn(
        async (..._args: unknown[]) => invoices,
      );

      const offset = jest.fn(
        (..._args: unknown[]) => ({
          execute,
        }),
      );

      const limit = jest.fn(
        (..._args: unknown[]) => ({
          offset,
        }),
      );

      const secondOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          limit,
        }),
      );

      const firstOrderBy = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: secondOrderBy,
        }),
      );

      const thirdWhere = jest.fn(
        (..._args: unknown[]) => ({
          orderBy: firstOrderBy,
        }),
      );

      const secondWhere = jest.fn(
        (..._args: unknown[]) => ({
          where: thirdWhere,
        }),
      );

      const firstWhere = jest.fn(
        (..._args: unknown[]) => ({
          where: secondWhere,
        }),
      );

      const selectAll = jest.fn(
        (..._args: unknown[]) => ({
          where: firstWhere,
        }),
      );

      db.selectFrom.mockReturnValue({
        selectAll,
      });

      const result = await repository.findMany({
        subscriptionId: 'subscription-id',
        customerReference: 'CUST-1001',
        status: 'issued',
        limit: 10,
        offset: 20,
      });

      expect(firstWhere).toHaveBeenCalledWith(
        'subscription_id',
        '=',
        'subscription-id',
      );

      expect(secondWhere).toHaveBeenCalledWith(
        'customer_reference',
        '=',
        'CUST-1001',
      );

      expect(thirdWhere).toHaveBeenCalledWith(
        'status',
        '=',
        'issued',
      );

      expect(firstOrderBy).toHaveBeenCalledWith(
        'issue_date',
        'desc',
      );

      expect(secondOrderBy).toHaveBeenCalledWith(
        'id',
        'desc',
      );

      expect(limit).toHaveBeenCalledWith(10);
      expect(offset).toHaveBeenCalledWith(20);

      expect(result).toEqual(invoices);
    });
  });

  describe('createInvoice', () => {
    it('should return the existing invoice when idempotency key already exists', async () => {
      const existingInvoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
        idempotency_key:
          'subscription-id:2026-08-31',
      };

      jest
        .spyOn(repository, 'findByIdempotencyKey')
        .mockResolvedValue(
          existingInvoice as any,
        );

      const transaction = jest.spyOn(
        db,
        'transaction',
      );

      const result =
        await repository.createInvoice(
          {
            invoiceNumber: 'INV-000001',
            subscriptionId: 'subscription-id',
            customerReference: 'CUST-1001',
            billingPeriodStart: '2026-08-01',
            billingPeriodEnd: '2026-08-31',
            issueDate: '2026-08-18',
            currency: 'USD',
            subtotal: '49.0000',
            taxTotal: '0.0000',
            discountTotal: '0.0000',
            total: '49.0000',
            idempotencyKey:
              'subscription-id:2026-08-31',
            generatedByRunId: 'run-id',
          },
          [
            {
              description: 'Pro Plan',
              quantity: '1',
              unitPrice: '49.0000',
              lineTotal: '49.0000',
            },
          ],
        );

      expect(
        repository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(
        'subscription-id:2026-08-31',
      );

      expect(transaction).not.toHaveBeenCalled();
      expect(result).toEqual(existingInvoice);
    });

    it('should create invoice and invoice items in one transaction', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
      };

      jest
        .spyOn(repository, 'findByIdempotencyKey')
        .mockResolvedValue(undefined);

      const executeTakeFirstOrThrow = jest.fn(
        async (..._args: unknown[]) => invoice,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirstOrThrow,
        }),
      );

      const invoiceValues = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const invoiceInsertInto = jest.fn(
        (..._args: unknown[]) => ({
          values: invoiceValues,
        }),
      );

      const itemExecute = jest.fn(
        async (..._args: unknown[]) =>
          undefined,
      );

      const itemValues = jest.fn(
        (..._args: unknown[]) => ({
          execute: itemExecute,
        }),
      );

      const itemInsertInto = jest.fn(
        (..._args: unknown[]) => ({
          values: itemValues,
        }),
      );

      const transactionExecute = jest.fn(
        async (
          callback: (
            trx: any,
          ) => Promise<unknown>,
        ) => {
          return callback({
            insertInto: jest
              .fn()
              .mockImplementation(
                (table: unknown) => {
                  if (table === 'invoices') {
                    return invoiceInsertInto();
                  }

                  return itemInsertInto();
                },
              ),
          });
        },
      );

      db.transaction.mockReturnValue({
        execute: transactionExecute,
      });

      const result =
        await repository.createInvoice(
          {
            invoiceNumber: 'INV-000001',
            subscriptionId:
              'subscription-id',
            customerReference: 'CUST-1001',
            billingPeriodStart:
              '2026-08-01',
            billingPeriodEnd:
              '2026-08-31',
            issueDate: '2026-08-18',
            currency: 'USD',
            subtotal: '49.0000',
            taxTotal: '0.0000',
            discountTotal: '0.0000',
            total: '49.0000',
            idempotencyKey:
              'subscription-id:2026-08-31',
            generatedByRunId: 'run-id',
          },
          [
            {
              description: 'Pro Plan',
              quantity: '1',
              unitPrice: '49.0000',
              lineTotal: '49.0000',
            },
          ],
        );

      expect(
        repository.findByIdempotencyKey,
      ).toHaveBeenCalledWith(
        'subscription-id:2026-08-31',
      );

      expect(
        db.transaction,
      ).toHaveBeenCalled();

      expect(
        transactionExecute,
      ).toHaveBeenCalled();

      expect(
        invoiceInsertInto,
      ).toHaveBeenCalled();

      expect(
        invoiceValues,
      ).toHaveBeenCalledWith({
        invoice_number: 'INV-000001',
        subscription_id:
          'subscription-id',
        customer_reference:
          'CUST-1001',
        billing_period_start:
          '2026-08-01',
        billing_period_end:
          '2026-08-31',
        issue_date: '2026-08-18',
        status: 'issued',
        currency: 'USD',
        subtotal: '49.0000',
        tax_total: '0.0000',
        discount_total: '0.0000',
        total: '49.0000',
        idempotency_key:
          'subscription-id:2026-08-31',
        generated_by_run_id:
          'run-id',
      });

      expect(
        itemValues,
      ).toHaveBeenCalledWith([
        {
          invoice_id: 'invoice-id',
          description: 'Pro Plan',
          quantity: '1',
          unit_price: '49.0000',
          line_total: '49.0000',
        },
      ]);

      expect(result).toEqual(invoice);
    });

    it('should create invoice without items when item list is empty', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
      };

      jest
        .spyOn(repository, 'findByIdempotencyKey')
        .mockResolvedValue(undefined);

      const executeTakeFirstOrThrow = jest.fn(
        async (..._args: unknown[]) => invoice,
      );

      const returningAll = jest.fn(
        (..._args: unknown[]) => ({
          executeTakeFirstOrThrow,
        }),
      );

      const invoiceValues = jest.fn(
        (..._args: unknown[]) => ({
          returningAll,
        }),
      );

      const invoiceInsertInto = jest.fn(
        (..._args: unknown[]) => ({
          values: invoiceValues,
        }),
      );

      const insertInto = jest.fn(
        (..._args: unknown[]) => ({
          values: invoiceValues,
        }),
      );

      const transactionExecute = jest.fn(
        async (
          callback: (
            trx: any,
          ) => Promise<unknown>,
        ) => {
          return callback({
            insertInto,
          });
        },
      );

      db.transaction.mockReturnValue({
        execute: transactionExecute,
      });

      insertInto
        .mockImplementationOnce(
          (..._args: unknown[]) =>
            invoiceInsertInto(),
        );

      const result =
        await repository.createInvoice(
          {
            invoiceNumber: 'INV-000001',
            subscriptionId:
              'subscription-id',
            customerReference: 'CUST-1001',
            billingPeriodStart:
              '2026-08-01',
            billingPeriodEnd:
              '2026-08-31',
            issueDate: '2026-08-18',
            currency: 'USD',
            subtotal: '49.0000',
            taxTotal: '0.0000',
            discountTotal: '0.0000',
            total: '49.0000',
            idempotencyKey:
              'subscription-id:2026-08-31',
            generatedByRunId: 'run-id',
          },
          [],
        );

      expect(
        insertInto,
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual(invoice);
    });
  });
});