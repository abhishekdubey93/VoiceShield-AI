export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type LanguageCode = 'Hindi' | 'English' | 'Bengali' | 'Marathi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Gujarati' | 'Bhojpuri';

export type CallSessionState = 'IDLE' | 'CALL_STARTING' | 'CALL_ACTIVE' | 'CONTINUOUS_ANALYSIS' | 'CALL_ENDED' | 'FINAL_REPORT';

export type CallerType = 'SAVED_CONTACT' | 'UNKNOWN_CONTACT';

export type VoiceVerificationStatus = 'VERIFIED' | 'POSSIBLE_MISMATCH' | 'INCONCLUSIVE' | 'UNVERIFIED';

export type AudioQualityGrade = 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'NOISY' | 'UNUSUALLY_POOR';

export type IntentCategory =
  | 'OTP_REQUEST'
  | 'UPI_PIN_REQUEST'
  | 'ATM_PIN_REQUEST'
  | 'BANK_PASSWORD_REQUEST'
  | 'BANK_ACCOUNT_REQUEST'
  | 'CARD_NUMBER_REQUEST'
  | 'CVV_REQUEST'
  | 'SECURITY_CODE_REQUEST'
  | 'PASSWORD_REQUEST'
  | 'MONEY_TRANSFER_REQUEST'
  | 'CASH_REQUEST'
  | 'PAYMENT_REQUEST'
  | 'REMOTE_ACCESS_REQUEST'
  | 'FINANCIAL_IMPERSONATION'
  | 'URGENT_PAYMENT_REQUEST'
  | 'THREAT'
  | 'EXTORTION'
  | 'SUSPICIOUS_IDENTITY_CLAIM'
  | 'PERSONAL_INFORMATION_REQUEST';

export interface LanguageSegment {
  timestamp: string;
  timeSeconds: number;
  segmentDurationSeconds?: number;
  language: LanguageCode;
  nativeName?: string;
  confidence: number; // 0 - 100
  sampleSnippet?: string;
  detectionModel?: string;
}

export interface VoiceAnalysisSignals {
  syntheticProbability: number;  // 0 - 100
  authenticityConfidence: number; // 0 - 100
  speakerConsistency: number;     // 0 - 100
  livenessScore: number;          // 0 - 100
  callContextRisk: number;        // 0 - 100
  transactionRisk: number;       // 0 - 100
}

export interface RiskWeights {
  syntheticVoice: number;  // Default: 40%
  speakerMismatch: number; // Default: 25%
  livenessRisk: number;   // Default: 15%
  callContext: number;    // Default: 10%
  transactionRisk: number;// Default: 10%
}

export interface RiskScoreBreakdown {
  finalScore: number; // 0 - 100
  level: RiskLevel;
  weightedSynthetic: number;
  weightedSpeaker: number;
  weightedLiveness: number;
  weightedContext: number;
  weightedTransaction: number;
  recommendedAction: string;
  primaryDrivers: string[];
}

export interface StructuredRiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  callerType: CallerType;
  voiceVerification: {
    status: VoiceVerificationStatus;
    confidence: number;
    audioQuality: AudioQualityGrade;
    reason?: string;
  };
  detectedIndicators: IntentCategory[];
  explanation: string;
  primaryDrivers: string[];
  recommendation: string;
  alertRequired: boolean;
  vibrationRecommended: boolean;
  breakdown: RiskScoreBreakdown;
}

export interface TransactionDetails {
  action: 'Normal Conversation' | 'Transfer Money' | 'Change Password' | 'Reset Account' | 'Share OTP' | 'Access Confidential Info';
  amount?: number;
  recipient?: string;
  isNewRecipient?: boolean;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CallContextDetails {
  callerIdStatus: 'VERIFIED' | 'UNVERIFIED' | 'SPOOF_RISK';
  isKnownContact: boolean;
  callerType: CallerType;
  previousInteractions: number;
  callOriginLocation: string;
  deviceTrustScore: number; // 0 - 100
  historicalRiskScore: number; // 0 - 100
}

export interface SecurityActionRecord {
  id: string;
  timestamp: string;
  type: 'MFA_OTP' | 'TRUSTED_CALLBACK' | 'CHALLENGE_VERIFICATION' | 'SUPERVISOR_APPROVAL' | 'TRANSACTION_HOLD' | 'BLOCK_ACTION' | 'CONTINUE';
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'RELEASED' | 'BLOCKED' | 'APPROVED' | 'REJECTED';
  details: string;
  actor: 'System' | 'User' | 'Supervisor';
}

export interface CallRecord {
  id: string;
  callerName: string;
  callerNumber: string;
  avatarUrl?: string;
  startTime: string;
  durationSeconds: number;
  status: 'LIVE' | 'PROTECTED' | 'BLOCKED' | 'COMPLETED' | 'FLAGGED';
  sessionState?: CallSessionState;
  primaryLanguage: string;
  languagesDetected: LanguageSegment[];
  signals: VoiceAnalysisSignals;
  transaction: TransactionDetails;
  context: CallContextDetails;
  riskBreakdown: RiskScoreBreakdown;
  actionsTaken: SecurityActionRecord[];
  incidentTimeline: IncidentEvent[];
  audioQuality: AudioQualityGrade;
  voiceVerificationStatus: VoiceVerificationStatus;
  detectedCategories: IntentCategory[];
}

export interface IncidentEvent {
  timestamp: string;
  timeSeconds: number;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
}

export interface TrustedVoiceProfile {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  status: 'REGISTERED' | 'PENDING' | 'NOT_ENROLLED';
  registeredDate: string;
  sampleCount: number;
  embeddingHash: string; // Simulated voice embedding key
  lastVerifiedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  callId?: string;
  event: string;
  riskScore: number;
  actionTaken: string;
  actor: string;
  status: 'Completed' | 'Failed' | 'Pending' | 'Flagged';
  rawMetadata?: string;
}

export interface PerformanceTelemetry {
  audioPreprocessingMs: number;
  aiInferenceMs: number;
  riskEngineMs: number;
  totalLatencyMs: number;
  targetLatencyMs: number;
  isDemoTelemetry: boolean;
}

export type ScenarioId = 'SAFE_FAMILY_CALL' | 'SUSPICIOUS_AI_VOICE' | 'VOICE_CLONE_SCAM' | 'MULTILINGUAL_CODE_SWITCH' | 'GENUINE_VOICE_SENSITIVE';

export interface DemoScenario {
  id: ScenarioId;
  name: string;
  tagline: string;
  description: string;
  expectedRiskBand: RiskLevel;
  defaultCall: CallRecord;
}
