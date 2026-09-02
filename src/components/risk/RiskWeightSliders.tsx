import React from 'react';
import { RiskWeights } from '../../types';
import { Sliders, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

interface RiskWeightSlidersProps {
  weights: RiskWeights;
  onUpdateWeight: (key: keyof RiskWeights, value: number) => void;
  onReset: () => void;
  totalWeight: number;
}

export const RiskWeightSliders: React.FC<RiskWeightSlidersProps> = ({
  weights,
  onUpdateWeight,
  onReset,
  totalWeight,
}) => {
  const isValid = totalWeight === 100;

  const sliderFields: { key: keyof RiskWeights; label: string; desc: string; color: string }[] = [
    {
      key: 'syntheticVoice',
      label: 'AI / Synthetic Voice Detection',
      desc: 'Weight given to WavLM neural TTS and spectral phase anomalies',
      color: 'accent-red-500',
    },
    {
      key: 'speakerMismatch',
      label: 'Speaker Verification Mismatch',
      desc: 'Weight assigned to voice embedding profile inconsistency',
      color: 'accent-amber-500',
    },
    {
      key: 'livenessRisk',
      label: 'Voice Liveness Deficiency',
      desc: 'Weight assigned to turn-taking timing & prosodic continuous check',
      color: 'accent-orange-500',
    },
    {
      key: 'callContext',
      label: 'Call Context Risk',
      desc: 'Weight for Caller ID spoofing & foreign IP routing flags',
      color: 'accent-blue-500',
    },
    {
      key: 'transactionRisk',
      label: 'Transaction Context Risk',
      desc: 'Weight for sensitive transfer/OTP request intent',
      color: 'accent-purple-500',
    },
  ];

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Dynamic Risk Engine Formula Configurator
            </h3>
            <p className="text-xs text-slate-400">Adjust signal weights to calibrate security sensitivity in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full border ${isValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {isValid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>TOTAL WEIGHT: {totalWeight}%</span>
          </div>
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-cyber-dark rounded border border-cyber-border transition-colors"
            title="Reset to default 40/25/15/10/10 weights"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isValid && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Total weight must sum exactly to 100%. Please adjust sliders accordingly.</span>
        </div>
      )}

      <div className="space-y-4">
        {sliderFields.map((field) => {
          const val = weights[field.key];
          return (
            <div key={field.key} className="space-y-1 bg-cyber-dark/40 p-3 rounded-lg border border-cyber-border">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">{field.label}</span>
                <span className="font-mono font-bold text-blue-400">{val}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={val}
                onChange={(e) => onUpdateWeight(field.key, parseInt(e.target.value, 10))}
                className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${field.color}`}
              />
              <p className="text-[10px] text-slate-400">{field.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
