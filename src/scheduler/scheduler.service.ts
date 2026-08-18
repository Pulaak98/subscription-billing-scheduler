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
import { SubscriptionRepository } from '../subscription/subscription.repository';

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
    const run = await this.repository.findById(id);

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
    const run = await this.repository.findById(id);

    if (!run) {
      throw new NotFoundException(
        'Scheduler run not found',
      );
    }

    return this.repository.completeRun(id, data);
  }

  async claimBatch(
    options: ClaimBatchOptions,
  ) {
    return this.subscriptionRepository.claimBatch({
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
}