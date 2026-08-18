import { Module } from '@nestjs/common';

import { MonthlyBillingRecurrenceCalculator } from './recurrence/monthly-billing-recurrence.calculator';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionRepository,
    MonthlyBillingRecurrenceCalculator,
  ],
  exports: [
    SubscriptionService,
    SubscriptionRepository,
    MonthlyBillingRecurrenceCalculator,
  ],
})
export class SubscriptionModule {}