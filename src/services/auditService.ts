import { AuditLogEntry } from '../types';
import { StorageService } from './storageService';

export class AuditService {
  public static logEvent(
    event: string,
    riskScore: number,
    actionTaken: string,
    actor: string = 'System',
    status: 'Completed' | 'Failed' | 'Pending' | 'Flagged' = 'Completed',
    callId?: string,
    rawMetadata?: string
  ): AuditLogEntry {
    return StorageService.addAuditLog({
      event,
      riskScore,
      actionTaken,
      actor,
      status,
      callId,
      rawMetadata,
    });
  }

  public static getLogs(): AuditLogEntry[] {
    return StorageService.getAuditLogs();
  }

  public static exportLogsAsJson(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}
