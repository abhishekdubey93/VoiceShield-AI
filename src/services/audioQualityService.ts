import { AudioQualityGrade, VoiceVerificationStatus } from '../types';

export interface AudioQualityResult {
  grade: AudioQualityGrade;
  snrDb: number;
  isSufficientForVerification: boolean;
  recommendedStatus: VoiceVerificationStatus;
  reason?: string;
}

export class AudioQualityService {
  public static evaluateQuality(
    noiseLevel: number = 20, // 0 - 100
    clippingPct: number = 0,
    backgroundNoiseType?: string
  ): AudioQualityResult {
    // Determine quality grade
    let grade: AudioQualityGrade = 'EXCELLENT';
    const snrDb = Math.max(5, Math.round(40 - noiseLevel * 0.35));

    if (noiseLevel > 65 || clippingPct > 15 || backgroundNoiseType === 'TRAFFIC' || backgroundNoiseType === 'WIND') {
      grade = 'UNUSUALLY_POOR';
    } else if (noiseLevel > 45 || backgroundNoiseType === 'COUGHING' || backgroundNoiseType === 'SPEAKERPHONE') {
      grade = 'NOISY';
    } else if (noiseLevel > 30) {
      grade = 'DEGRADED';
    } else if (noiseLevel > 15) {
      grade = 'GOOD';
    }

    const isSufficientForVerification = grade === 'EXCELLENT' || grade === 'GOOD';

    if (!isSufficientForVerification) {
      return {
        grade,
        snrDb,
        isSufficientForVerification: false,
        recommendedStatus: 'INCONCLUSIVE',
        reason: 'Audio quality is insufficient for reliable identity verification due to environmental noise or network compression.',
      };
    }

    return {
      grade,
      snrDb,
      isSufficientForVerification: true,
      recommendedStatus: 'VERIFIED',
    };
  }
}
