import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { SubscriptionModule } from '../subscription/subscription.module';

import { SchedulerController } from './scheduler.controller';
import { SchedulerCoordinatorService } from './scheduler-coordinator.service';
import { SchedulerLockRepository } from './scheduler-lock.repository';
import { SchedulerRepository } from './scheduler.repository';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
  ],
  controllers: [
    SchedulerController,
  ],
  providers: [
    SchedulerService,
    SchedulerRepository,
    SchedulerLockRepository,
    SchedulerCoordinatorService,
  ],
  exports: [
    SchedulerService,
    SchedulerCoordinatorService,
  ],
})
export class SchedulerModule {}