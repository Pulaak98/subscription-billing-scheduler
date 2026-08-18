import {
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';

import {
  AppLoggerService,
} from '../logging/app-logger.service';

@Injectable()
export class ShutdownService
  implements OnApplicationShutdown
{
  private shuttingDown = false;

  constructor(
    private readonly logger: AppLoggerService,
  ) {}

  beginShutdown(signal?: string): void {
    if (this.shuttingDown) {
      return;
    }

    this.shuttingDown = true;

    this.logger.info(
      'application.shutdown.started',
      {
        result: signal ?? 'unknown',
      },
    );
  }

  isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  onApplicationShutdown(
    signal?: string,
  ): void {
    this.beginShutdown(signal);

    this.logger.info(
      'application.shutdown.completed',
      {
        result: signal ?? 'unknown',
      },
    );
  }
}