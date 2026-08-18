import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsDto } from './dto/list-subscriptions.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly repository: SubscriptionRepository,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    /*
     * PostgreSQL DATE values must remain date-only strings.
     * Never convert these to JavaScript Date objects.
     */
    if (dto.nextBillingDate < dto.startDate) {
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

  async update(
    id: string,
    dto: UpdateSubscriptionDto,
  ) {
    const subscription =
      await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (subscription.status === 'canceled') {
      throw new ConflictException(
        'Canceled subscriptions cannot be edited',
      );
    }

    const startDate =
      dto.startDate ?? subscription.start_date;

    const nextBillingDate =
      dto.nextBillingDate ??
      subscription.next_billing_date;

    if (nextBillingDate < startDate) {
      throw new BadRequestException(
        'nextBillingDate cannot be before startDate',
      );
    }

    if (
      dto.amount === undefined &&
      dto.description === undefined &&
      dto.currency === undefined &&
      dto.startDate === undefined &&
      dto.nextBillingDate === undefined &&
      dto.billingAnchorDay === undefined &&
      dto.anchorIsMonthEnd === undefined
    ) {
      throw new BadRequestException(
        'At least one editable field is required',
      );
    }

    return this.repository.update(id, {
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency,
      startDate: dto.startDate,
      nextBillingDate: dto.nextBillingDate,
      billingAnchorDay: dto.billingAnchorDay,
      anchorIsMonthEnd: dto.anchorIsMonthEnd,
    });
  }

  async pause(id: string) {
    const subscription =
      await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (subscription.status === 'canceled') {
      throw new ConflictException(
        'Canceled subscriptions cannot be paused',
      );
    }

    if (subscription.status === 'paused') {
      throw new ConflictException(
        'Subscription is already paused',
      );
    }

    const updated =
      await this.repository.pause(id);

    if (!updated) {
      throw new ConflictException(
        'Subscription could not be paused',
      );
    }

    return updated;
  }

  async resume(id: string) {
    const subscription =
      await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (subscription.status === 'canceled') {
      throw new ConflictException(
        'Canceled subscriptions cannot be resumed',
      );
    }

    if (subscription.status === 'active') {
      throw new ConflictException(
        'Subscription is already active',
      );
    }

    const updated =
      await this.repository.resume(id);

    if (!updated) {
      throw new ConflictException(
        'Subscription could not be resumed',
      );
    }

    return updated;
  }

  async cancel(id: string) {
    const subscription =
      await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (subscription.status === 'canceled') {
      throw new ConflictException(
        'Subscription is already canceled',
      );
    }

    const updated =
      await this.repository.cancel(id);

    if (!updated) {
      throw new ConflictException(
        'Subscription could not be canceled',
      );
    }

    return updated;
  }

  async billingRetry(id: string) {
    const subscription =
      await this.repository.findById(id);

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (subscription.status === 'canceled') {
      throw new ConflictException(
        'Canceled subscriptions cannot be retried',
      );
    }

    const updated =
      await this.repository.resetBillingFailure(id);

    if (!updated) {
      throw new ConflictException(
        'Billing retry could not be applied',
      );
    }

    return updated;
  }
}