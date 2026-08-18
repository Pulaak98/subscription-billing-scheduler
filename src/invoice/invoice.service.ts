import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ListInvoicesDto } from './dto/list-invoices.dto';
import { InvoiceRepository } from './invoice.repository';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
  ) {}

  async findMany(dto: ListInvoicesDto) {
    const offset = (dto.page - 1) * dto.limit;

    return this.repository.findMany({
      subscriptionId: dto.subscriptionId,
      customerReference: dto.customerReference,
      status: dto.status,
      limit: dto.limit,
      offset,
    });
  }

  async findById(id: string) {
    const invoice =
      await this.repository.findByIdWithItems(id);

    if (!invoice) {
      throw new NotFoundException(
        'Invoice not found',
      );
    }

    return invoice;
  }

  async findByInvoiceNumber(
    invoiceNumber: string,
  ) {
    const invoice =
      await this.repository.findByInvoiceNumber(
        invoiceNumber,
      );

    if (!invoice) {
      throw new NotFoundException(
        'Invoice not found',
      );
    }

    const items =
      await this.repository.findItems(invoice.id);

    return {
      ...invoice,
      items,
    };
  }
}