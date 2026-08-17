import { CorrelationContextService } from './correlation-context.service';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

describe('CorrelationContextService', () => {
  it('should return the correlation ID inside the context', () => {
    const service =
      new CorrelationContextService();

    service.run(
      'test-correlation-id',
      () => {
        expect(
          service.getCorrelationId(),
        ).toBe('test-correlation-id');
      },
    );
  });

  it('should return undefined outside a context', () => {
    const service =
      new CorrelationContextService();

    expect(
      service.getCorrelationId(),
    ).toBeUndefined();
  });
});