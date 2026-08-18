import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { SchedulerController } from './scheduler.controller';
import { SchedulerCoordinatorService } from './scheduler-coordinator.service';
import { SchedulerLockRepository } from './scheduler-lock.repository';
import { SchedulerRepository } from './scheduler.repository';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SchedulerController],
  providers: [
    SchedulerRepository,
    SchedulerLockRepository,
    SchedulerService,
    SchedulerCoordinatorService,
  ],
  exports: [
    SchedulerRepository,
    SchedulerLockRepository,
    SchedulerService,
    SchedulerCoordinatorService,
  ],
})
export class SchedulerModule {}