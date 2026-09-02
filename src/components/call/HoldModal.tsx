import React from 'react';
import { Lock, Unlock, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { CallRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface HoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallRecord;
  onRelease: () => void;
  onStartChallenge: () => void;
}

export const HoldModal: React.FC<HoldModalProps> = ({
  isOpen,
  onClose,
  call,
  onRelease,
  onStartChallenge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-cyber-card border border-red-500/50 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-cyber-border pb-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
              TRANSACTION TEMPORARILY HELD
            </h3>
            <p className="text-xs text-slate-400">Automated protective intervention by VoiceShield AI</p>
          </div>
        </div>

        <div className="bg-cyber-dark p-4 rounded-lg border border-cyber-border space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Hold Reason:</span>
            <span className="font-semibold text-red-300">Potential AI Voice Impersonation Detected</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Caller Identity:</span>
            <span className="font-semibold text-slate-200">{call.callerName} ({call.callerNumber})</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Transaction:</span>
            <span className="font-mono text-slate-200">
              {call.transaction.action} {call.transaction.amount ? `(${formatCurrency(call.transaction.amount)})` : ''}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Synthetic Probability:</span>
            <span className="font-mono text-red-400 font-bold">{call.signals.syntheticProbability}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Speaker Consistency:</span>
            <span className="font-mono text-amber-400 font-bold">{call.signals.speakerConsistency}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Risk Score:</span>
            <span className="font-mono text-xl text-red-400 font-extrabold">{call.riskBreakdown.finalScore} / 100</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              onStartChallenge();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
          >
            <ShieldCheck className="w-4 h-4" /> Verify Caller (Challenge)
          </button>
          <button
            onClick={() => {
              onRelease();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1"
          >
            <Unlock className="w-4 h-4" /> Manual Release
          </button>
        </div>
      </div>
    </div>
  );
};
