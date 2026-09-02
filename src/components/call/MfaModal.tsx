import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, X, Check } from 'lucide-react';

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFail: () => void;
}

export const MfaModal: React.FC<MfaModalProps> = ({ isOpen, onClose, onSuccess, onFail }) => {
  const [generatedOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [inputOtp, setInputOtp] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'VERIFIED' | 'FAILED'>('IDLE');

  if (!isOpen) return null;

  const handleVerify = () => {
    if (inputOtp === generatedOtp) {
      setStatus('VERIFIED');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } else {
      setStatus('FAILED');
    }
  };

  const handleAutoFill = () => {
    setInputOtp(generatedOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-cyber-card border border-cyber-border rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-cyber-border pb-3 mb-4">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">Step-Up MFA / OTP Verification</h3>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-amber-300 text-xs mb-4">
          <span className="font-bold block">DEMO OTP GENERATED</span>
          No real SMS sent. Use the simulated 6-digit code below to test secondary authentication.
        </div>

        <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border mb-4 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Simulated OTP Code</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-2xl font-mono font-bold tracking-widest text-amber-400">{generatedOtp}</span>
            <button
              onClick={handleAutoFill}
              className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded hover:bg-amber-500/30 font-mono"
            >
              Auto-Fill
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Enter 6-Digit Passcode</label>
            <input
              type="text"
              maxLength={6}
              value={inputOtp}
              onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-4 py-3 text-center text-xl font-mono text-slate-100 tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>

          {status === 'FAILED' && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded border border-red-500/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Invalid OTP code entered. Please retry or click Auto-Fill.</span>
            </div>
          )}

          {status === 'VERIFIED' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/30">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>MFA OTP verified successfully! Interaction authorized.</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                onFail();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
            >
              Cancel / Reject
            </button>
            <button
              onClick={handleVerify}
              disabled={inputOtp.length !== 6}
              className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" /> Verify OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
