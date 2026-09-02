import React from 'react';
import { CallRecord, PerformanceTelemetry } from '../types';
import { BarChart3, Activity, Clock, Zap, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface AnalyticsPageProps {
  callHistory: CallRecord[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ callHistory }) => {
  const telemetry: PerformanceTelemetry = {
    audioPreprocessingMs: 87,
    aiInferenceMs: 124,
    riskEngineMs: 18,
    totalLatencyMs: 229,
    targetLatencyMs: 300,
    isDemoTelemetry: true,
  };

  const riskDist = [
    { name: 'LOW (0-30)', count: callHistory.filter((c) => c.riskBreakdown.level === 'LOW').length + 18, color: '#10B981' },
    { name: 'MEDIUM (31-60)', count: callHistory.filter((c) => c.riskBreakdown.level === 'MEDIUM').length + 9, color: '#F59E0B' },
    { name: 'HIGH (61-80)', count: callHistory.filter((c) => c.riskBreakdown.level === 'HIGH').length + 5, color: '#F97316' },
    { name: 'CRITICAL (81-100)', count: callHistory.filter((c) => c.riskBreakdown.level === 'CRITICAL').length + 3, color: '#EF4444' },
  ];

  const trendData = [
    { time: '00:00', syntheticProb: 15, riskScore: 18 },
    { time: '00:10', syntheticProb: 21, riskScore: 24 },
    { time: '00:20', syntheticProb: 38, riskScore: 42 },
    { time: '00:30', syntheticProb: 69, riskScore: 71 },
    { time: '00:40', syntheticProb: 82, riskScore: 76 },
    { time: '00:50', syntheticProb: 92, riskScore: 90 },
  ];

  const langData = [
    { name: 'Hindi', value: 45, color: '#3B82F6' },
    { name: 'English', value: 30, color: '#10B981' },
    { name: 'Bhojpuri', value: 12, color: '#F59E0B' },
    { name: 'Bengali', value: 8, color: '#8B5CF6' },
    { name: 'Others', value: 5, color: '#64748B' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Security Analytics & Inference Latency
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time deepfake detection distribution, language breakdown, and pipeline latency metrics
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <span>Target Latency: &lt;{telemetry.targetLatencyMs}ms</span>
        </div>
      </div>

      {/* Latency Telemetry Card */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              REAL-TIME PROCESSING TELEMETRY
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
            DEMO PERFORMANCE TELEMETRY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Audio Preprocessing</span>
            <span className="text-2xl font-bold font-mono text-blue-400">{telemetry.audioPreprocessingMs} ms</span>
            <span className="text-[9px] text-slate-500 block mt-1">VAD & Denoising</span>
          </div>

          <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">AI Model Inference</span>
            <span className="text-2xl font-bold font-mono text-purple-400">{telemetry.aiInferenceMs} ms</span>
            <span className="text-[9px] text-slate-500 block mt-1">WavLM / ECAPA-TDNN</span>
          </div>

          <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Risk Engine Calculation</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{telemetry.riskEngineMs} ms</span>
            <span className="text-[9px] text-slate-500 block mt-1">Weighted Formula</span>
          </div>

          <div className="bg-cyber-dark p-4 rounded-xl border border-blue-500/40">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Total E2E Latency</span>
            <span className="text-2xl font-bold font-mono text-slate-100">{telemetry.totalLatencyMs} ms</span>
            <span className="text-[9px] text-emerald-400 block mt-1">✓ Below 300ms SLA Target</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Level Distribution */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            RISK LEVEL DISTRIBUTION
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDist}>
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#121824', borderColor: '#1E293B' }} />
                <Bar dataKey="count">
                  {riskDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Synthetic Probability Timeline */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            SYNTHETIC PROBABILITY VS RISK TIME-SERIES
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#121824', borderColor: '#1E293B' }} />
                <Line type="monotone" dataKey="syntheticProb" stroke="#EF4444" strokeWidth={2} name="Synthetic Prob %" />
                <Line type="monotone" dataKey="riskScore" stroke="#F59E0B" strokeWidth={2} name="Risk Score / 100" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
