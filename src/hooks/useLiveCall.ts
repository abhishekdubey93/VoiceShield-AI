import { useState, useEffect, useCallback, useRef } from 'react';
import { CallRecord, LanguageCode, RiskWeights, ScenarioId, SecurityActionRecord } from '../types';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { RiskEngine } from '../services/riskEngine';
import { AuditService } from '../services/auditService';
import { StorageService } from '../services/storageService';

export function useLiveCall(weights: RiskWeights) {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('VOICE_CLONE_SCAM');
  const [currentCall, setCurrentCall] = useState<CallRecord>(
    () => DEMO_SCENARIOS.VOICE_CLONE_SCAM.defaultCall
  );
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const tickCountRef = useRef(0);

  // Switch Scenario
  const selectScenario = useCallback((id: ScenarioId) => {
    setActiveScenarioId(id);
    const scenario = DEMO_SCENARIOS[id];
    if (scenario) {
      const callCopy = JSON.parse(JSON.stringify(scenario.defaultCall)) as CallRecord;
      callCopy.riskBreakdown = RiskEngine.calculateRisk(callCopy.signals, weights);
      setCurrentCall(callCopy);
      tickCountRef.current = 0;
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

        // Specific live variations based on scenario
        if (activeScenarioId === 'VOICE_CLONE_SCAM') {
          if (tick === 3) {
            nextSignals.syntheticProbability = Math.min(96, nextSignals.syntheticProbability + 3);
            nextSignals.speakerConsistency = Math.max(48, nextSignals.speakerConsistency - 2);
          } else if (tick === 6) {
            nextLanguages.push({
              timestamp: '00:25',
              timeSeconds: 25,
              language: 'English',
              confidence: 94,
            });
            nextTimeline.push({
              timestamp: '00:25',
              timeSeconds: 25,
              title: 'Language Switched: Hindi → English',
              description: 'Multilingual neural model active. Baseline risk retained.',
              severity: 'INFO',
            });
          } else if (tick === 10) {
            nextSignals.transactionRisk = 92;
            nextTimeline.push({
              timestamp: '00:40',
              timeSeconds: 40,
              title: '₹75,000 Transfer Requested',
              description: 'Urgent transfer request to new unverified recipient',
              severity: 'CRITICAL',
            });
          }
        } else if (activeScenarioId === 'MULTILINGUAL_CODE_SWITCH') {
          if (tick === 4 && nextLanguages.length === 3) {
            nextLanguages.push({
              timestamp: '00:58',
              timeSeconds: 58,
              language: 'Bhojpuri',
              confidence: 89,
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
