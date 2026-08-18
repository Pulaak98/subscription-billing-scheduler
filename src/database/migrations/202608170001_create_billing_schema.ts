import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);

  // subscriptions
  await sql`
    CREATE TABLE subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      customer_reference VARCHAR(100) NOT NULL,
      description VARCHAR(255) NOT NULL,

      status VARCHAR(20) NOT NULL DEFAULT 'active',
      billing_state VARCHAR(20) NOT NULL DEFAULT 'ready',

      currency CHAR(3) NOT NULL,
      amount NUMERIC(19, 4) NOT NULL,

      start_date DATE NOT NULL,
      next_billing_date DATE NOT NULL,

      billing_anchor_day SMALLINT NOT NULL,
      anchor_is_month_end BOOLEAN NOT NULL,

      billing_failure_count INTEGER NOT NULL DEFAULT 0,
      billing_retry_at TIMESTAMPTZ,

      last_billing_error_code VARCHAR(80),
      last_billing_error_message VARCHAR(500),

      processing_run_id UUID,
      processing_owner VARCHAR(120),
      processing_started_at TIMESTAMPTZ,
      processing_expires_at TIMESTAMPTZ,

      version INTEGER NOT NULL DEFAULT 1,

      CONSTRAINT subscriptions_status_check
        CHECK (status IN ('active', 'paused', 'canceled')),

      CONSTRAINT subscriptions_billing_state_check
        CHECK (billing_state IN ('ready', 'retry_wait', 'blocked')),

      CONSTRAINT subscriptions_amount_check
        CHECK (amount > 0),

      CONSTRAINT subscriptions_billing_anchor_day_check
        CHECK (billing_anchor_day BETWEEN 1 AND 31),

      CONSTRAINT subscriptions_failure_count_check
        CHECK (billing_failure_count >= 0),

      CONSTRAINT subscriptions_version_check
        CHECK (version >= 1)
    )
  `.execute(db);

  // scheduler_runs
  await sql`
    CREATE TABLE scheduler_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      job_name VARCHAR(100) NOT NULL,

      trigger_type VARCHAR(20) NOT NULL,

      triggered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      cutoff_date DATE NOT NULL,

      status VARCHAR(40) NOT NULL,

      instance_id VARCHAR(120) NOT NULL,

      lease_owner_token VARCHAR(160),

      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      last_heartbeat_at TIMESTAMPTZ,

      eligible_count INTEGER NOT NULL DEFAULT 0,
      claimed_count INTEGER NOT NULL DEFAULT 0,
      succeeded_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      skipped_count INTEGER NOT NULL DEFAULT 0,
      invoices_created_count INTEGER NOT NULL DEFAULT 0,

      error_code VARCHAR(80),
      error_message VARCHAR(500),

      CONSTRAINT scheduler_runs_trigger_type_check
        CHECK (trigger_type IN ('scheduled', 'manual')),

      CONSTRAINT scheduler_runs_eligible_count_check
        CHECK (eligible_count >= 0),

      CONSTRAINT scheduler_runs_claimed_count_check
        CHECK (claimed_count >= 0),

      CONSTRAINT scheduler_runs_succeeded_count_check
        CHECK (succeeded_count >= 0),

      CONSTRAINT scheduler_runs_failed_count_check
        CHECK (failed_count >= 0),

      CONSTRAINT scheduler_runs_skipped_count_check
        CHECK (skipped_count >= 0),

      CONSTRAINT scheduler_runs_invoices_count_check
        CHECK (invoices_created_count >= 0)
    )
  `.execute(db);

  // invoices
  await sql`
    CREATE TABLE invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      invoice_number VARCHAR(40) NOT NULL UNIQUE,

      subscription_id UUID NOT NULL,

      customer_reference VARCHAR(100) NOT NULL,

      billing_period_start DATE NOT NULL,
      billing_period_end DATE NOT NULL,

      issue_date DATE NOT NULL,

      status VARCHAR(20) NOT NULL DEFAULT 'issued',

      currency CHAR(3) NOT NULL,

      subtotal NUMERIC(19, 4) NOT NULL,
      tax_total NUMERIC(19, 4) NOT NULL DEFAULT 0,
      discount_total NUMERIC(19, 4) NOT NULL DEFAULT 0,
      total NUMERIC(19, 4) NOT NULL,

      idempotency_key VARCHAR(180) NOT NULL UNIQUE,

      generated_by_run_id UUID NOT NULL,

      CONSTRAINT invoices_status_check
        CHECK (status = 'issued'),

      CONSTRAINT invoices_subtotal_check
        CHECK (subtotal >= 0),

      CONSTRAINT invoices_tax_total_check
        CHECK (tax_total >= 0),

      CONSTRAINT invoices_discount_total_check
        CHECK (discount_total >= 0),

      CONSTRAINT invoices_total_check
        CHECK (total >= 0),

      CONSTRAINT invoices_subscription_fk
        FOREIGN KEY (subscription_id)
        REFERENCES subscriptions(id),

      CONSTRAINT invoices_run_fk
        FOREIGN KEY (generated_by_run_id)
        REFERENCES scheduler_runs(id),

      CONSTRAINT invoices_period_uniq
        UNIQUE (
          subscription_id,
          billing_period_start,
          billing_period_end
        )
    )
  `.execute(db);

  // invoice_items
  await sql`
    CREATE TABLE invoice_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      invoice_id UUID NOT NULL,

      description VARCHAR(255) NOT NULL,

      quantity NUMERIC(12, 4) NOT NULL DEFAULT 1,

      unit_price NUMERIC(19, 4) NOT NULL,

      line_total NUMERIC(19, 4) NOT NULL,

      CONSTRAINT invoice_items_invoice_fk
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE,

      CONSTRAINT invoice_items_quantity_check
        CHECK (quantity > 0)
    )
  `.execute(db);

  // scheduler_run_items
  await sql`
    CREATE TABLE scheduler_run_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      run_id UUID NOT NULL,

      subscription_id UUID NOT NULL,

      result VARCHAR(30) NOT NULL,

      before_billing_date DATE NOT NULL,

      after_billing_date DATE,

      invoices_created INTEGER NOT NULL DEFAULT 0,

      error_type VARCHAR(30),

      error_code VARCHAR(80),

      error_message VARCHAR(500),

      started_at TIMESTAMPTZ NOT NULL,

      completed_at TIMESTAMPTZ NOT NULL,

      CONSTRAINT run_items_run_fk
        FOREIGN KEY (run_id)
        REFERENCES scheduler_runs(id)
        ON DELETE CASCADE,

      CONSTRAINT run_items_subscription_fk
        FOREIGN KEY (subscription_id)
        REFERENCES subscriptions(id),

      CONSTRAINT run_items_result_check
        CHECK (
          result IN (
            'success',
            'failed',
            'duplicate_confirmed',
            'skipped'
          )
        ),

      CONSTRAINT run_items_error_type_check
        CHECK (
          error_type IS NULL
          OR error_type IN ('transient', 'permanent')
        ),

      CONSTRAINT run_items_invoices_created_check
        CHECK (invoices_created >= 0)
    )
  `.execute(db);

  // scheduler_locks
  await sql`
    CREATE TABLE scheduler_locks (
      lock_name VARCHAR(100) PRIMARY KEY,

      owner_token VARCHAR(160) NOT NULL,

      acquired_at TIMESTAMPTZ NOT NULL,

      lease_expires_at TIMESTAMPTZ NOT NULL,

      heartbeat_at TIMESTAMPTZ NOT NULL,

      version INTEGER NOT NULL DEFAULT 1,

      CONSTRAINT scheduler_locks_version_check
        CHECK (version >= 1)
    )
  `.execute(db);

  // Add the subscription -> scheduler run relationship
  await sql`
    ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_processing_run_fk
    FOREIGN KEY (processing_run_id)
    REFERENCES scheduler_runs(id)
  `.execute(db);

  // Required indexes
  await sql`
    CREATE INDEX subscriptions_due_idx
    ON subscriptions (
      status,
      billing_state,
      next_billing_date,
      billing_retry_at,
      id
    )
  `.execute(db);

  await sql`
    CREATE INDEX subscriptions_claim_expiry_idx
    ON subscriptions (processing_expires_at)
    WHERE processing_run_id IS NOT NULL
  `.execute(db);

  await sql`
    CREATE INDEX invoices_customer_date_idx
    ON invoices (
      customer_reference,
      issue_date
    )
  `.execute(db);

  await sql`
    CREATE INDEX run_items_run_result_idx
    ON scheduler_run_items (
      run_id,
      result
    )
  `.execute(db);

  await sql`
    CREATE INDEX runs_job_time_idx
    ON scheduler_runs (
      job_name,
      triggered_at
    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    DROP TABLE IF EXISTS scheduler_run_items
  `.execute(db);

  await sql`
    DROP TABLE IF EXISTS invoice_items
  `.execute(db);

  await sql`
    DROP TABLE IF EXISTS invoices
  `.execute(db);

  await sql`
    DROP TABLE IF EXISTS scheduler_locks
  `.execute(db);

  await sql`
    DROP TABLE IF EXISTS subscriptions
  `.execute(db);

  await sql`
    DROP TABLE IF EXISTS scheduler_runs
  `.execute(db);

  await sql`
    DROP EXTENSION IF EXISTS pgcrypto
  `.execute(db);
}