export type SchedulerTriggerType =
  | 'scheduled'
  | 'manual';

export type SchedulerRunStatus =
  | 'running'
  | 'completed'
  | 'failed';

export interface CreateSchedulerRunData {
  jobName: string;
  triggerType: SchedulerTriggerType;
  triggeredAt: Date;
  cutoffDate: string;
  instanceId: string;
}

export interface CompleteSchedulerRunData {
  status: SchedulerRunStatus;
  completedAt: Date;
  eligibleCount: number;
  claimedCount: number;
  succeededCount: number;
  failedCount: number;
  skippedCount: number;
  invoicesCreatedCount: number;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface SchedulerRunFilters {
  jobName?: string;
  status?: SchedulerRunStatus;
  limit: number;
  offset: number;
}