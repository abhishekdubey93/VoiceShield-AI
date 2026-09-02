import { useState, useEffect, useCallback } from 'react';
import { RiskWeights } from '../types';
import { StorageService } from '../services/storageService';
import { DEFAULT_RISK_WEIGHTS } from '../utils/constants';

export function useRiskConfig() {
  const [weights, setWeights] = useState<RiskWeights>(() => StorageService.getRiskWeights());

  useEffect(() => {
    StorageService.saveRiskWeights(weights);
  }, [weights]);

  const updateWeight = useCallback((key: keyof RiskWeights, value: number) => {
    setWeights((prev) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
  }, []);

  const resetWeights = useCallback(() => {
    setWeights(DEFAULT_RISK_WEIGHTS);
  }, []);

  const totalWeight =
    weights.syntheticVoice +
    weights.speakerMismatch +
    weights.livenessRisk +
    weights.callContext +
    weights.transactionRisk;

  return {
    weights,
    updateWeight,
    resetWeights,
    totalWeight,
    isValidTotal: totalWeight === 100,
  };
}
