import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { SchedulerController } from './scheduler.controller';
import { SchedulerRepository } from './scheduler.repository';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SchedulerController],
  providers: [
    SchedulerRepository,
    SchedulerService,
  ],
  exports: [
    SchedulerRepository,
    SchedulerService,
  ],
})
export class SchedulerModule {}