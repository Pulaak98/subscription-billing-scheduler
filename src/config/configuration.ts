export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },

  app: {
    instanceId: process.env.APP_INSTANCE_ID,
  },

  billing: {
    cronEnabled: process.env.BILLING_CRON_ENABLED === 'true',
    cronExpression: process.env.BILLING_CRON_EXPRESSION,
    timezone: process.env.BILLING_TIMEZONE,

    batchSize: Number(process.env.BILLING_BATCH_SIZE),
    concurrency: Number(process.env.BILLING_CONCURRENCY),

    leaseSeconds: Number(process.env.BILLING_LEASE_SECONDS),
    heartbeatSeconds: Number(process.env.BILLING_HEARTBEAT_SECONDS),
    claimSeconds: Number(process.env.BILLING_CLAIM_SECONDS),

    maxRunSeconds: Number(process.env.BILLING_MAX_RUN_SECONDS),
    maxItemsPerRun: Number(process.env.BILLING_MAX_ITEMS_PER_RUN),
    maxCatchUpPeriods: Number(process.env.BILLING_MAX_CATCH_UP_PERIODS),

    runOnStartup: process.env.BILLING_RUN_ON_STARTUP === 'true',
  },
});