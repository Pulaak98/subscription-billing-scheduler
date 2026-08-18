import {
  AppLoggerService,
} from '../logging/app-logger.service';

import {
  ShutdownService,
} from './shutdown.service';
import { afterEach, beforeEach,describe, expect, it, jest, } from '@jest/globals';


describe('ShutdownService', () => {
  let service: ShutdownService;
  let logger: {
    info: jest.Mock;
  };

  beforeEach(() => {
    logger = {
      info: jest.fn(),
    };

    service = new ShutdownService(
      logger as unknown as AppLoggerService,
    );
  });

  it('should not be shutting down initially', () => {
    expect(
      service.isShuttingDown(),
    ).toBe(false);
  });

  it('should enter shutting down state', () => {
    service.beginShutdown('SIGINT');

    expect(
      service.isShuttingDown(),
    ).toBe(true);

    expect(logger.info).toHaveBeenCalledWith(
      'application.shutdown.started',
      {
        result: 'SIGINT',
      },
    );
  });

  it('should only start shutdown once', () => {
    service.beginShutdown('SIGINT');
    service.beginShutdown('SIGTERM');

    expect(logger.info).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should respond to application shutdown', () => {
    service.onApplicationShutdown(
      'SIGINT',
    );

    expect(
      service.isShuttingDown(),
    ).toBe(true);

    expect(logger.info).toHaveBeenNthCalledWith(
      1,
      'application.shutdown.started',
      {
        result: 'SIGINT',
      },
    );

    expect(logger.info).toHaveBeenNthCalledWith(
      2,
      'application.shutdown.completed',
      {
        result: 'SIGINT',
      },
    );
  });
});