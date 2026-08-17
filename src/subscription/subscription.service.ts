import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly repository: SubscriptionRepository,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const startDate = new Date(dto.startDate);
    const nextBillingDate = new Date(dto.nextBillingDate);

    if (nextBillingDate < startDate) {
      throw new BadRequestException(
        'nextBillingDate cannot be before startDate',
      );
    }

    return this.repository.create({
      customerReference: dto.customerReference,
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency,
      startDate: dto.startDate,
      nextBillingDate: dto.nextBillingDate,
      billingAnchorDay: dto.billingAnchorDay,
      anchorIsMonthEnd: dto.anchorIsMonthEnd,
    });
  }

  async findById(id: string) {
    const subscription =
      await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    return subscription;
  }

  async findMany(dto: ListSubscriptionsDto) {
    const offset = (dto.page - 1) * dto.limit;

    return this.repository.findMany(
      dto.customerReference,
      dto.status,
      dto.limit,
      offset,
    );
  }
}