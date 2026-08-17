import { validate } from 'class-validator';

import { CreateSubscriptionDto } from './create-subscription.dto';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('CreateSubscriptionDto', () => {
  const createValidDto = (): CreateSubscriptionDto =>
    Object.assign(
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

  it('should accept valid data', async () => {
    const dto = createValidDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject empty customer reference', async () => {
    const dto = createValidDto();

    dto.customerReference = '';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid amount', async () => {
    const dto = createValidDto();

    dto.amount = 'invalid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject amount with more than 4 decimal places', async () => {
    const dto = createValidDto();

    dto.amount = '49.00000';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid start date', async () => {
    const dto = createValidDto();

    dto.startDate = 'invalid-date';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid next billing date', async () => {
    const dto = createValidDto();

    dto.nextBillingDate = 'invalid-date';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject datetime values for date-only fields', async () => {
    const dto = createValidDto();

    dto.startDate = '2026-08-16T00:00:00.000Z';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject billing anchor day below 1', async () => {
    const dto = createValidDto();

    dto.billingAnchorDay = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject billing anchor day above 31', async () => {
    const dto = createValidDto();

    dto.billingAnchorDay = 32;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});