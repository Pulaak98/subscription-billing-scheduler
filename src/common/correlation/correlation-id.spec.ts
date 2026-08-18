import {
  createCorrelationId,
} from './correlation-id';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

describe('Correlation ID', () => {
  it('should generate a correlation ID', () => {
    const correlationId = createCorrelationId();

    expect(correlationId).toEqual(
      expect.any(String),
    );

    expect(correlationId.length).toBeGreaterThan(0);
  });

  it('should generate unique correlation IDs', () => {
    const first = createCorrelationId();
    const second = createCorrelationId();

    expect(first).not.toBe(second);
  });
});