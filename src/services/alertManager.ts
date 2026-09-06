import { IntentCategory, RiskLevel } from '../types';

export interface AlertNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  detectedCategory?: IntentCategory;
  recommendation: string;
  vibrated: boolean;
}

export class AlertManager {
  private static lastAlertTimestamps: Map<string, number> = new Map();
  private static DEBOUNCE_COOLDOWN_MS = 8000; // 8 seconds cooldown per alert category

  public static canTriggerAlert(categoryKey: string): boolean {
    const lastTime = AlertManager.lastAlertTimestamps.get(categoryKey) || 0;
    const now = Date.now();
    if (now - lastTime < AlertManager.DEBOUNCE_COOLDOWN_MS) {
      return false;
    }
    AlertManager.lastAlertTimestamps.set(categoryKey, now);
    return true;
  }

  public static triggerThreatAlert(params: {
    riskLevel: RiskLevel;
    detectedCategory?: IntentCategory;
    explanation: string;
    recommendation: string;
    vibrationRecommended?: boolean;
  }): AlertNotification | null {
    const { riskLevel, detectedCategory, explanation, recommendation, vibrationRecommended } = params;
    const categoryKey = detectedCategory || riskLevel;

    if (!AlertManager.canTriggerAlert(categoryKey)) {
      return null; // Suppress duplicate alert within cooldown window
    }

    // Vibration feature detection
    let vibrated = false;
    if (vibrationRecommended && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (riskLevel === 'CRITICAL') {
          navigator.vibrate([300, 100, 300, 100, 500]);
        } else {
          navigator.vibrate([200, 100, 200]);
        }
        vibrated = true;
      } catch (err) {
        vibrated = false;
      }
    }

    const title =
      riskLevel === 'CRITICAL'
        ? '🚨 CRITICAL RISK SCAM DETECTED'
        : riskLevel === 'HIGH'
        ? '⚠️ HIGH RISK CALL DETECTED'
        : 'CAUTIONARY CALL NOTICE';

    return {
      id: `alert_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      title,
      message: explanation,
      type: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'danger' : 'warning',
      detectedCategory,
      recommendation,
      vibrated,
    };
  }

  public static clearCooldowns(): void {
    AlertManager.lastAlertTimestamps.clear();
  }
}
