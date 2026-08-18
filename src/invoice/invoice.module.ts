import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [DatabaseModule],
  controllers: [InvoiceController],
  providers: [
    InvoiceRepository,
    InvoiceService,
  ],
  exports: [
    InvoiceRepository,
    InvoiceService,
  ],
})
export class InvoiceModule {}