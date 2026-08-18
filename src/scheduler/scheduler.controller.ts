import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { SchedulerService } from './scheduler.service';

@Controller('scheduler/runs')
export class SchedulerController {
  constructor(
    private readonly service: SchedulerService,
  ) {}

  @Get()
  async findMany(
    @Query('jobName') jobName?: string,
    @Query('status') status?: 'running' | 'completed' | 'failed',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNumber = Math.max(
      Number(page) || 1,
      1,
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100,
    );

    return this.service.findMany({
      jobName,
      status,
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
    });
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
  ) {
    return this.service.findById(id);
  }
}