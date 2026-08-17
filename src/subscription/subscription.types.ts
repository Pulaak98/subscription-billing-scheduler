export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'canceled';

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