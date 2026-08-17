import { describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';

import {
  CORRELATION_ID_HEADER,
  createCorrelationId,
} from './correlation-id';
import { CorrelationContextService } from './correlation-context.service';
import { CorrelationMiddleware } from './correlation.middleware';

describe('CorrelationMiddleware', () => {
  function createRequest(
    correlationId?: string,
  ): Request {
    return {
      header: jest.fn((name: string) => {
        if (
          name.toLowerCase() === CORRELATION_ID_HEADER
        ) {
          return correlationId;
        }

        return undefined;
      }),
      headers: correlationId
        ? {
            [CORRELATION_ID_HEADER]: correlationId,
          }
        : {},
    } as unknown as Request;
  }

  function createResponse(): Response {
    return {
      setHeader: jest.fn(),
    } as unknown as Response;
  }

  function createCorrelationContext(): CorrelationContextService {
    return {
      run: jest.fn(
        (
          correlationId: string,
          callback: () => void,
        ) => {
          callback();
          return undefined;
        },
      ),
      getCorrelationId: jest.fn(),
    } as unknown as CorrelationContextService;
  }

  it('should preserve a valid incoming correlation ID', () => {
    const correlationContext = createCorrelationContext();
    const middleware = new CorrelationMiddleware(
      correlationContext,
    );

    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    const response = createResponse();
    const next: NextFunction = jest.fn();

    middleware.use(request, response, next);

    expect(response.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(correlationContext.run).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      expect.any(Function),
    );

    expect(next).toHaveBeenCalled();
  });

  it('should generate a correlation ID when none is provided', () => {
    const correlationContext = createCorrelationContext();
    const middleware = new CorrelationMiddleware(
      correlationContext,
    );

    const request = createRequest();
    const response = createResponse();
    const next: NextFunction = jest.fn();

    middleware.use(request, response, next);

    expect(response.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      expect.any(String),
    );

    expect(correlationContext.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
    );

    expect(next).toHaveBeenCalled();
  });

  it('should generate a new correlation ID when the incoming ID is invalid', () => {
    const correlationContext = createCorrelationContext();
    const middleware = new CorrelationMiddleware(
      correlationContext,
    );

    const request = createRequest(
      'invalid-correlation-id',
    );
    const response = createResponse();
    const next: NextFunction = jest.fn();

    middleware.use(request, response, next);

    expect(response.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      expect.any(String),
    );

    const setHeaderMock =
      response.setHeader as jest.MockedFunction<
        Response['setHeader']
      >;

    const generatedCorrelationId =
      setHeaderMock.mock.calls[0]?.[1];

    expect(typeof generatedCorrelationId).toBe(
      'string',
    );

    expect(generatedCorrelationId).not.toBe(
      'invalid-correlation-id',
    );

    expect(createCorrelationId).toBeDefined();

    expect(correlationContext.run).toHaveBeenCalledWith(
      generatedCorrelationId as string,
      expect.any(Function),
    );

    expect(next).toHaveBeenCalled();
  });

  it('should store the correlation ID in request headers', () => {
    const correlationContext = createCorrelationContext();
    const middleware = new CorrelationMiddleware(
      correlationContext,
    );

    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    const response = createResponse();
    const next: NextFunction = jest.fn();

    middleware.use(request, response, next);

    const correlationId =
      request.headers[CORRELATION_ID_HEADER];

    expect(correlationId).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('should call next inside the correlation context', () => {
    const correlationContext = createCorrelationContext();
    const middleware = new CorrelationMiddleware(
      correlationContext,
    );

    const request = createRequest(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    const response = createResponse();
    const next: NextFunction = jest.fn();

    middleware.use(request, response, next);

    expect(correlationContext.run).toHaveBeenCalledTimes(
      1,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});