import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller('api/v1/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Get()
  findMany(@Query() query: ListSubscriptionsDto) {
    return this.subscriptionService.findMany(query);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.subscriptionService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, dto);
  }

  @Post(':id/pause')
  pause(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.subscriptionService.pause(id);
  }

  @Post(':id/resume')
  resume(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.subscriptionService.resume(id);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.subscriptionService.cancel(id);
  }

  @Post(':id/billing-retry')
  billingRetry(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.subscriptionService.billingRetry(id);
  }
}