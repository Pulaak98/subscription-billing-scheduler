import { describe, expect, it } from '@jest/globals';

import { envValidationSchema } from '../src/config/env.validation';

describe('environment configuration validation', () => {
  const validEnvironment = {
    DATABASE_URL:
      'postgresql://postgres:postgres@localhost:5432/subscription_billing',

    BILLING_CRON_ENABLED: 'true',
    BILLING_CRON_EXPRESSION: '5 0 * * *',
    BILLING_TIMEZONE: 'UTC',

    BILLING_BATCH_SIZE: '100',
    BILLING_CONCURRENCY: '5',

    BILLING_LEASE_SECONDS: '120',
    BILLING_HEARTBEAT_SECONDS: '30',
    BILLING_CLAIM_SECONDS: '300',

    BILLING_MAX_RUN_SECONDS: '1800',
    BILLING_MAX_ITEMS_PER_RUN: '100000',
    BILLING_MAX_CATCH_UP_PERIODS: '12',

    BILLING_RUN_ON_STARTUP: 'false',
  };

  it('accepts valid configuration', () => {
    const { error, value } =
      envValidationSchema.validate(validEnvironment);

    expect(error).toBeUndefined();
    expect(value.DATABASE_URL).toBe(
      validEnvironment.DATABASE_URL,
    );
  });

  it('rejects missing DATABASE_URL', () => {
    const { DATABASE_URL, ...environment } =
      validEnvironment;

    const { error } =
      envValidationSchema.validate(environment);

    expect(error).toBeDefined();
  });

  it('rejects batch size above 1000', () => {
    const { error } =
      envValidationSchema.validate({
        ...validEnvironment,
        BILLING_BATCH_SIZE: '1001',
      });

    expect(error).toBeDefined();
  });

  it('rejects concurrency above 50', () => {
    const { error } =
      envValidationSchema.validate({
        ...validEnvironment,
        BILLING_CONCURRENCY: '51',
      });

    expect(error).toBeDefined();
  });

  it('rejects heartbeat greater than or equal to lease', () => {
    const { error } =
      envValidationSchema.validate({
        ...validEnvironment,
        BILLING_LEASE_SECONDS: '120',
        BILLING_HEARTBEAT_SECONDS: '120',
      });

    expect(error).toBeDefined();
  });

  it('rejects heartbeat without sufficient lease safety margin', () => {
    const { error } =
      envValidationSchema.validate({
        ...validEnvironment,
        BILLING_LEASE_SECONDS: '120',
        BILLING_HEARTBEAT_SECONDS: '40',
      });

    expect(error).toBeDefined();
  });

  it('accepts heartbeat with sufficient lease safety margin', () => {
    const { error } =
      envValidationSchema.validate({
        ...validEnvironment,
        BILLING_LEASE_SECONDS: '120',
        BILLING_HEARTBEAT_SECONDS: '30',
      });

    expect(error).toBeUndefined();
  });

  it('rejects invalid timezone', () => {
    const { error } =
      envValidationSchema.validate({
        ...validEnvironment,
        BILLING_TIMEZONE: 'Not/A/Timezone',
      });

    expect(error).toBeDefined();
  });
});