import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { NotFoundException } from '@nestjs/common';

import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let repository: any;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByIdWithItems: jest.fn(),
      findByInvoiceNumber: jest.fn(),
      findItems: jest.fn(),
    };

    service = new InvoiceService(repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMany', () => {
    it('should calculate pagination offset', async () => {
      const invoices = [
        {
          id: 'invoice-id',
        },
      ];

      repository.findMany.mockResolvedValue(
        invoices,
      );

      const result = await service.findMany({
        page: 2,
        limit: 10,
      });

      expect(
        repository.findMany,
      ).toHaveBeenCalledWith({
        subscriptionId: undefined,
        customerReference: undefined,
        status: undefined,
        limit: 10,
        offset: 10,
      });

      expect(result).toEqual(invoices);
    });
  });

  describe('findById', () => {
    it('should return an invoice with items', async () => {
      const invoice = {
        id: 'invoice-id',
        invoice_number: 'INV-000001',
        items: [],
      };

      repository.findByIdWithItems.mockResolvedValue(
        invoice,
      );

      const result =
        await service.findById('invoice-id');

      expect(
        repository.findByIdWithItems,
      ).toHaveBeenCalledWith('invoice-id');

      expect(result).toEqual(invoice);
    });

    it('should throw when invoice does not exist', async () => {
      repository.findByIdWithItems.mockResolvedValue(
        undefined,
      );

      await expect(
        service.findById('invoice-id'),
      ).rejects.toThrow(
        new NotFoundException(
          'Invoice not found',
        ),
      );
    });
  });

  describe('findByInvoiceNumber', () => {
    it('should return invoice with its items', async () => {
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

      repository.findByInvoiceNumber.mockResolvedValue(
        invoice,
      );

      repository.findItems.mockResolvedValue(
        items,
      );

      const result =
        await service.findByInvoiceNumber(
          'INV-000001',
        );

      expect(
        repository.findByInvoiceNumber,
      ).toHaveBeenCalledWith(
        'INV-000001',
      );

      expect(
        repository.findItems,
      ).toHaveBeenCalledWith(
        'invoice-id',
      );

      expect(result).toEqual({
        ...invoice,
        items,
      });
    });

    it('should throw when invoice does not exist', async () => {
      repository.findByInvoiceNumber.mockResolvedValue(
        undefined,
      );

      await expect(
        service.findByInvoiceNumber(
          'INV-000001',
        ),
      ).rejects.toThrow(
        new NotFoundException(
          'Invoice not found',
        ),
      );
    });
  });
});