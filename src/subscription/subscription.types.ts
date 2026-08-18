export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'canceled';

export type BillingState =
  | 'ready'
  | 'retry_wait'
  | 'blocked';

export const BILLING_MAX_CATCH_UP_PERIODS = 12;

export const BILLING_RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  6 * 60 * 60_000,
] as const;

export interface CreateSubscriptionData {
  customerReference: string;
  description: string;
  amount: string;
  currency: string;
  startDate: string;
  nextBillingDate: string;
  billingAnchorDay: number;
  anchorIsMonthEnd: boolean;
}

export interface UpdateSubscriptionData {
  description?: string;
  amount?: string;
  currency?: string;
  startDate?: string;
  nextBillingDate?: string;
  billingAnchorDay?: number;
  anchorIsMonthEnd?: boolean;
}