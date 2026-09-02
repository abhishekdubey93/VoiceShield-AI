import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, PhoneOff, RefreshCw, X } from 'lucide-react';
import { maskPhoneNumber } from '../../utils/formatters';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  trustedNumber: string;
  onSuccess: () => void;
  onFail: () => void;
}

export const CallbackModal: React.FC<CallbackModalProps> = ({
  isOpen,
  onClose,
  callerName,
  trustedNumber,
  onSuccess,
  onFail,
}) => {
  const [step, setStep] = useState<'IDLE' | 'DIALING' | 'SUCCESS' | 'FAILED'>('IDLE');

  if (!isOpen) return null;

  const handleInitiateCallback = () => {
    setStep('DIALING');
    setTimeout(() => {
      setStep('SUCCESS');
    }, 2500);
  };

  const handleSimulateFail = () => {
    setStep('DIALING');
    setTimeout(() => {
      setStep('FAILED');
    }, 2000);
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
          <PhoneCall className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">Out-of-Band Trusted Callback</h3>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-blue-300 text-xs mb-4">
          <span className="font-bold block">ANTI-SPOOF PROTOCOL</span>
          Bypass caller-ID spoofing by establishing a direct secondary outbound connection to the registered subscriber profile.
        </div>

        <div className="bg-cyber-dark p-4 rounded-lg border border-cyber-border space-y-2 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Target Contact:</span>
            <span className="font-semibold text-slate-200">{callerName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Registered Trusted Number:</span>
            <span className="font-mono font-semibold text-blue-400">{maskPhoneNumber(trustedNumber)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Channel Type:</span>
            <span className="font-mono text-emerald-400">Encrypted Out-of-Band Cellular</span>
          </div>
        </div>

        {step === 'IDLE' && (
          <div className="space-y-2">
            <button
              onClick={handleInitiateCallback}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Initiate Trusted Callback
            </button>
            <button
              onClick={handleSimulateFail}
              className="w-full py-2 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold"
            >
              Simulate Unreachable / Mismatch
            </button>
          </div>
        )}

        {step === 'DIALING' && (
          <div className="text-center py-6">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-200">Dialing Registered Number {maskPhoneNumber(trustedNumber)}...</p>
            <p className="text-[10px] text-slate-400 mt-1">Establishing secure secondary voice stream</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-400">CALLBACK VERIFICATION SUCCESSFUL</h4>
            <p className="text-xs text-slate-300">
              Outbound connection established with registered handset. Voice identity confirmed.
            </p>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Authorize & Complete
            </button>
          </div>
        )}

        {step === 'FAILED' && (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <PhoneOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-red-400">CALLBACK VERIFICATION FAILED</h4>
            <p className="text-xs text-slate-300">
              Trusted device unavailable or speaker embedding on outbound call failed consistency test.
            </p>
            <button
              onClick={() => {
                onFail();
                onClose();
              }}
              className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Maintain Block Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
