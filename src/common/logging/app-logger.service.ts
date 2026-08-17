import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CorrelationContextService } from '../correlation/correlation-context.service';

import { LogEntry, LogLevel } from './log-entry';

interface LogContext {
  runId?: string;
  subscriptionId?: string;
  durationMs?: number;
  result?: string;
  errorCode?: string;
}

@Injectable()
export class AppLoggerService {
  constructor(
    private readonly correlationContext: CorrelationContextService,
    private readonly configService: ConfigService,
  ) {}

  debug(event: string, context: LogContext = {}): void {
    this.write('debug', event, context);
  }

  info(event: string, context: LogContext = {}): void {
    this.write('info', event, context);
  }

  warn(event: string, context: LogContext = {}): void {
    this.write('warn', event, context);
  }

  error(event: string, context: LogContext = {}): void {
    this.write('error', event, context);
  }

  private write(
    level: LogLevel,
    event: string,
    context: LogContext,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,

      requestId: this.correlationContext.getCorrelationId(),

      runId: context.runId,
      subscriptionId: context.subscriptionId,

      instanceId: this.configService.getOrThrow<string>(
        'app.instanceId',
      ),

      durationMs: context.durationMs,

      result: context.result,
      errorCode: context.errorCode,
    };

    const cleanedEntry = this.removeUndefinedValues(entry);

    const serialized = JSON.stringify(cleanedEntry);

    switch (level) {
      case 'debug':
        console.debug(serialized);
        break;

      case 'info':
        console.info(serialized);
        break;

      case 'warn':
        console.warn(serialized);
        break;

      case 'error':
        console.error(serialized);
        break;
    }
  }

  private removeUndefinedValues(entry: LogEntry): LogEntry {
    return Object.fromEntries(
      Object.entries(entry).filter(([, value]) => value !== undefined),
    ) as LogEntry;
  }
}