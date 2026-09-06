import {
  AudioQualityGrade,
  CallContextDetails,
  CallerType,
  CallRecord,
  CallSessionState,
  IntentCategory,
  StructuredRiskResult,
  VoiceAnalysisSignals,
} from '../types';
import { AlertManager, AlertNotification } from './alertManager';
import { AudioQualityService } from './audioQualityService';
import { ConversationAnalysisService } from './conversationAnalysisService';
import { RiskEngine } from './riskEngine';
import { StorageService } from './storageService';

export interface CallSessionCallbacks {
  onStateChange?: (state: CallSessionState) => void;
  onRiskUpdate?: (result: StructuredRiskResult) => void;
  onAlertTriggered?: (alert: AlertNotification) => void;
  onCallEnded?: (finalCallRecord: CallRecord) => void;
}

export class CallSessionProvider {
  private sessionState: CallSessionState = 'IDLE';
  private currentCallRecord: CallRecord | null = null;
  private callbacks: CallSessionCallbacks = {};
  private activeTranscript: string = '';
  private timerIntervalId: any = null;

  constructor(callbacks?: CallSessionCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public getSessionState(): CallSessionState {
    return this.sessionState;
  }

  public getCurrentCall(): CallRecord | null {
    return this.currentCallRecord;
  }

  public startCallSession(initialCall: CallRecord): CallSessionState {
    this.sessionState = 'CALL_STARTING';
    this.currentCallRecord = {
      ...initialCall,
      sessionState: 'CALL_ACTIVE',
      status: 'LIVE',
      durationSeconds: 0,
      detectedCategories: initialCall.detectedCategories || [],
    };

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.sessionState);
    }

    this.sessionState = 'CALL_ACTIVE';
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.sessionState);
    }

    AlertManager.clearCooldowns();
    return this.sessionState;
  }

  public processAudioChunk(params: {
    audioNoiseLevel?: number;
    backgroundNoiseType?: string;
    transcriptSnippet?: string;
    signalsUpdate?: Partial<VoiceAnalysisSignals>;
    contextUpdate?: Partial<CallContextDetails>;
  }): StructuredRiskResult | null {
    if (!this.currentCallRecord || (this.sessionState !== 'CALL_ACTIVE' && this.sessionState !== 'CONTINUOUS_ANALYSIS')) {
      return null;
    }

    this.sessionState = 'CONTINUOUS_ANALYSIS';
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.sessionState);
    }

    // 1. Append transcript if provided
    if (params.transcriptSnippet) {
      this.activeTranscript += ' ' + params.transcriptSnippet;
    }

    // 2. Perform Conversation Intent Analysis
    const intentResult = ConversationAnalysisService.analyzeText(this.activeTranscript);

    // Merge existing and new categories
    const existingCats = new Set(this.currentCallRecord.detectedCategories || []);
    intentResult.detectedCategories.forEach((c) => existingCats.add(c));
    const allCategories = Array.from(existingCats);

    // 3. Audio Quality Evaluation
    const qualityEval = AudioQualityService.evaluateQuality(
      params.audioNoiseLevel ?? 20,
      0,
      params.backgroundNoiseType
    );

    // 4. Update Signals
    const nextSignals: VoiceAnalysisSignals = {
      ...this.currentCallRecord.signals,
      ...(params.signalsUpdate || {}),
    };

    // 5. Update Context
    const nextContext: CallContextDetails = {
      ...this.currentCallRecord.context,
      ...(params.contextUpdate || {}),
    };

    const callerType: CallerType = nextContext.callerType || (nextContext.isKnownContact ? 'SAVED_CONTACT' : 'UNKNOWN_CONTACT');

    // 6. Centralized Risk Calculation
    const structuredRisk = RiskEngine.calculateStructuredRisk({
      callerType,
      signals: nextSignals,
      audioQuality: qualityEval.grade,
      detectedCategories: allCategories,
    });

    // 7. Update Call Record
    this.currentCallRecord = {
      ...this.currentCallRecord,
      signals: nextSignals,
      context: nextContext,
      audioQuality: qualityEval.grade,
      voiceVerificationStatus: structuredRisk.voiceVerification.status,
      detectedCategories: allCategories,
      riskBreakdown: structuredRisk.breakdown,
    };

    // 8. Trigger Debounced Alert if Required
    if (structuredRisk.alertRequired) {
      const topCategory = allCategories[allCategories.length - 1];
      const alert = AlertManager.triggerThreatAlert({
        riskLevel: structuredRisk.riskLevel,
        detectedCategory: topCategory,
        explanation: structuredRisk.explanation,
        recommendation: structuredRisk.recommendation,
        vibrationRecommended: structuredRisk.vibrationRecommended,
      });

      if (alert && this.callbacks.onAlertTriggered) {
        this.callbacks.onAlertTriggered(alert);
      }
    }

    if (this.callbacks.onRiskUpdate) {
      this.callbacks.onRiskUpdate(structuredRisk);
    }

    return structuredRisk;
  }

  public endCallSession(): CallRecord | null {
    if (!this.currentCallRecord) {
      this.sessionState = 'IDLE';
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.sessionState);
      }
      return null;
    }

    this.sessionState = 'CALL_ENDED';
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.sessionState);
    }

    // Stop active audio stream / timers
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    const finalRecord: CallRecord = {
      ...this.currentCallRecord,
      status: this.currentCallRecord.riskBreakdown.finalScore >= 80 ? 'FLAGGED' : 'COMPLETED',
      sessionState: 'FINAL_REPORT',
    };

    // Save final record to local storage / backend audit
    StorageService.addCallRecord(finalRecord);

    if (this.callbacks.onCallEnded) {
      this.callbacks.onCallEnded(finalRecord);
    }

    this.sessionState = 'IDLE';
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.sessionState);
    }

    this.currentCallRecord = null;
    this.activeTranscript = '';
    AlertManager.clearCooldowns();

    return finalRecord;
  }
}
