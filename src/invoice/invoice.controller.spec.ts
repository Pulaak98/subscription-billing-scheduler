import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

describe('InvoiceController', () => {
  let controller: InvoiceController;

  let findManyMock: jest.Mock<
    (...args: any[]) => Promise<any>
  >;

  let findByIdMock: jest.Mock<
    (...args: any[]) => Promise<any>
  >;

  beforeEach(() => {
    findManyMock = jest.fn<
      (...args: any[]) => Promise<any>
    >();

    findByIdMock = jest.fn<
      (...args: any[]) => Promise<any>
    >();

    const service = {
      findMany: findManyMock,
      findById: findByIdMock,
    };

    controller = new InvoiceController(
      service as unknown as InvoiceService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMany', () => {
    it('should return invoices', async () => {
      const invoices = [
        {
          id: 'invoice-id',
          invoice_number: 'INV-000001',
        },
      ];

      findManyMock.mockResolvedValue(invoices);

      const query = {
        page: 1,
        limit: 20,
      };

      const result =
        await controller.findMany(query);

      expect(findManyMock).toHaveBeenCalledWith(
        query,
      );

      expect(result).toEqual(invoices);
    });

    it('should pass filters to the service', async () => {
      const invoices = [
        {
          id: 'invoice-id',
          invoice_number: 'INV-000001',
        },
      ];

      findManyMock.mockResolvedValue(invoices);

      const query = {
        subscriptionId: 'subscription-id',
        customerReference: 'CUST-1001',
        status: 'issued' as const,
        page: 2,
        limit: 10,
      };

      const result =
        await controller.findMany(query);

      expect(findManyMock).toHaveBeenCalledWith(
        query,
      );

      expect(result).toEqual(invoices);
    });
  });

  describe('findById', () => {
    it('should return an invoice by id', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
      };

      findByIdMock.mockResolvedValue(invoice);

      const result =
        await controller.findById('invoice-id');

      expect(findByIdMock).toHaveBeenCalledWith(
        'invoice-id',
      );

      expect(result).toEqual(invoice);
    });
  });
});
