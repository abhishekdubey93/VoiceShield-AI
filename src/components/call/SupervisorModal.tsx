import React from 'react';
import { UserCheck, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';
import { CallRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallRecord;
  onApprove: () => void;
  onReject: () => void;
}

export const SupervisorModal: React.FC<SupervisorModalProps> = ({
  isOpen,
  onClose,
  call,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-cyber-card border border-red-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-cyber-border pb-3 mb-4">
          <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
              CRITICAL RISK — SUPERVISOR APPROVAL REQUIRED
            </h3>
            <p className="text-xs text-slate-400">High-value or anomalous transaction suspended by VoiceShield Engine</p>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-lg mb-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">Requested Action:</span>
            <span className="font-mono text-red-300 font-bold">{call.transaction.action}</span>
          </div>
          {call.transaction.amount && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Transaction Amount:</span>
              <span className="font-mono text-xl font-bold text-red-400">
                {formatCurrency(call.transaction.amount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">Target Recipient:</span>
            <span className="font-mono text-slate-200">{call.transaction.recipient || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">Risk Engine Score:</span>
            <span className="font-mono font-extrabold text-red-400">{call.riskBreakdown.finalScore} / 100 (CRITICAL)</span>
          </div>
        </div>

        <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border mb-5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Risk Factors & Forensics</span>
          <ul className="space-y-1 text-xs text-slate-300">
            {call.riskBreakdown.primaryDrivers.map((driver, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-red-300">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              onReject();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-1"
          >
            <X className="w-4 h-4" /> Reject & Block Permanently
          </button>
          <button
            onClick={() => {
              onApprove();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1"
          >
            <UserCheck className="w-4 h-4" /> Override & Approve
          </button>
        </div>
      </div>
    </div>
  );
};
