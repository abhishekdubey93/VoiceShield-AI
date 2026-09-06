import {
  AudioQualityGrade,
  CallerType,
  IntentCategory,
  RiskLevel,
  RiskScoreBreakdown,
  RiskWeights,
  StructuredRiskResult,
  VoiceAnalysisSignals,
  VoiceVerificationStatus,
} from '../types';
import { DEFAULT_RISK_WEIGHTS, RISK_BANDS } from '../utils/constants';

export class RiskEngine {
  public static calculateRisk(
    signals: VoiceAnalysisSignals,
    weights: RiskWeights = DEFAULT_RISK_WEIGHTS
  ): RiskScoreBreakdown {
    const totalWeight =
      weights.syntheticVoice +
      weights.speakerMismatch +
      weights.livenessRisk +
      weights.callContext +
      weights.transactionRisk;

    const normSyntheticW = weights.syntheticVoice / (totalWeight || 100);
    const normSpeakerW = weights.speakerMismatch / (totalWeight || 100);
    const normLivenessW = weights.livenessRisk / (totalWeight || 100);
    const normContextW = weights.callContext / (totalWeight || 100);
    const normTxW = weights.transactionRisk / (totalWeight || 100);

    const speakerMismatchRisk = Math.max(0, 100 - signals.speakerConsistency);
    const livenessRisk = Math.max(0, 100 - signals.livenessScore);

    const weightedSynthetic = Math.round(signals.syntheticProbability * normSyntheticW * 100) / 100;
    const weightedSpeaker = Math.round(speakerMismatchRisk * normSpeakerW * 100) / 100;
    const weightedLiveness = Math.round(livenessRisk * normLivenessW * 100) / 100;
    const weightedContext = Math.round(signals.callContextRisk * normContextW * 100) / 100;
    const weightedTransaction = Math.round(signals.transactionRisk * normTxW * 100) / 100;

    const rawScore = weightedSynthetic + weightedSpeaker + weightedLiveness + weightedContext + weightedTransaction;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    let level: RiskLevel = 'LOW';
    let recommendedAction = RISK_BANDS.LOW.action;

    if (finalScore >= RISK_BANDS.CRITICAL.min) {
      level = 'CRITICAL';
      recommendedAction = RISK_BANDS.CRITICAL.action;
    } else if (finalScore >= RISK_BANDS.HIGH.min) {
      level = 'HIGH';
      recommendedAction = RISK_BANDS.HIGH.action;
    } else if (finalScore >= RISK_BANDS.MEDIUM.min) {
      level = 'MEDIUM';
      recommendedAction = RISK_BANDS.MEDIUM.action;
    }

    const primaryDrivers: string[] = [];
    if (signals.syntheticProbability >= 65) {
      primaryDrivers.push(`High synthetic voice probability (${signals.syntheticProbability}%)`);
    }
    if (signals.speakerConsistency <= 65) {
      primaryDrivers.push(`Speaker consistency mismatch (Only ${signals.speakerConsistency}% similarity)`);
    }
    if (signals.livenessScore <= 70) {
      primaryDrivers.push(`Low voice liveness score (${signals.livenessScore}%)`);
    }
    if (signals.transactionRisk >= 60) {
      primaryDrivers.push(`High risk transaction request detected (${signals.transactionRisk}%)`);
    }
    if (signals.callContextRisk >= 60) {
      primaryDrivers.push(`Unusual call origin / unverified Caller ID (${signals.callContextRisk}%)`);
    }

    if (primaryDrivers.length === 0) {
      primaryDrivers.push('Interaction parameters within safe baseline');
    }

    return {
      finalScore,
      level,
      weightedSynthetic,
      weightedSpeaker,
      weightedLiveness,
      weightedContext,
      weightedTransaction,
      recommendedAction,
      primaryDrivers,
    };
  }

