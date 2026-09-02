import { VoiceAnalysisSignals } from '../types';

export interface FileAnalysisResult {
  fileName: string;
  fileSizeBytes: number;
  durationSeconds: number;
  signals: VoiceAnalysisSignals;
  detectedIndicators: {
    spectralAnomaly: boolean;
    prosodicInconsistency: boolean;
    temporalSpeechAnomaly: boolean;
    syntheticArtifactsDetected: boolean;
  };
  isDemoAnalysis: true;
}

export interface IVoiceAnalysisService {
  analyzeAudioFile(file: File): Promise<FileAnalysisResult>;
  verifySpeakerProfile(profileId: string, currentScore: number): Promise<{ similarity: number; matched: boolean }>;
  analyzeLivenessChallenge(targetPhrase: string, userSpokenText?: string): Promise<{ score: number; passed: boolean; details: string }>;
}

export class DemoVoiceAnalysisService implements IVoiceAnalysisService {
  public async analyzeAudioFile(file: File): Promise<FileAnalysisResult> {
    // Simulate AI inference delay (800ms)
    await new Promise((res) => setTimeout(res, 800));

    const fileNameLower = file.name.toLowerCase();
    const isLikelyDeepfake = fileNameLower.includes('clone') || fileNameLower.includes('fake') || fileNameLower.includes('ai') || file.size > 2000000;

    const syntheticProbability = isLikelyDeepfake ? 84 : Math.floor(15 + Math.random() * 15);
    const authenticityConfidence = 100 - syntheticProbability;
    const speakerConsistency = isLikelyDeepfake ? 58 : 94;
    const livenessScore = isLikelyDeepfake ? 62 : 91;

    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      durationSeconds: Math.floor(file.size / 32000) || 12,
      signals: {
        syntheticProbability,
        authenticityConfidence,
        speakerConsistency,
        livenessScore,
        callContextRisk: isLikelyDeepfake ? 65 : 15,
        transactionRisk: isLikelyDeepfake ? 70 : 10,
      },
      detectedIndicators: {
        spectralAnomaly: isLikelyDeepfake,
        prosodicInconsistency: isLikelyDeepfake,
        temporalSpeechAnomaly: isLikelyDeepfake,
        syntheticArtifactsDetected: isLikelyDeepfake,
      },
      isDemoAnalysis: true,
    };
  }

  public async verifySpeakerProfile(profileId: string, currentScore: number): Promise<{ similarity: number; matched: boolean }> {
    await new Promise((res) => setTimeout(res, 400));
    const similarity = Math.max(30, Math.min(99, currentScore));
    return {
      similarity,
      matched: similarity >= 75,
    };
  }

  public async analyzeLivenessChallenge(targetPhrase: string, userSpokenText?: string): Promise<{ score: number; passed: boolean; details: string }> {
    await new Promise((res) => setTimeout(res, 600));

    // Demo liveness verification algorithm
    const passed = true;
    const score = 88;

    return {
      score,
      passed,
      details: `Verification response "${targetPhrase}" matched acoustic & liveness criteria. (Demo Challenge Passed)`,
    };
  }
}

export const voiceAnalysisService = new DemoVoiceAnalysisService();
