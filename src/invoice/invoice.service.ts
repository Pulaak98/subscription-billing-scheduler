import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ListInvoicesDto } from './dto/list-invoices.dto';
import {
  GenerateInvoiceData,
} from './invoice.types';
import { InvoiceRepository } from './invoice.repository';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
  ) {}

  async findMany(dto: ListInvoicesDto) {
    const offset =
      (dto.page - 1) * dto.limit;

    return this.repository.findMany({
      subscriptionId:
        dto.subscriptionId,
      customerReference:
        dto.customerReference,
      status: dto.status,
      limit: dto.limit,
      offset,
    });
  }

  async findById(id: string) {
    const invoice =
      await this.repository.findByIdWithItems(
        id,
      );

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
      await this.repository.findItems(
        invoice.id,
      );

    return {
      ...invoice,
      items,
    };
  }

  async generateInvoice(
    data: GenerateInvoiceData,
  ) {
    return this.repository.createInvoice(
      {
        invoiceNumber:
          data.invoiceNumber,
        subscriptionId:
          data.subscriptionId,
        customerReference:
          data.customerReference,
        billingPeriodStart:
          data.billingPeriodStart,
        billingPeriodEnd:
          data.billingPeriodEnd,
        issueDate:
          data.issueDate,
        currency:
          data.currency,
        subtotal:
          data.subtotal,
        taxTotal:
          data.taxTotal,
        discountTotal:
          data.discountTotal,
        total:
          data.total,
        idempotencyKey:
          data.idempotencyKey,
        generatedByRunId:
          data.generatedByRunId,
      },
      data.items.map((item) => ({
        description:
          item.description,
        quantity:
          item.quantity,
        unitPrice:
          item.unitPrice,
        lineTotal:
          item.lineTotal,
      })),
    );
  }
}