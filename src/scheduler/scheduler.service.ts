import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CompleteSchedulerRunData,
  CreateSchedulerRunData,
  SchedulerRunFilters,
} from './scheduler.types';
import { SchedulerRepository } from './scheduler.repository';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly repository: SchedulerRepository,
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
}