import React, { useState } from 'react';
import { Mic, ShieldCheck, AlertCircle, X, RefreshCw } from 'lucide-react';
import { voiceAnalysisService } from '../../services/voiceAnalysisService';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFail: () => void;
}

const PHRASES = [
  '47 blue mango',
  '92 silver ocean',
  '15 crimson falcon',
  '63 golden whisper',
  '88 cobalt breeze',
];

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFail,
}) => {
  const [currentPhrase, setCurrentPhrase] = useState(PHRASES[0]);
  const [step, setStep] = useState<'READY' | 'RECORDING' | 'PROCESSING' | 'RESULT'>('READY');
  const [resultStatus, setResultStatus] = useState<'PASSED' | 'FAILED' | null>(null);
  const [resultMsg, setResultMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerateNew = () => {
    const next = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setCurrentPhrase(next);
    setStep('READY');
    setResultStatus(null);
  };

  const handleStartRecording = async () => {
    setStep('RECORDING');
    setTimeout(async () => {
      setStep('PROCESSING');
      const res = await voiceAnalysisService.analyzeLivenessChallenge(currentPhrase);
      setResultMsg(res.details);
      setStep('RESULT');
      if (res.passed) {
        setResultStatus('PASSED');
      } else {
        setResultStatus('FAILED');
      }
    }, 2000);
  };

  const handleSimulateFailure = () => {
    setStep('RECORDING');
    setTimeout(() => {
      setStep('PROCESSING');
      setTimeout(() => {
        setStep('RESULT');
        setResultStatus('FAILED');
        setResultMsg('Voice cadence and phrase timing mismatch detected. Liveness challenge FAILED.');
      }, 1000);
    }, 1500);
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
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-slate-100">Interactive Liveness Challenge</h3>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Prompt the caller to speak the random pass-phrase to evaluate acoustic liveness, prosody, and turn-taking response timing.
        </p>

        <div className="bg-cyber-dark p-4 rounded-lg border border-cyber-border text-center mb-5">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Random Target Phrase</span>
          <p className="text-xl font-mono font-bold text-blue-400 tracking-wider font-semibold">
            "{currentPhrase}"
          </p>
          <button
            onClick={handleGenerateNew}
            disabled={step !== 'READY'}
            className="mt-2 text-xs text-slate-400 hover:text-blue-400 inline-flex items-center gap-1 font-mono"
          >
            <RefreshCw className="w-3 h-3" /> New Phrase
          </button>
        </div>

        {step === 'READY' && (
          <div className="space-y-2">
            <button
              onClick={handleStartRecording}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" /> Start Challenge Recording
            </button>
            <button
              onClick={handleSimulateFailure}
              className="w-full py-2 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold"
            >
              Simulate Verification Failure
            </button>
          </div>
        )}

        {step === 'RECORDING' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Mic className="w-6 h-6" />
            </div>
            <p className="text-xs font-mono text-slate-200">Listening & Analyzing Speech Response...</p>
            <p className="text-[10px] text-slate-400 mt-1">Extracting spectral features & liveness metrics</p>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="text-center py-4">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-200">Evaluating Acoustic Liveness Model...</p>
          </div>
        )}

        {step === 'RESULT' && (
          <div className="space-y-4 text-center">
            {resultStatus === 'PASSED' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                <ShieldCheck className="w-8 h-8 mx-auto mb-1" />
                <h4 className="text-sm font-bold">LIVENESS CHALLENGE PASSED</h4>
                <p className="text-xs text-slate-300 mt-1">{resultMsg}</p>
              </div>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-1" />
                <h4 className="text-sm font-bold">LIVENESS CHALLENGE FAILED</h4>
                <p className="text-xs text-slate-300 mt-1">{resultMsg}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleGenerateNew}
                className="flex-1 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Retry Challenge
              </button>
              <button
                onClick={() => {
                  if (resultStatus === 'PASSED') onSuccess();
                  else onFail();
                  onClose();
                }}
                className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Apply Result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
