import * as Joi from 'joi';

import { isValidTimezone } from './timezone';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({
      scheme: ['postgres', 'postgresql'],
    })
    .required(),

  APP_INSTANCE_ID: Joi.string()
    .trim()
    .min(1)
    .empty('')
    .default(() => `${process.pid}-${Date.now()}`),

  BILLING_CRON_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  BILLING_CRON_EXPRESSION: Joi.string()
    .trim()
    .pattern(/^\S+(?:\s+\S+){4}$/)
    .default('5 0 * * *'),

  BILLING_TIMEZONE: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (!isValidTimezone(value)) {
        return helpers.error('any.invalid');
      }

      return value;
    })
    .default('UTC'),

  BILLING_BATCH_SIZE: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(100),

  BILLING_CONCURRENCY: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(5),

  BILLING_LEASE_SECONDS: Joi.number()
    .integer()
    .positive()
    .default(120),

  BILLING_HEARTBEAT_SECONDS: Joi.number()
    .integer()
    .positive()
    .default(30),

  BILLING_CLAIM_SECONDS: Joi.number()
    .integer()
    .positive()
    .default(300),

  BILLING_MAX_RUN_SECONDS: Joi.number()
    .integer()
    .positive()
    .default(1800),

  BILLING_MAX_ITEMS_PER_RUN: Joi.number()
    .integer()
    .positive()
    .default(100000),

  BILLING_MAX_CATCH_UP_PERIODS: Joi.number()
    .integer()
    .positive()
    .default(12),

  BILLING_RUN_ON_STARTUP: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
}).custom((value, helpers) => {
  /*
   * Heartbeats should occur at most once per third of the lease duration.
   *
   * Example:
   *   lease = 120s
   *   heartbeat = 30s
   *
   * 30 * 3 = 90 < 120 -> valid
   *
   * A value such as:
   *   lease = 120s
   *   heartbeat = 110s
   *
   * 110 * 3 = 330 >= 120 -> invalid
   */
  if (
    value.BILLING_HEARTBEAT_SECONDS * 3 >=
    value.BILLING_LEASE_SECONDS
  ) {
    return helpers.error('any.invalid');
  }

  return value;
});