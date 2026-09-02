import React from 'react';
import { RiskScoreBreakdown, VoiceAnalysisSignals } from '../../types';
import { Calculator, Cpu, UserCheck, ShieldAlert, PhoneCall, CreditCard } from 'lucide-react';

interface RiskBreakdownProps {
  signals: VoiceAnalysisSignals;
  breakdown: RiskScoreBreakdown;
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ signals, breakdown }) => {
  const items = [
    {
      label: 'Synthetic Voice',
      rawScore: signals.syntheticProbability,
      weighted: breakdown.weightedSynthetic,
      weightPct: '40%',
      icon: Cpu,
      color: 'text-red-400',
    },
    {
      label: 'Speaker Mismatch',
      rawScore: 100 - signals.speakerConsistency,
      weighted: breakdown.weightedSpeaker,
      weightPct: '25%',
      icon: UserCheck,
      color: 'text-amber-400',
    },
    {
      label: 'Liveness Risk',
      rawScore: 100 - signals.livenessScore,
      weighted: breakdown.weightedLiveness,
      weightPct: '15%',
      icon: ShieldAlert,
      color: 'text-orange-400',
    },
    {
      label: 'Call Context Risk',
      rawScore: signals.callContextRisk,
      weighted: breakdown.weightedContext,
      weightPct: '10%',
      icon: PhoneCall,
      color: 'text-blue-400',
    },
    {
      label: 'Transaction Risk',
      rawScore: signals.transactionRisk,
      weighted: breakdown.weightedTransaction,
      weightPct: '10%',
      icon: CreditCard,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Explainable Risk Formula Breakdown
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Final Score = <strong className="text-slate-100">{breakdown.finalScore}</strong> / 100
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {items.map((it, idx) => {
          const IconComp = it.icon;
          return (
            <div key={idx} className="bg-cyber-dark/80 border border-cyber-border p-3 rounded-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <IconComp className={`w-4 h-4 ${it.color}`} />
                <span className="text-[10px] font-mono text-slate-500">{it.weightPct} Weight</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-300 block truncate">{it.label}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs font-mono text-slate-400">{it.rawScore}</span>
                  <span className={`text-sm font-mono font-bold ${it.color}`}>
                    +{it.weighted} pts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border text-xs font-mono flex items-center justify-between text-slate-300">
        <span>Calculation Summary:</span>
        <span className="text-blue-400">
          ({breakdown.weightedSynthetic} + {breakdown.weightedSpeaker} + {breakdown.weightedLiveness} + {breakdown.weightedContext} + {breakdown.weightedTransaction}) = <strong className="text-white text-sm">{breakdown.finalScore}</strong>
        </span>
      </div>
    </div>
  );
};
