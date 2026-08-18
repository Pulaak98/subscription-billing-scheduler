import {
  BILLING_RETRY_DELAYS_MS,
} from '../subscription/subscription.types';

export function calculateRetryAt(
  now: Date,
  failureCount: number,
): Date {
  const index = Math.min(
    Math.max(failureCount - 1, 0),
    BILLING_RETRY_DELAYS_MS.length - 1,
  );

  return new Date(
    now.getTime() +
      BILLING_RETRY_DELAYS_MS[index],
  );
}