import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { AuditService } from '../services/auditService';
import { CallSessionProvider } from '../services/callSessionProvider';
import { RiskEngine } from '../services/riskEngine';
import { StorageService } from '../services/storageService';
import {
  CallRecord,
  CallSessionState,
  IntentCategory,
  LanguageCode,
  LanguageSegment,
  RiskWeights,
  ScenarioId,
  SecurityActionRecord,
  StructuredRiskResult,
} from '../types';
import { formatDuration } from '../utils/formatters';

const AUTOMATIC_LANGUAGE_SEQUENCE: { lang: LanguageCode; native: string; snippet: string }[] = [
  { lang: 'Hindi', native: 'हिंदी', snippet: 'सुनो भैया, बहुत जरूरी काम है।' },
  { lang: 'English', native: 'English', snippet: 'I am transferring the money to the account now.' },
  { lang: 'Hindi', native: 'हिंदी', snippet: 'हाँ, तुरंत कन्फर्म करो।' },
  { lang: 'Bhojpuri', native: 'भोजपुरी', snippet: 'हमरा के तनी मदद चाही रहे।' },
  { lang: 'Marathi', native: 'मराठी', snippet: 'हो, काम लवकर पूर्ण करा.' },
  { lang: 'Tamil', native: 'தமிழ்', snippet: 'சரி, நான் உடனே சரிபார்க்கிறேன்.' },
];

