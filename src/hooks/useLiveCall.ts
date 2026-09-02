import { useState, useEffect, useCallback, useRef } from 'react';
import { CallRecord, LanguageCode, RiskWeights, ScenarioId, SecurityActionRecord, LanguageSegment } from '../types';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { RiskEngine } from '../services/riskEngine';
import { AuditService } from '../services/auditService';
import { StorageService } from '../services/storageService';
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
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const tickCountRef = useRef(0);
  const langIndexRef = useRef(0);

  // Switch Scenario
  const selectScenario = useCallback((id: ScenarioId) => {
    setActiveScenarioId(id);
    const scenario = DEMO_SCENARIOS[id];
    if (scenario) {
      const callCopy = JSON.parse(JSON.stringify(scenario.defaultCall)) as CallRecord;
      callCopy.riskBreakdown = RiskEngine.calculateRisk(callCopy.signals, weights);
      setCurrentCall(callCopy);
      tickCountRef.current = 0;
      langIndexRef.current = 0;
      AuditService.logEvent(
        `Switched demo scenario to: ${scenario.name}`,
        callCopy.riskBreakdown.finalScore,
        'SCENARIO_SWITCH',
        'User',
        'Completed',
        callCopy.id
      );
    }
  }, [weights]);

  // Recalculate risk whenever weights change
  useEffect(() => {
    setCurrentCall((prev) => {
      const updatedBreakdown = RiskEngine.calculateRisk(prev.signals, weights);
      return { ...prev, riskBreakdown: updatedBreakdown };
    });
  }, [weights]);

  // Ticking real-time engine (every 1.5 seconds)
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

        // Automatic Language Switch Detection every 6 ticks (~9 seconds)
        if (tick % 6 === 0 && (activeScenarioId === 'MULTILINGUAL_CODE_SWITCH' || activeScenarioId === 'VOICE_CLONE_SCAM' || activeScenarioId === 'SAFE_FAMILY_CALL')) {
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
              title: `Automatic LID Detected Language Switch: ${currentLastLang} → ${nextLangObj.lang}`,
              description: `Chunk-level acoustic model adapted. Baseline risk unaffected.`,
              severity: 'INFO',
            });

            AuditService.logEvent(
              `Automatic Code-Switch: ${currentLastLang} → ${nextLangObj.lang}`,
              prev.riskBreakdown.finalScore,
              'AUTO_LID_SWITCH',
              'System',
              'Completed',
              prev.id
            );
          }
        }

        // Specific scenario variations
        if (activeScenarioId === 'VOICE_CLONE_SCAM') {
          if (tick === 3) {
            nextSignals.syntheticProbability = Math.min(96, nextSignals.syntheticProbability + 3);
            nextSignals.speakerConsistency = Math.max(48, nextSignals.speakerConsistency - 2);
          } else if (tick === 10) {
            nextSignals.transactionRisk = 92;
            nextTimeline.push({
              timestamp: formatDuration(nextDuration),
              timeSeconds: nextDuration,
              title: '₹75,000 Transfer Requested',
              description: 'Urgent transfer request to new unverified recipient',
              severity: 'CRITICAL',
            });
          }
        }

        // Slight micro-fluctuations for dynamic presentation feel
        const synthNoise = (Math.random() - 0.5) * 2;
        nextSignals.syntheticProbability = Math.min(99, Math.max(5, Math.round(nextSignals.syntheticProbability + synthNoise)));

        const newBreakdown = RiskEngine.calculateRisk(nextSignals, weights);

        // Auto trigger hold if critical risk reached in clone scenario
        const updatedActions = [...prev.actionsTaken];
        if (newBreakdown.finalScore >= 80 && !updatedActions.some((a) => a.type === 'TRANSACTION_HOLD')) {
          const autoHoldAction: SecurityActionRecord = {
            id: `act_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'TRANSACTION_HOLD',
            status: 'BLOCKED',
            details: 'AUTOMATIC HOLD: Risk score crossed 80 (CRITICAL threshold). Sensitive transaction suspended.',
            actor: 'System',
          };
          updatedActions.unshift(autoHoldAction);
          AuditService.logEvent(
            'AUTOMATIC TRANSACTION HOLD TRIGGERED',
            newBreakdown.finalScore,
            'TRANSACTION_HOLD',
            'System',
            'Flagged',
            prev.id
          );
        }

        const updatedCall: CallRecord = {
          ...prev,
          durationSeconds: nextDuration,
          primaryLanguage: nextLanguages[nextLanguages.length - 1]?.language || prev.primaryLanguage,
          signals: nextSignals,
          languagesDetected: nextLanguages,
          incidentTimeline: nextTimeline,
          riskBreakdown: newBreakdown,
          actionsTaken: updatedActions,
        };

        StorageService.addCallRecord(updatedCall);
        return updatedCall;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, activeScenarioId, currentCall.status, weights]);

  // Manual Signal Tweaks
  const updateSignals = useCallback((updates: Partial<CallRecord['signals']>) => {
    setCurrentCall((prev) => {
      const nextSignals = { ...prev.signals, ...updates };
      const nextBreakdown = RiskEngine.calculateRisk(nextSignals, weights);
      return {
        ...prev,
        signals: nextSignals,
        riskBreakdown: nextBreakdown,
      };
    });
  }, [weights]);

  // Manual Transaction Tweaks
  const updateTransaction = useCallback((updates: Partial<CallRecord['transaction']>) => {
    setCurrentCall((prev) => {
      const nextTx = { ...prev.transaction, ...updates };
      let txRisk = 10;
      if (nextTx.action === 'Transfer Money') {
        const amt = nextTx.amount || 0;
        txRisk = amt > 100000 ? 95 : amt > 50000 ? 85 : 65;
      } else if (nextTx.action === 'Share OTP') {
        txRisk = 90;
      } else if (nextTx.action === 'Reset Account' || nextTx.action === 'Change Password') {
        txRisk = 80;
      } else if (nextTx.action === 'Access Confidential Info') {
        txRisk = 75;
      }

      const nextSignals = { ...prev.signals, transactionRisk: txRisk };
      const nextBreakdown = RiskEngine.calculateRisk(nextSignals, weights);

      return {
        ...prev,
        transaction: nextTx,
        signals: nextSignals,
        riskBreakdown: nextBreakdown,
      };
    });
  }, [weights]);

  // Action Handlers
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
      AuditService.logEvent(
        `Action ${action.type}: ${action.details}`,
        prev.riskBreakdown.finalScore,
        action.type,
        action.actor,
        action.status === 'BLOCKED' || action.status === 'FAILED' ? 'Flagged' : 'Completed',
        prev.id
      );
      return updatedCall;
    });
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  return {
    activeScenarioId,
    selectScenario,
    currentCall,
    isSimulating,
    toggleSimulation,
    updateSignals,
    updateTransaction,
    addSecurityAction,
  };
}
