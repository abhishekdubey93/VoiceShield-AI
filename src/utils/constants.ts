import { RiskWeights } from '../types';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  syntheticVoice: 40,
  speakerMismatch: 25,
  livenessRisk: 15,
  callContext: 10,
  transactionRisk: 10,
};

export const RISK_BANDS = {
  LOW: { min: 0, max: 30, label: 'LOW', color: '#10B981', action: 'Continue call monitored' },
  MEDIUM: { min: 31, max: 60, label: 'MEDIUM', color: '#F59E0B', action: 'Show warning & prompt verification' },
  HIGH: { min: 61, max: 80, label: 'HIGH', color: '#F97316', action: 'Require additional verification (MFA / Callback)' },
  CRITICAL: { min: 81, max: 100, label: 'CRITICAL', color: '#EF4444', action: 'Block / Hold sensitive action immediately' },
};

export const SUPPORTED_LANGUAGES = [
  'Hindi',
  'English',
  'Bengali',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Gujarati',
  'Bhojpuri',
];
