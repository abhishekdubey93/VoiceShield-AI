import { AuditLogEntry, CallRecord, RiskWeights, TrustedVoiceProfile } from '../types';
import { DEFAULT_RISK_WEIGHTS } from '../utils/constants';
import { INITIAL_CALL_HISTORY } from '../data/mockCalls';
import { INITIAL_TRUSTED_PROFILES } from '../data/mockProfiles';

const KEYS = {
  CALL_HISTORY: 'voiceshield_call_history',
  TRUSTED_PROFILES: 'voiceshield_trusted_profiles',
  AUDIT_LOGS: 'voiceshield_audit_logs',
  RISK_WEIGHTS: 'voiceshield_risk_weights',
  ACTIVE_SCENARIO: 'voiceshield_active_scenario',
};

export class StorageService {
  public static getCallHistory(): CallRecord[] {
    try {
      const data = localStorage.getItem(KEYS.CALL_HISTORY);
      return data ? JSON.parse(data) : INITIAL_CALL_HISTORY;
    } catch {
      return INITIAL_CALL_HISTORY;
    }
  }

  public static saveCallHistory(calls: CallRecord[]): void {
    try {
      localStorage.setItem(KEYS.CALL_HISTORY, JSON.stringify(calls));
    } catch (e) {
      console.error('Failed to save call history to LocalStorage:', e);
    }
  }

  public static addCallRecord(call: CallRecord): void {
    const history = this.getCallHistory();
    const existingIndex = history.findIndex((c) => c.id === call.id);
    if (existingIndex >= 0) {
      history[existingIndex] = call;
    } else {
      history.unshift(call);
    }
    this.saveCallHistory(history);
  }

  public static getTrustedProfiles(): TrustedVoiceProfile[] {
    try {
      const data = localStorage.getItem(KEYS.TRUSTED_PROFILES);
      return data ? JSON.parse(data) : INITIAL_TRUSTED_PROFILES;
    } catch {
      return INITIAL_TRUSTED_PROFILES;
    }
  }

  public static saveTrustedProfiles(profiles: TrustedVoiceProfile[]): void {
    try {
      localStorage.setItem(KEYS.TRUSTED_PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save profiles to LocalStorage:', e);
    }
  }

  public static getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      if (data) return JSON.parse(data);
      
      // Default seed logs
      const defaultLogs: AuditLogEntry[] = [
        {
          id: 'log_seed_1',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          event: 'Synthetic voice threshold exceeded (92%)',
          riskScore: 92,
          actionTaken: 'TRANSACTION_HOLD',
          actor: 'System',
          status: 'Completed',
          rawMetadata: 'Scenario: VOICE_CLONE_SCAM',
        },
        {
          id: 'log_seed_2',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          event: 'Multilingual switch detected (Hindi → English)',
          riskScore: 18,
          actionTaken: 'CONTINUE',
          actor: 'System',
          status: 'Completed',
        },
        {
          id: 'log_seed_3',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          event: 'Supervisor rejected high-risk transfer attempt',
          riskScore: 91,
          actionTaken: 'SUPERVISOR_APPROVAL',
          actor: 'Supervisor',
          status: 'Flagged',
        },
      ];
      return defaultLogs;
    } catch {
      return [];
    }
  }

  public static saveAuditLogs(logs: AuditLogEntry[]): void {
    try {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save audit logs:', e);
    }
  }

  public static addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    this.saveAuditLogs(logs);
    return newEntry;
  }

  public static getRiskWeights(): RiskWeights {
    try {
      const data = localStorage.getItem(KEYS.RISK_WEIGHTS);
      return data ? JSON.parse(data) : DEFAULT_RISK_WEIGHTS;
    } catch {
      return DEFAULT_RISK_WEIGHTS;
    }
  }

  public static saveRiskWeights(weights: RiskWeights): void {
    try {
      localStorage.setItem(KEYS.RISK_WEIGHTS, JSON.stringify(weights));
    } catch (e) {
      console.error('Failed to save risk weights:', e);
    }
  }

  public static resetDemoData(): void {
    localStorage.removeItem(KEYS.CALL_HISTORY);
    localStorage.removeItem(KEYS.TRUSTED_PROFILES);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    localStorage.removeItem(KEYS.RISK_WEIGHTS);
    localStorage.removeItem(KEYS.ACTIVE_SCENARIO);
  }
}
