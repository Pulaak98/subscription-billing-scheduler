import { Generated } from 'kysely';

export interface SubscriptionTable {
  id: Generated<string>;
  customer_reference: string;
  description: string;
  status: 'active' | 'paused' | 'canceled';
  billing_state: 'ready' | 'retry_wait' | 'blocked';
  currency: string;
  amount: string;
  start_date: string;
  next_billing_date: string;
  billing_anchor_day: number;
  anchor_is_month_end: boolean;
  billing_failure_count: number;
  billing_retry_at: Date | null;
  last_billing_error_code: string | null;
  last_billing_error_message: string | null;
  processing_run_id: string | null;
  processing_owner: string | null;
  processing_started_at: Date | null;
  processing_expires_at: Date | null;
  version: number;
}

export interface InvoiceTable {
  id: Generated<string>;
  invoice_number: string;
  subscription_id: string;
  customer_reference: string;
  billing_period_start: string;
  billing_period_end: string;
  issue_date: string;
  status: 'issued';
  currency: string;
  subtotal: string;
  tax_total: string;
  discount_total: string;
  total: string;
  idempotency_key: string;
  generated_by_run_id: string;
}

export interface InvoiceItemTable {
  id: Generated<string>;
  invoice_id: string;
  description: string;
  quantity: string;
  unit_price: string;
  line_total: string;
}

export interface SchedulerRunTable {
  id: Generated<string>;
  job_name: string;
  trigger_type: 'scheduled' | 'manual';
  triggered_at: Date;
  cutoff_date: string;
  status: string;
  instance_id: string;
  lease_owner_token: string | null;
  started_at: Date | null;
  completed_at: Date | null;
  last_heartbeat_at: Date | null;
  eligible_count: number;
  claimed_count: number;
  succeeded_count: number;
  failed_count: number;
  skipped_count: number;
  invoices_created_count: number;
  error_code: string | null;
  error_message: string | null;
}

export interface SchedulerRunItemTable {
  id: Generated<string>;
  run_id: string;
  subscription_id: string;
  result: 'success' | 'failed' | 'duplicate_confirmed' | 'skipped';
  before_billing_date: string;
  after_billing_date: string | null;
  invoices_created: number;
  error_type: 'transient' | 'permanent' | null;
  error_code: string | null;
  error_message: string | null;
  started_at: Date;
  completed_at: Date;
}

export interface SchedulerLockTable {
  lock_name: string;
  owner_token: string;
  acquired_at: Date;
  lease_expires_at: Date;
  heartbeat_at: Date;
  version: number;
}

export interface Database {
  subscriptions: SubscriptionTable;
  invoices: InvoiceTable;
  invoice_items: InvoiceItemTable;
  scheduler_runs: SchedulerRunTable;
  scheduler_run_items: SchedulerRunItemTable;
  scheduler_locks: SchedulerLockTable;
}