  public static calculateStructuredRisk(params: {
    callerType: CallerType;
    signals: VoiceAnalysisSignals;
    audioQuality: AudioQualityGrade;
    detectedCategories: IntentCategory[];
    weights?: RiskWeights;
  }): StructuredRiskResult {
    const { callerType, signals, audioQuality, detectedCategories, weights = DEFAULT_RISK_WEIGHTS } = params;

    // 1. Caller Type Baseline
    // Saved Contact: ~1 - 10 baseline
    // Unknown Contact: ~5 - 30 baseline
    let baseScore = callerType === 'SAVED_CONTACT' ? 4 : 18;

    const primaryDrivers: string[] = [];
    let isAudioInconclusive = false;
    let voiceStatus: VoiceVerificationStatus = 'VERIFIED';
    let voiceConfidence = 88;
    let voiceReason: string | undefined;

    // 2. Audio Quality Evaluation
    if (audioQuality === 'DEGRADED' || audioQuality === 'NOISY' || audioQuality === 'UNUSUALLY_POOR') {
      isAudioInconclusive = true;
      voiceStatus = 'INCONCLUSIVE';
      voiceConfidence = 45;
      voiceReason = 'Audio quality is insufficient for reliable identity verification (high background noise / compression).';
      primaryDrivers.push('Voice verification inconclusive due to ambient noise / audio quality');
    } else {
      if (signals.speakerConsistency < 55) {
        voiceStatus = 'POSSIBLE_MISMATCH';
        voiceConfidence = 78;
        primaryDrivers.push(`Possible voice profile mismatch (Similarity ${signals.speakerConsistency}%)`);
      } else {
        voiceStatus = 'VERIFIED';
        voiceConfidence = Math.min(99, signals.speakerConsistency + 10);
      }
    }

    // 3. Synthetic Probability Impact
    if (signals.syntheticProbability > 65) {
      baseScore += Math.round((signals.syntheticProbability - 50) * 0.5);
      primaryDrivers.push(`Elevated synthetic voice indicator (${signals.syntheticProbability}%)`);
    }

    // 4. Voice Mismatch Impact (ONLY if audio quality is good!)
    if (!isAudioInconclusive && voiceStatus === 'POSSIBLE_MISMATCH') {
      baseScore += 20;
    }

    // 5. Intent Category Escalation
    const criticalIntents: IntentCategory[] = [
      'OTP_REQUEST',
      'UPI_PIN_REQUEST',
      'ATM_PIN_REQUEST',
      'BANK_PASSWORD_REQUEST',
      'CVV_REQUEST',
      'REMOTE_ACCESS_REQUEST',
      'URGENT_PAYMENT_REQUEST',
      'THREAT',
      'EXTORTION',
    ];

    const highIntents: IntentCategory[] = [
      'MONEY_TRANSFER_REQUEST',
      'BANK_ACCOUNT_REQUEST',
      'CARD_NUMBER_REQUEST',
      'FINANCIAL_IMPERSONATION',
      'SECURITY_CODE_REQUEST',
    ];

    const mediumIntents: IntentCategory[] = [
      'PERSONAL_INFORMATION_REQUEST',
      'SUSPICIOUS_IDENTITY_CLAIM',
      'PAYMENT_REQUEST',
      'CASH_REQUEST',
    ];

    let maxIntentScore = 0;
    for (const cat of detectedCategories) {
      if (criticalIntents.includes(cat)) {
        maxIntentScore = Math.max(maxIntentScore, 75);
        primaryDrivers.push(`Critical security request detected: ${cat.replace(/_/g, ' ')}`);
      } else if (highIntents.includes(cat)) {
        maxIntentScore = Math.max(maxIntentScore, 55);
        primaryDrivers.push(`High risk financial request detected: ${cat.replace(/_/g, ' ')}`);
      } else if (mediumIntents.includes(cat)) {
        maxIntentScore = Math.max(maxIntentScore, 25);
        primaryDrivers.push(`Suspicious info request: ${cat.replace(/_/g, ' ')}`);
      }
    }

    // If multiple critical indicators occur together, escalate score to 90 - 100
    let finalScore = Math.max(baseScore, maxIntentScore + baseScore * 0.3);

    if (detectedCategories.some((c) => criticalIntents.includes(c)) && (voiceStatus === 'POSSIBLE_MISMATCH' || signals.syntheticProbability > 70)) {
      finalScore = Math.max(finalScore, 92);
    }

    if (detectedCategories.includes('OTP_REQUEST') || detectedCategories.includes('URGENT_PAYMENT_REQUEST')) {
      finalScore = Math.max(finalScore, 88);
    }

    finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

    let riskLevel: RiskLevel = 'LOW';
    let recommendation = 'Interaction parameters within safe baseline. Continue call.';
    let alertRequired = false;
    let vibrationRecommended = false;

    if (finalScore >= 81) {
      riskLevel = 'CRITICAL';
      recommendation = 'DO NOT SHARE OTP OR TRANSFER FUNDS. Verify the caller through an independent trusted channel.';
      alertRequired = true;
      vibrationRecommended = true;
    } else if (finalScore >= 61) {
      riskLevel = 'HIGH';
      recommendation = 'Sensitive information request detected. Request step-up MFA or perform out-of-band callback.';
      alertRequired = true;
      vibrationRecommended = true;
    } else if (finalScore >= 31) {
      riskLevel = 'MEDIUM';
      recommendation = 'Caution: Potential suspicious financial or personal inquiry. Do not share confidential codes.';
      alertRequired = false;
      vibrationRecommended = false;
    }

    if (primaryDrivers.length === 0) {
      primaryDrivers.push(
        callerType === 'SAVED_CONTACT'
          ? 'Saved contact with safe conversation parameters'
          : 'Unknown contact baseline with safe conversation'
      );
    }

    const breakdown = RiskEngine.calculateRisk(signals, weights);
    breakdown.finalScore = finalScore;
    breakdown.level = riskLevel;

    return {
      riskScore: finalScore,
      riskLevel,
      confidence: 0.94,
      callerType,
      voiceVerification: {
        status: voiceStatus,
        confidence: voiceConfidence,
        audioQuality,
        reason: voiceReason,
      },
      detectedIndicators: detectedCategories,
      explanation: primaryDrivers.join('. '),
      primaryDrivers,
      recommendation,
      alertRequired,
      vibrationRecommended,
      breakdown,
    };
  }
}
