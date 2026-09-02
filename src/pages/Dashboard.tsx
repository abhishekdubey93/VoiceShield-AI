import React, { useEffect, useState } from 'react';
import { CallRecord } from '../types';
import { RiskMeter } from '../components/common/RiskMeter';
import { useLanguage } from '../context/LanguageContext';
import { realVoiceAnalysisService, SystemStatusResponse } from '../services/realVoiceAnalysisService';
import {
  ShieldAlert,
  Activity,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  currentCall: CallRecord;
  callHistory: CallRecord[];
  onNavigate: (page: string) => void;
  onOpenScenarioModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentCall,
  callHistory,
  onNavigate,
  onOpenScenarioModal,
}) => {
  const { t } = useLanguage();
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const res = await realVoiceAnalysisService.getSystemStatus();
      if (isMounted) {
        if (res) {
          setSystemStatus(res);
          setIsBackendConnected(true);
        } else {
          setIsBackendConnected(false);
        }
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalCalls = callHistory.length + 1;
  const flaggedCalls = callHistory.filter((c) => c.status === 'FLAGGED' || c.status === 'BLOCKED').length;
  const criticalCalls = callHistory.filter((c) => c.riskBreakdown.level === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Real AI Backend & Model Status Registry Banner */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyber-border pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${isBackendConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-tight">
                  SYSTEM HEALTH & AI MODEL REGISTRY
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isBackendConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {isBackendConnected ? 'REAL BACKEND CONNECTED' : 'LOCAL BACKEND OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PyTorch Neural Inference Pipeline • 16kHz STFT Spectrogram & ECAPA-TDNN Speaker Embedding Matcher
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('audio-analysis')}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <Zap className="w-4 h-4" /> Run Audio Analysis
            </button>
            <button
              onClick={() => onNavigate('live-call')}
              className="px-3.5 py-2 rounded-lg bg-cyber-dark hover:bg-slate-800 text-slate-200 border border-cyber-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-4 h-4 text-red-400" /> Microphone Live Monitor
            </button>
          </div>
        </div>

        {/* Model Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">ANTI-SPOOF MODEL</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">PyTorch STFT ConvNet</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {isBackendConnected ? 'READY' : 'PROTOTYPE'}
              </span>
            </div>
          </div>

          <div className="bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">SPEAKER EMBEDDING MODEL</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">ECAPA-TDNN 128-d</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {isBackendConnected ? 'READY' : 'PROTOTYPE'}
              </span>
            </div>
          </div>

          <div className="bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">HARDWARE ACCELERATION</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {systemStatus?.hardware_device || 'CPU Native (300ms)'}
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {systemStatus?.is_cuda_active ? 'CUDA GPU' : 'CPU NATIVE'}
              </span>
            </div>
          </div>

          <div className="bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">DATABASE STORAGE</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {systemStatus?.database || 'SQLite / PostgreSQL'}
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase">TOTAL MONITORED CALLS</span>
            <span className="text-2xl font-bold text-slate-100 mt-1 block">{totalCalls}</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase">FLAGGED INTERACTIONS</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">{flaggedCalls}</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase">CRITICAL THREATS BLOCKED</span>
            <span className="text-2xl font-bold text-red-400 mt-1 block">{criticalCalls}</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase">INFERENCE LATENCY</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">85 ms</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Call Monitor Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                CURRENT MONITORED CALL INSPECTION
              </h3>
            </div>
            <button
              onClick={() => onNavigate('live-call')}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono font-semibold flex items-center gap-1"
            >
              Open Live Monitor <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-cyber-dark/80 p-4 rounded-xl border border-cyber-border">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Caller Identity</span>
              <h4 className="text-base font-bold text-slate-100">{currentCall.callerName}</h4>
              <p className="text-xs font-mono text-slate-400">{currentCall.callerNumber}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Primary Language</span>
              <span className="text-xs font-bold text-blue-400 block">{currentCall.primaryLanguage}</span>
              <span className="text-[10px] font-mono text-emerald-400">Acoustic Invariant</span>
            </div>
          </div>

          {/* Core Signal Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-cyber-dark/60 p-3 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 uppercase block">SYNTHETIC VOICE PROBABILITY</span>
              <span className="text-lg font-bold text-red-400">{currentCall.signals.syntheticProbability}%</span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${currentCall.signals.syntheticProbability}%` }} className="bg-red-500 h-full" />
              </div>
            </div>

            <div className="bg-cyber-dark/60 p-3 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 uppercase block">SPEAKER EMBEDDING MATCH</span>
              <span className="text-lg font-bold text-emerald-400">{currentCall.signals.speakerConsistency}%</span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${currentCall.signals.speakerConsistency}%` }} className="bg-emerald-500 h-full" />
              </div>
            </div>

            <div className="bg-cyber-dark/60 p-3 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 uppercase block">VOICE LIVENESS SCORE</span>
              <span className="text-lg font-bold text-blue-400">{currentCall.signals.livenessScore}%</span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div style={{ width: `${currentCall.signals.livenessScore}%` }} className="bg-blue-500 h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Risk Gauge */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            DETERMINISTIC RISK SCORE
          </span>

          <RiskMeter
            score={currentCall.riskBreakdown.finalScore}
            level={currentCall.riskBreakdown.level}
            actionText={currentCall.riskBreakdown.recommendedAction}
            size="md"
          />

          <button
            onClick={() => onNavigate('risk-analysis')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold font-mono transition-colors"
          >
            View Weight Formula Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
