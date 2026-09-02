import { RiskLevel, RiskScoreBreakdown, RiskWeights, VoiceAnalysisSignals } from '../types';
import { DEFAULT_RISK_WEIGHTS, RISK_BANDS } from '../utils/constants';

export class RiskEngine {
  public static calculateRisk(
    signals: VoiceAnalysisSignals,
    weights: RiskWeights = DEFAULT_RISK_WEIGHTS
  ): RiskScoreBreakdown {
    // Standardize total weights to ensure 100% normalized computation
    const totalWeight =
      weights.syntheticVoice +
      weights.speakerMismatch +
      weights.livenessRisk +
      weights.callContext +
      weights.transactionRisk;

    const normSyntheticW = (weights.syntheticVoice / (totalWeight || 100));
    const normSpeakerW = (weights.speakerMismatch / (totalWeight || 100));
    const normLivenessW = (weights.livenessRisk / (totalWeight || 100));
    const normContextW = (weights.callContext / (totalWeight || 100));
    const normTxW = (weights.transactionRisk / (totalWeight || 100));

    // Convert consistency and liveness to risk vectors
    const speakerMismatchRisk = Math.max(0, 100 - signals.speakerConsistency);
    const livenessRisk = Math.max(0, 100 - signals.livenessScore);

    // Compute weighted risk points
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
}
