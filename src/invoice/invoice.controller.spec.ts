import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { InvoiceController } from './invoice.controller';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: any;

  beforeEach(() => {
    service = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByInvoiceNumber: jest.fn(),
    };

    controller = new InvoiceController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list invoices', async () => {
    const query = {
      page: 1,
      limit: 20,
    };

    const result = [
      {
        id: 'invoice-id',
      },
    ];

    service.findMany.mockResolvedValue(result);

    await expect(
      controller.findMany(query),
    ).resolves.toEqual(result);

    expect(
      service.findMany,
    ).toHaveBeenCalledWith(query);
  });

  it('should return invoice by id', async () => {
    const invoice = {
      id: 'invoice-id',
      items: [],
    };

    service.findById.mockResolvedValue(invoice);

    await expect(
      controller.findById('invoice-id'),
    ).resolves.toEqual(invoice);

    expect(
      service.findById,
    ).toHaveBeenCalledWith('invoice-id');
  });

  it('should return invoice by invoice number', async () => {
    const invoice = {
      id: 'invoice-id',
      invoice_number: 'INV-000001',
      items: [],
    };

    service.findByInvoiceNumber.mockResolvedValue(
      invoice,
    );

    await expect(
      controller.findByInvoiceNumber(
        'INV-000001',
      ),
    ).resolves.toEqual(invoice);

    expect(
      service.findByInvoiceNumber,
    ).toHaveBeenCalledWith(
      'INV-000001',
    );
  });
});