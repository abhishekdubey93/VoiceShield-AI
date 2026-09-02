import React, { useState } from 'react';
import { CallRecord, SecurityActionRecord, TransactionDetails } from '../types';
import { Waveform } from '../components/common/Waveform';
import { RiskMeter } from '../components/common/RiskMeter';
import { LanguageTimeline } from '../components/call/LanguageTimeline';
import { ChallengeModal } from '../components/call/ChallengeModal';
import { MfaModal } from '../components/call/MfaModal';
import { CallbackModal } from '../components/call/CallbackModal';
import { SupervisorModal } from '../components/call/SupervisorModal';
import { HoldModal } from '../components/call/HoldModal';
import { formatCurrency, formatDuration, maskPhoneNumber } from '../utils/formatters';
import {
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  KeyRound,
  Lock,
  UserCheck,
  AlertTriangle,
  Play,
  Pause,
  Globe,
  Activity,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';

interface LiveCallPageProps {
  currentCall: CallRecord;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onUpdateSignals: (updates: Partial<CallRecord['signals']>) => void;
  onUpdateTransaction: (updates: Partial<TransactionDetails>) => void;
  onAddAction: (action: SecurityActionRecord) => void;
  onAddToast: (title: string, message: string, type?: 'info' | 'warning' | 'success' | 'danger') => void;
}

export const LiveCallPage: React.FC<LiveCallPageProps> = ({
  currentCall,
  isSimulating,
  onToggleSimulating,
  onUpdateSignals,
  onUpdateTransaction,
  onAddAction,
  onAddToast,
}) => {
  // Modal states
  const [activeModal, setActiveModal] = useState<'CHALLENGE' | 'MFA' | 'CALLBACK' | 'SUPERVISOR' | 'HOLD' | null>(null);

  const handleMfaSuccess = () => {
    onAddAction({
      id: `act_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'MFA_OTP',
      status: 'PASSED',
      details: 'Step-up MFA OTP code verified successfully by user.',
      actor: 'User',
    });
    onAddToast('MFA Verified', 'Secondary OTP passcode authenticated successfully.', 'success');
  };

  const handleChallengeSuccess = () => {
    onAddAction({
      id: `act_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CHALLENGE_VERIFICATION',
      status: 'PASSED',
      details: 'Acoustic liveness pass-phrase challenge passed.',
      actor: 'User',
    });
    onAddToast('Challenge Passed', 'Caller spoke pass-phrase accurately with verified liveness.', 'success');
  };

  const handleChallengeFail = () => {
    onAddAction({
      id: `act_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CHALLENGE_VERIFICATION',
      status: 'FAILED',
      details: 'Liveness pass-phrase challenge failed. Voice cadence anomaly.',
      actor: 'User',
    });
    onAddToast('Challenge Failed', 'Phrase response timing / cadence failed liveness test.', 'danger');
  };

  const handleCallbackSuccess = () => {
    onAddAction({
      id: `act_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'TRUSTED_CALLBACK',
      status: 'PASSED',
      details: 'Out-of-band cellular callback confirmed identity.',
      actor: 'User',
    });
    onAddToast('Callback Verified', 'Trusted handset callback established and authenticated.', 'success');
  };

  const handleHoldToggle = () => {
    const isCurrentlyHeld = currentCall.actionsTaken.some((a) => a.type === 'TRANSACTION_HOLD' && a.status === 'BLOCKED');
    if (isCurrentlyHeld) {
      onAddAction({
        id: `act_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'TRANSACTION_HOLD',
        status: 'RELEASED',
        details: 'Manual override: Transaction hold released by operator.',
        actor: 'User',
      });
      onAddToast('Hold Released', 'Transaction hold has been manually released.', 'warning');
    } else {
      setActiveModal('HOLD');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
              LIVE CALL SECURITY MONITOR
            </h2>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              DEMO ANALYSIS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ticking stream inspection • Simulated 1–2s signal updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSimulating}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-colors ${
              isSimulating
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Pause Simulation' : 'Resume Ticking'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Caller Identity + Live Waveform + Risk Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Call Header & Waveform */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
                  {currentCall.callerName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{currentCall.callerName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{maskPhoneNumber(currentCall.callerNumber)}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{currentCall.context.callerIdStatus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Duration</span>
                  <span className="text-lg font-mono font-bold text-slate-100">
                    {formatDuration(currentCall.durationSeconds)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Status</span>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                    {currentCall.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="bg-cyber-dark/80 p-4 rounded-xl border border-cyber-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" /> Real-Time Acoustic Waveform (16kHz PCM Stream)
                </span>
                <span className="text-blue-400">Quality: {currentCall.audioQuality}</span>
              </div>
              <Waveform isActive={isSimulating} barCount={42} height={54} color="#3B82F6" />
            </div>

            {/* Signal Adjuster Sliders (Interactive Demo Controls) */}
            <div className="bg-cyber-dark/40 p-4 rounded-xl border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-400" /> Live Signal Tweaker (Judge Interactive)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Simulate acoustic degradation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Synthetic Voice Prob:</span>
                    <span className="text-red-400 font-bold">{currentCall.signals.syntheticProbability}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentCall.signals.syntheticProbability}
                    onChange={(e) => onUpdateSignals({ syntheticProbability: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Speaker Consistency:</span>
                    <span className="text-amber-400 font-bold">{currentCall.signals.speakerConsistency}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentCall.signals.speakerConsistency}
                    onChange={(e) => onUpdateSignals({ speakerConsistency: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multilingual Timeline */}
          <LanguageTimeline segments={currentCall.languagesDetected} />
        </div>

        {/* Col 3: Live Risk Meter & Protection Action Control Center */}
        <div className="space-y-6">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl text-center space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              DYNAMIC RISK EVALUATION
            </h4>

            <RiskMeter
              score={currentCall.riskBreakdown.finalScore}
              level={currentCall.riskBreakdown.level}
              actionText={currentCall.riskBreakdown.recommendedAction}
              size="md"
            />

            {/* Sensitive Transaction Selector */}
            <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Transaction Intent:
                </span>
                <select
                  value={currentCall.transaction.action}
                  onChange={(e) =>
                    onUpdateTransaction({
                      action: e.target.value as TransactionDetails['action'],
                      amount: e.target.value === 'Transfer Money' ? 75000 : undefined,
                    })
                  }
                  className="bg-cyber-card border border-cyber-border rounded text-xs text-slate-200 px-2 py-1 focus:outline-none"
                >
                  <option value="Normal Conversation">Normal Conversation</option>
                  <option value="Transfer Money">Transfer Money (₹75,000)</option>
                  <option value="Share OTP">Share Banking OTP</option>
                  <option value="Reset Account">Reset Account Credentials</option>
                  <option value="Access Confidential Info">Access Confidential Data</option>
                </select>
              </div>

              {currentCall.transaction.amount && (
                <div className="flex justify-between text-xs font-mono text-red-400 font-semibold pt-1 border-t border-cyber-border/50">
                  <span>Amount: {formatCurrency(currentCall.transaction.amount)}</span>
                  <span>Sensitivity: CRITICAL</span>
                </div>
              )}
            </div>

            {/* Security Action Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase text-left">
                PROTECTION ACTIONS
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveModal('MFA')}
                  className="py-2.5 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Require MFA
                </button>

                <button
                  onClick={() => setActiveModal('CALLBACK')}
                  className="py-2.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" /> Trusted Callback
                </button>

                <button
                  onClick={() => setActiveModal('CHALLENGE')}
                  className="py-2.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Liveness Challenge
                </button>

                <button
                  onClick={() => setActiveModal('SUPERVISOR')}
                  className="py-2.5 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-4 h-4" /> Supervisor Req
                </button>
              </div>

              <button
                onClick={handleHoldToggle}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Lock className="w-4 h-4" /> HOLD TRANSACTION
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <ChallengeModal
        isOpen={activeModal === 'CHALLENGE'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleChallengeSuccess}
        onFail={handleChallengeFail}
      />
      <MfaModal
        isOpen={activeModal === 'MFA'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleMfaSuccess}
        onFail={() => {}}
      />
      <CallbackModal
        isOpen={activeModal === 'CALLBACK'}
        onClose={() => setActiveModal(null)}
        callerName={currentCall.callerName}
        trustedNumber={currentCall.callerNumber}
        onSuccess={handleCallbackSuccess}
        onFail={() => {}}
      />
      <SupervisorModal
        isOpen={activeModal === 'SUPERVISOR'}
        onClose={() => setActiveModal(null)}
        call={currentCall}
        onApprove={() => {
          onAddAction({
            id: `act_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'SUPERVISOR_APPROVAL',
            status: 'APPROVED',
            details: 'Supervisor approved interaction after manual review.',
            actor: 'Supervisor',
          });
          onAddToast('Approved', 'Supervisor manually authorized interaction.', 'success');
        }}
        onReject={() => {
          onAddAction({
            id: `act_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'SUPERVISOR_APPROVAL',
            status: 'REJECTED',
            details: 'Supervisor rejected interaction due to high deepfake indicators.',
            actor: 'Supervisor',
          });
          onAddToast('Rejected', 'Supervisor permanently blocked transaction.', 'danger');
        }}
      />
      <HoldModal
        isOpen={activeModal === 'HOLD'}
        onClose={() => setActiveModal(null)}
        call={currentCall}
        onRelease={() => {
          onAddAction({
            id: `act_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'TRANSACTION_HOLD',
            status: 'RELEASED',
            details: 'Transaction hold released by operator.',
            actor: 'User',
          });
          onAddToast('Released', 'Transaction hold released.', 'warning');
        }}
        onStartChallenge={() => setActiveModal('CHALLENGE')}
      />
    </div>
  );
};
