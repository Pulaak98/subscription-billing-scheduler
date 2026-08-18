import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { ListInvoicesDto } from './dto/list-invoices.dto';
import { InvoiceService } from './invoice.service';

@Controller('api/v1/invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get()
  findMany(@Query() query: ListInvoicesDto) {
    return this.invoiceService.findMany(query);
  }

  @Get('number/:invoiceNumber')
  findByInvoiceNumber(
    @Param('invoiceNumber') invoiceNumber: string,
  ) {
    return this.invoiceService.findByInvoiceNumber(
      invoiceNumber,
    );
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.invoiceService.findById(id);
  }
}