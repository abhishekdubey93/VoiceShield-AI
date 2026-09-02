import React from 'react';
import { CallRecord } from '../types';
import { RiskMeter } from '../components/common/RiskMeter';
import { PipelineVisualizer } from '../components/common/PipelineVisualizer';
import {
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Lock,
  TrendingUp,
  Cpu,
  UserCheck,
  CreditCard,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency, formatDuration } from '../utils/formatters';

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
  const totalAnalyzed = callHistory.length + 42;
  const suspiciousCalls = callHistory.filter((c) => c.riskBreakdown.finalScore > 60).length + 8;
  const highRiskEvents = callHistory.filter((c) => c.riskBreakdown.level === 'CRITICAL').length + 3;
  const protectedTx = callHistory.filter((c) => c.transaction.amount).length + 15;
  const avgRisk = Math.round(
    callHistory.reduce((acc, c) => acc + c.riskBreakdown.finalScore, 0) / (callHistory.length || 1)
  );

  const radarData = [
    { signal: 'Synthetic Prob', value: currentCall.signals.syntheticProbability },
    { signal: 'Speaker Mismatch', value: 100 - currentCall.signals.speakerConsistency },
    { signal: 'Liveness Deficit', value: 100 - currentCall.signals.livenessScore },
    { signal: 'Call Context', value: currentCall.signals.callContextRisk },
    { signal: 'Tx Sensitivity', value: currentCall.signals.transactionRisk },
  ];

  const signalBarData = [
    { name: 'Synthetic Voice', score: currentCall.signals.syntheticProbability, color: '#EF4444' },
    { name: 'Speaker Match', score: currentCall.signals.speakerConsistency, color: '#F59E0B' },
    { name: 'Liveness Score', score: currentCall.signals.livenessScore, color: '#3B82F6' },
    { name: 'Context Risk', score: currentCall.signals.callContextRisk, color: '#10B981' },
    { name: 'Tx Sensitivity', score: currentCall.signals.transactionRisk, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cyber-card border border-cyber-border p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-100">VoiceShield Security Dashboard</h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              ● Live Protected
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time synthetic voice detection, biometric verification & risk-weighted transaction defense
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScenarioModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Demo Control Scenarios
          </button>
          <button
            onClick={() => onNavigate('live-call')}
            className="px-4 py-2 bg-cyber-dark hover:bg-slate-800 text-slate-200 border border-cyber-border text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            Open Live Call Monitor <ArrowRight className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">Calls Analyzed</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-100">{totalAnalyzed}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+12 today</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">Suspicious Calls</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-400">{suspiciousCalls}</span>
          <span className="text-[10px] text-amber-300 block mt-1">Requires review</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">High Risk Events</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-xl font-bold font-mono text-red-400">{highRiskEvents}</span>
          <span className="text-[10px] text-red-400 block mt-1">Blocked / Intercepted</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">Protected Tx</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-400">{protectedTx}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">₹14.2L Protected</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">Average Risk</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl font-bold font-mono text-purple-400">{avgRisk} / 100</span>
          <span className="text-[10px] text-slate-400 block mt-1">Overall Baseline</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">Active Stream</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <span className="text-xl font-bold font-mono text-blue-400">1 Call</span>
          <span className="text-[10px] text-blue-400 block mt-1">Real-time Ticking</span>
        </div>
      </div>

      {/* Main Large Card: CURRENT CALL RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Call Risk Gauge & Signal Overview */}
        <div className="lg:col-span-2 bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-400 tracking-wider">LIVE TELEMETRY STREAM</span>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                CURRENT CALL RISK: <span className="font-mono text-slate-300">{currentCall.callerName}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">{currentCall.callerNumber}</span>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                Duration: {formatDuration(currentCall.durationSeconds)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Risk Gauge */}
            <div className="flex flex-col items-center justify-center p-4 bg-cyber-dark/60 rounded-xl border border-cyber-border">
              <RiskMeter
                score={currentCall.riskBreakdown.finalScore}
                level={currentCall.riskBreakdown.level}
                actionText={currentCall.riskBreakdown.recommendedAction}
                size="md"
              />
            </div>

            {/* Radar / Signal Breakdown */}
            <div className="h-60 w-full bg-cyber-dark/40 rounded-xl p-2 border border-cyber-border">
              <span className="text-[10px] font-mono text-slate-400 block text-center uppercase mb-1">Acoustic & Context Signal Radar</span>
              <ResponsiveContainer width="100%" height="85%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis dataKey="signal" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Radar name="Signal Level" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contributing Signals Bar List */}
          <div className="mt-6 pt-4 border-t border-cyber-border grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-cyber-dark p-2.5 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 font-mono block">Synthetic Prob</span>
              <span className="text-sm font-mono font-bold text-red-400">{currentCall.signals.syntheticProbability}%</span>
            </div>
            <div className="bg-cyber-dark p-2.5 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 font-mono block">Speaker Match</span>
              <span className="text-sm font-mono font-bold text-amber-400">{currentCall.signals.speakerConsistency}%</span>
            </div>
            <div className="bg-cyber-dark p-2.5 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 font-mono block">Liveness Score</span>
              <span className="text-sm font-mono font-bold text-blue-400">{currentCall.signals.livenessScore}%</span>
            </div>
            <div className="bg-cyber-dark p-2.5 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 font-mono block">Call Context</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{currentCall.signals.callContextRisk}%</span>
            </div>
            <div className="bg-cyber-dark p-2.5 rounded-lg border border-cyber-border">
              <span className="text-[10px] text-slate-400 font-mono block">Tx Sensitivity</span>
              <span className="text-sm font-mono font-bold text-purple-400">{currentCall.signals.transactionRisk}%</span>
            </div>
          </div>
        </div>

        {/* Right Col: Explainable AI "Why is this risky?" */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-cyber-border pb-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Why is this interaction risky?
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              VoiceShield automated explainability engine identified the following primary risk drivers:
            </p>

            <ul className="space-y-3">
              {currentCall.riskBreakdown.primaryDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-200 leading-snug">{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-cyber-border space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Transaction Action:</span>
              <span className="text-slate-200 font-semibold">{currentCall.transaction.action}</span>
            </div>
            {currentCall.transaction.amount && (
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Requested Amount:</span>
                <span className="text-red-400 font-bold">{formatCurrency(currentCall.transaction.amount)}</span>
              </div>
            )}
            <button
              onClick={() => onNavigate('live-call')}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Take Action on Live Call <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Inspection Pipeline */}
      <PipelineVisualizer signals={currentCall.signals} />
    </div>
  );
};
