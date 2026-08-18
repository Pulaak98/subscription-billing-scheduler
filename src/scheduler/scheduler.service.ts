import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CompleteSchedulerRunData,
  CreateSchedulerRunData,
  SchedulerRunFilters,
  ClaimBatchOptions,
} from './scheduler.types';
import { SchedulerRepository } from './scheduler.repository';
import {
  SubscriptionRepository,
  MarkTransientFailureData,
  MarkPermanentFailureData,
  CompleteBillingData,
} from '../subscription/subscription.repository';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly repository: SchedulerRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async createRun(
    data: CreateSchedulerRunData,
  ) {
    return this.repository.createRun(data);
  }

  async findMany(
    filters: SchedulerRunFilters,
  ) {
    return this.repository.findMany(filters);
  }

  async findById(id: string) {
    const run =
      await this.repository.findById(id);

    if (!run) {
      throw new NotFoundException(
        'Scheduler run not found',
      );
    }

    const items =
      await this.repository.findRunItems(id);

    return {
      ...run,
      items,
    };
  }

  async completeRun(
    id: string,
    data: CompleteSchedulerRunData,
  ) {
    const run =
      await this.repository.findById(id);

    if (!run) {
      throw new NotFoundException(
        'Scheduler run not found',
      );
    }

    return this.repository.completeRun(
      id,
      data,
    );
  }

  async claimBatch(
    options: ClaimBatchOptions,
  ) {
    return this.subscriptionRepository
      .claimBatch({
        cutoffDate: options.cutoffDate,
        batchSize: options.batchSize,
        ownerToken: options.ownerToken,
        processingRunId:
          options.processingRunId,
        processingStartedAt:
          options.processingStartedAt,
        processingExpiresAt:
          options.processingExpiresAt,
      });
  }

  async markTransientFailure(
    data: MarkTransientFailureData,
  ) {
    return this.subscriptionRepository
      .markTransientFailure(data);
  }

  async markPermanentFailure(
    data: MarkPermanentFailureData,
  ) {
    return this.subscriptionRepository
      .markPermanentFailure(data);
  }

  async recoverExpiredClaims(
    now: Date,
  ) {
    return this.subscriptionRepository
      .recoverExpiredClaims(now);
  }

  async completeBilling(
    data: CompleteBillingData,
  ) {
    return this.subscriptionRepository
      .completeBilling(data);
  }

  async unblockSubscription(
    id: string,
  ) {
    const subscription =
      await this.subscriptionRepository
        .findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    return this.subscriptionRepository
      .unblock(id);
  }
}