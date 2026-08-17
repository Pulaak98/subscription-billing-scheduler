import { validate } from 'class-validator';

import { CreateSubscriptionDto } from './create-subscription.dto';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('CreateSubscriptionDto', () => {
  it('should accept valid data', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject empty customer reference', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: '',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid amount', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: 'invalid',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid start date', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: 'invalid-date',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid next billing date', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: 'invalid-date',
        billingAnchorDay: 31,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject billing anchor day below 1', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 0,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject billing anchor day above 31', async () => {
    const dto = Object.assign(
      new CreateSubscriptionDto(),
      {
        customerReference: 'CUST-1001',
        description: 'Pro Plan',
        amount: '49.0000',
        currency: 'USD',
        startDate: '2026-08-16',
        nextBillingDate: '2026-08-31',
        billingAnchorDay: 32,
        anchorIsMonthEnd: true,
      },
    );

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});