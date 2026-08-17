import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
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
}