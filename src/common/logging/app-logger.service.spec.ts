import { CorrelationContextService } from '../correlation/correlation-context.service';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { AppLoggerService } from './app-logger.service';

describe('AppLoggerService', () => {
  let logger: AppLoggerService;
  let correlationContext: CorrelationContextService;
  const configService = {
    getOrThrow: jest.fn(),
  };
  beforeEach(() => {
    correlationContext = new CorrelationContextService();

    configService.getOrThrow.mockReturnValue('test-instance');

    logger = new AppLoggerService(correlationContext, configService as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should emit a structured JSON log', () => {
    const consoleSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.info('test.event', {
      runId: 'run-123',
      subscriptionId: 'subscription-123',
      durationMs: 25,
      result: 'success',
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);

    const output = consoleSpy.mock.calls[0][0];

    const parsed = JSON.parse(output as string);

    expect(parsed).toMatchObject({
      level: 'info',
      event: 'test.event',
      runId: 'run-123',
      subscriptionId: 'subscription-123',
      durationMs: 25,
      result: 'success',
    });

    expect(parsed.timestamp).toEqual(expect.any(String));

    expect(parsed.instanceId).toBe('test-instance');
  });

  it('should include the correlation ID when available', () => {
    const consoleSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    correlationContext.run('request-123', () => {
      logger.info('request.started');
    });

    const output = consoleSpy.mock.calls[0][0];

    const parsed = JSON.parse(output as string);

    expect(parsed.requestId).toBe('request-123');
  });

  it('should omit undefined optional fields', () => {
    const consoleSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.info('simple.event');

    const output = consoleSpy.mock.calls[0][0];

    const parsed = JSON.parse(output as string);

    expect(parsed.runId).toBeUndefined();
    expect(parsed.subscriptionId).toBeUndefined();
    expect(parsed.durationMs).toBeUndefined();
    expect(parsed.result).toBeUndefined();
    expect(parsed.errorCode).toBeUndefined();
  });

  it('should support warning logs', () => {
    const consoleSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    logger.warn('scheduler.lease.unavailable', {
      errorCode: 'SCHEDULER_LEASE_UNAVAILABLE',
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);

    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);

    expect(parsed).toMatchObject({
      level: 'warn',
      event: 'scheduler.lease.unavailable',
      errorCode: 'SCHEDULER_LEASE_UNAVAILABLE',
    });
  });

  it('should support error logs without logging an internal stack', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    logger.error('billing.item.failed', {
      errorCode: 'DATABASE_DEADLOCK',
    });

    const output = consoleSpy.mock.calls[0][0];

    const parsed = JSON.parse(output as string);

    expect(parsed).toMatchObject({
      level: 'error',
      event: 'billing.item.failed',
      errorCode: 'DATABASE_DEADLOCK',
    });

    expect(parsed.stack).toBeUndefined();
  });
});