export function useLiveCall(weights: RiskWeights) {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('MULTILINGUAL_CODE_SWITCH');
  const [currentCall, setCurrentCall] = useState<CallRecord>(
    () => DEMO_SCENARIOS.MULTILINGUAL_CODE_SWITCH.defaultCall
  );
  const [sessionState, setSessionState] = useState<CallSessionState>('CALL_ACTIVE');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const tickCountRef = useRef(0);
  const langIndexRef = useRef(0);

  // Switch Scenario
  const selectScenario = useCallback(
    (id: ScenarioId) => {
      setActiveScenarioId(id);
      const scenario = DEMO_SCENARIOS[id];
      if (scenario) {
        const callCopy = JSON.parse(JSON.stringify(scenario.defaultCall)) as CallRecord;
        const callerType = callCopy.context.callerType || (callCopy.context.isKnownContact ? 'SAVED_CONTACT' : 'UNKNOWN_CONTACT');

        const structured = RiskEngine.calculateStructuredRisk({
          callerType,
          signals: callCopy.signals,
          audioQuality: callCopy.audioQuality || 'EXCELLENT',
          detectedCategories: callCopy.detectedCategories || [],
          weights,
        });

        callCopy.riskBreakdown = structured.breakdown;
        callCopy.voiceVerificationStatus = structured.voiceVerification.status;
        callCopy.sessionState = 'CALL_ACTIVE';

        setCurrentCall(callCopy);
        setSessionState('CALL_ACTIVE');
        tickCountRef.current = 0;
        langIndexRef.current = 0;

        AuditService.logEvent(
          `Switched protection scenario to: ${scenario.name}`,
          structured.riskScore,
          'SCENARIO_SWITCH',
          'User',
          'Completed',
          callCopy.id
        );
      }
    },
    [weights]
  );

  // Ticking real-time session engine
  useEffect(() => {
    if (!isSimulating || currentCall.status === 'COMPLETED' || currentCall.status === 'BLOCKED') {
      return;
    }

    const interval = setInterval(() => {
      tickCountRef.current += 1;
      const tick = tickCountRef.current;

      setCurrentCall((prev) => {
        const nextDuration = prev.durationSeconds + 1;
        let nextSignals = { ...prev.signals };
        let nextLanguages = [...prev.languagesDetected];
        const nextTimeline = [...prev.incidentTimeline];
        const nextCategories: IntentCategory[] = [...(prev.detectedCategories || [])];

        // Automatic Language Switch Detection every 6 ticks (~9s)
        if (
          tick % 6 === 0 &&
          (activeScenarioId === 'MULTILINGUAL_CODE_SWITCH' ||
            activeScenarioId === 'VOICE_CLONE_SCAM' ||
            activeScenarioId === 'SAFE_FAMILY_CALL')
        ) {
          langIndexRef.current = (langIndexRef.current + 1) % AUTOMATIC_LANGUAGE_SEQUENCE.length;
          const nextLangObj = AUTOMATIC_LANGUAGE_SEQUENCE[langIndexRef.current];
          const currentLastLang = nextLanguages[nextLanguages.length - 1]?.language;

          if (currentLastLang !== nextLangObj.lang) {
            const formattedTime = formatDuration(nextDuration);
            const newSeg: LanguageSegment = {
              timestamp: formattedTime,
              timeSeconds: nextDuration,
              segmentDurationSeconds: 15,
              language: nextLangObj.lang,
              nativeName: nextLangObj.native,
              confidence: Math.floor(92 + Math.random() * 7),
              sampleSnippet: nextLangObj.snippet,
              detectionModel: 'WavLM-LID Neural Chunk v2',
            };

            nextLanguages.push(newSeg);
            nextTimeline.push({
              timestamp: formattedTime,
              timeSeconds: nextDuration,
              title: `LID Language Switch: ${currentLastLang} → ${nextLangObj.lang}`,
              description: `Chunk-level acoustic model adapted. Baseline risk unaffected.`,
              severity: 'INFO',
            });
          }
        }

        // Scenario Intent Escalation
        if (activeScenarioId === 'VOICE_CLONE_SCAM') {
          if (tick === 3) {
            nextSignals.syntheticProbability = Math.min(96, nextSignals.syntheticProbability + 3);
            nextSignals.speakerConsistency = Math.max(48, nextSignals.speakerConsistency - 2);
          } else if (tick === 8 && !nextCategories.includes('MONEY_TRANSFER_REQUEST')) {
            nextCategories.push('MONEY_TRANSFER_REQUEST');
            nextCategories.push('URGENT_PAYMENT_REQUEST');
            nextTimeline.push({
              timestamp: formatDuration(nextDuration),
              timeSeconds: nextDuration,
              title: 'Urgent ₹75,000 Transfer Request',
              description: 'Urgent transfer request to new unverified recipient detected',
              severity: 'CRITICAL',
            });
          }
        }

        // Micro-fluctuations for dynamic spectrum readout
        const synthNoise = (Math.random() - 0.5) * 1.5;
        nextSignals.syntheticProbability = Math.min(
          99,
          Math.max(5, Math.round(nextSignals.syntheticProbability + synthNoise))
        );

        const callerType =
          prev.context.callerType || (prev.context.isKnownContact ? 'SAVED_CONTACT' : 'UNKNOWN_CONTACT');

        const structured = RiskEngine.calculateStructuredRisk({
          callerType,
          signals: nextSignals,
          audioQuality: prev.audioQuality || 'EXCELLENT',
          detectedCategories: nextCategories,
          weights,
        });

        // Trigger automatic hold if critical risk crossed
        const updatedActions = [...prev.actionsTaken];
        if (structured.riskScore >= 80 && !updatedActions.some((a) => a.type === 'TRANSACTION_HOLD')) {
          const autoHoldAction: SecurityActionRecord = {
            id: `act_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'TRANSACTION_HOLD',
            status: 'BLOCKED',
            details: 'AUTOMATIC HOLD: Critical threat threshold crossed. Sensitive transaction suspended.',
            actor: 'System',
          };
          updatedActions.unshift(autoHoldAction);
        }

        const updatedCall: CallRecord = {
          ...prev,
          durationSeconds: nextDuration,
          primaryLanguage: nextLanguages[nextLanguages.length - 1]?.language || prev.primaryLanguage,
          signals: nextSignals,
          languagesDetected: nextLanguages,
          incidentTimeline: nextTimeline,
          detectedCategories: nextCategories,
          riskBreakdown: structured.breakdown,
          voiceVerificationStatus: structured.voiceVerification.status,
          actionsTaken: updatedActions,
          sessionState: 'CONTINUOUS_ANALYSIS',
        };

        StorageService.addCallRecord(updatedCall);
        return updatedCall;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, activeScenarioId, currentCall.status, weights]);

  // Manual Transaction Tweaks
  const updateTransaction = useCallback(
    (updates: Partial<CallRecord['transaction']>) => {
      setCurrentCall((prev) => {
        const nextTx = { ...prev.transaction, ...updates };
        const nextCategories: IntentCategory[] = [...(prev.detectedCategories || [])];

        if (nextTx.action === 'Transfer Money') {
          if (!nextCategories.includes('MONEY_TRANSFER_REQUEST')) nextCategories.push('MONEY_TRANSFER_REQUEST');
        } else if (nextTx.action === 'Share OTP') {
          if (!nextCategories.includes('OTP_REQUEST')) nextCategories.push('OTP_REQUEST');
        } else if (nextTx.action === 'Reset Account' || nextTx.action === 'Change Password') {
          if (!nextCategories.includes('PASSWORD_REQUEST')) nextCategories.push('PASSWORD_REQUEST');
        } else if (nextTx.action === 'Access Confidential Info') {
          if (!nextCategories.includes('PERSONAL_INFORMATION_REQUEST'))
            nextCategories.push('PERSONAL_INFORMATION_REQUEST');
        }

        const callerType =
          prev.context.callerType || (prev.context.isKnownContact ? 'SAVED_CONTACT' : 'UNKNOWN_CONTACT');

        const structured = RiskEngine.calculateStructuredRisk({
          callerType,
          signals: prev.signals,
          audioQuality: prev.audioQuality || 'EXCELLENT',
          detectedCategories: nextCategories,
          weights,
        });

        return {
          ...prev,
          transaction: nextTx,
          detectedCategories: nextCategories,
          riskBreakdown: structured.breakdown,
          voiceVerificationStatus: structured.voiceVerification.status,
        };
      });
    },
    [weights]
  );

  const addSecurityAction = useCallback((action: SecurityActionRecord) => {
    setCurrentCall((prev) => {
      const updatedActions = [action, ...prev.actionsTaken];
      let nextStatus = prev.status;
      if (action.type === 'TRANSACTION_HOLD' && action.status === 'BLOCKED') {
        nextStatus = 'BLOCKED';
      } else if (action.type === 'CHALLENGE_VERIFICATION' && action.status === 'PASSED') {
        nextStatus = 'PROTECTED';
      }

      const updatedCall: CallRecord = {
        ...prev,
        status: nextStatus,
        actionsTaken: updatedActions,
      };
      StorageService.addCallRecord(updatedCall);
      return updatedCall;
    });
  }, []);

  const endSession = useCallback(() => {
    setCurrentCall((prev) => {
      const endedCall: CallRecord = {
        ...prev,
        status: prev.riskBreakdown.finalScore >= 80 ? 'FLAGGED' : 'COMPLETED',
        sessionState: 'FINAL_REPORT',
      };
      StorageService.addCallRecord(endedCall);
      setSessionState('FINAL_REPORT');
      return endedCall;
    });
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  return {
    activeScenarioId,
    selectScenario,
    currentCall,
    sessionState,
    isSimulating,
    toggleSimulation,
    updateTransaction,
    addSecurityAction,
    endSession,
  };
}
