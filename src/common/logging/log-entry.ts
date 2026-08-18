export type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;

  requestId?: string;
  runId?: string;
  subscriptionId?: string;

  instanceId: string;

  durationMs?: number;

  result?: string;
  errorCode?: string;
}