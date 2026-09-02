import React from 'react';
import { CallRecord, RiskWeights } from '../types';
import { RiskBreakdown } from '../components/risk/RiskBreakdown';
import { RiskWeightSliders } from '../components/risk/RiskWeightSliders';
import { RiskMeter } from '../components/common/RiskMeter';
import { Gauge, ShieldAlert, Cpu, UserCheck, CreditCard, CheckCircle, Info } from 'lucide-react';
import { RISK_BANDS } from '../utils/constants';

interface RiskAnalysisPageProps {
  currentCall: CallRecord;
  weights: RiskWeights;
  onUpdateWeight: (key: keyof RiskWeights, value: number) => void;
  onResetWeights: () => void;
  totalWeight: number;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({
  currentCall,
  weights,
  onUpdateWeight,
  onResetWeights,
  totalWeight,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" /> Dynamic Risk Engine & Sensitivity Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configurable multi-vector weighted formula calculation: Synthetic + Speaker + Liveness + Context + Transaction
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
          <span>Active Risk Score: {currentCall.riskBreakdown.finalScore} / 100</span>
        </div>
      </div>

      {/* Main Formula Breakdown */}
      <RiskBreakdown signals={currentCall.signals} breakdown={currentCall.riskBreakdown} />

      {/* Configurable Sliders */}
      <RiskWeightSliders
        weights={weights}
        onUpdateWeight={onUpdateWeight}
        onReset={onResetWeights}
        totalWeight={totalWeight}
      />

      {/* Risk Bands Legend & Action Thresholds */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          FOUR-TIER RISK LEVEL ACTION BAND MAP
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-emerald-400">
              <span>0–30: LOW</span>
              <span>GREEN BAND</span>
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Action: Continue Call</span>
            <p className="text-[10px] text-slate-400">Routine monitoring active. No protective intervention required.</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-amber-400">
              <span>31–60: MEDIUM</span>
              <span>AMBER BAND</span>
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Action: Show Warning</span>
            <p className="text-[10px] text-slate-400">Prompt step-up identity check or caution operator.</p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-orange-400">
              <span>61–80: HIGH</span>
              <span>ORANGE BAND</span>
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Action: Require Verification</span>
            <p className="text-[10px] text-slate-400">Enforce step-up MFA or out-of-band trusted callback.</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-red-400">
              <span>81–100: CRITICAL</span>
              <span>RED BAND</span>
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Action: Block / Hold Action</span>
            <p className="text-[10px] text-slate-400">Automatic hold on high-risk transfers and sensitive OTPs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
