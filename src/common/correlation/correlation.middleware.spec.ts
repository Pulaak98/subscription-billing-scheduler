import { CorrelationMiddleware } from './correlation.middleware';
import { CorrelationContextService } from './correlation-context.service';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

describe('CorrelationMiddleware', () => {
  function createResponse() {
    return {
      setHeader: jest.fn(),
    };
  }

  it('should preserve an incoming correlation ID', () => {
    const context =
      new CorrelationContextService();

    const middleware =
      new CorrelationMiddleware(context);

    const request = {
      header: jest.fn().mockReturnValue(
        'incoming-correlation-id',
      ),
      headers: {},
    } as any;

    const response = createResponse();

    const next = jest.fn();

    middleware.use(
      request,
      response as any,
      next,
    );

    expect(
      response.setHeader,
    ).toHaveBeenCalledWith(
      'x-correlation-id',
      'incoming-correlation-id',
    );

    expect(
      request.headers['x-correlation-id'],
    ).toBe('incoming-correlation-id');

    expect(next).toHaveBeenCalled();
  });

  it('should generate a correlation ID when none is provided', () => {
    const context =
      new CorrelationContextService();

    const middleware =
      new CorrelationMiddleware(context);

    const request = {
      header: jest.fn().mockReturnValue(undefined),
      headers: {},
    } as any;

    const response = createResponse();

    const next = jest.fn();

    middleware.use(
      request,
      response as any,
      next,
    );

    const correlationId =
      request.headers['x-correlation-id'];

    expect(correlationId).toEqual(
      expect.any(String),
    );

    expect(
      response.setHeader,
    ).toHaveBeenCalledWith(
      'x-correlation-id',
      correlationId,
    );

    expect(next).toHaveBeenCalled();
  });
});