import { randomUUID } from 'node:crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

const CORRELATION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createCorrelationId(): string {
  return randomUUID();
}

export function isValidCorrelationId(
  correlationId: string,
): boolean {
  return CORRELATION_ID_PATTERN.test(correlationId);
}