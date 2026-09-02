import React, { useState } from 'react';
import { RiskWeights } from '../types';
import { StorageService } from '../services/storageService';
import { Settings, Sliders, RotateCcw, Shield, Bell, Lock, Check } from 'lucide-react';
import { RiskWeightSliders } from '../components/risk/RiskWeightSliders';

interface SettingsPageProps {
  weights: RiskWeights;
  onUpdateWeight: (key: keyof RiskWeights, value: number) => void;
  onResetWeights: () => void;
  totalWeight: number;
  onResetDemoData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  weights,
  onUpdateWeight,
  onResetWeights,
  totalWeight,
  onResetDemoData,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all LocalStorage demo data to factory defaults?')) {
      onResetDemoData();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" /> Settings & System Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Risk weight formula calibration, security threshold customization, and demo reset controls
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/30">
            <Check className="w-4 h-4" /> Demo Data Reset Successfully!
          </div>
        )}
      </div>

      {/* Weight Formula Sliders */}
      <RiskWeightSliders
        weights={weights}
        onUpdateWeight={onUpdateWeight}
        onReset={onResetWeights}
        totalWeight={totalWeight}
      />

      {/* Demo Reset Card */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          DEMO STATE MANAGEMENT
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-cyber-dark p-4 rounded-xl border border-cyber-border">
          <div>
            <h4 className="text-sm font-bold text-slate-100">Reset Demo Persistence</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears LocalStorage call history, custom voice profiles, and audit log entries back to default hackathon seed states.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
