export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'canceled';

export type BillingState =
  | 'ready'
  | 'retry_wait'
  | 'blocked';

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