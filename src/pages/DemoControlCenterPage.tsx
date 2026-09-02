import React from 'react';
import { ScenarioId } from '../types';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { Sliders, Play, CheckCircle2, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface DemoControlCenterPageProps {
  activeScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  onNavigate: (page: string) => void;
}

export const DemoControlCenterPage: React.FC<DemoControlCenterPageProps> = ({
  activeScenarioId,
  onSelectScenario,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
              DEMO CONTROL & MODE SELECTION
            </h2>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              SIH 2026 PRESENTATION MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explicitly toggle between Real PyTorch ML Inference Mode and Controlled Demo Test Scenarios.
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real Mode Card */}
        <div className="bg-cyber-card border border-emerald-500/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> MODE A & B — REAL ANALYSIS
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PyTorch Live Backend</span>
          </div>

          <p className="text-xs text-slate-300">
            Processes actual microphone audio chunks via Web Audio API WebSocket or uploaded audio files (.wav, .mp3) using real STFT spectrogram neural classifiers & ECAPA-TDNN speaker embeddings.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('audio-analysis')}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" /> Mode A: Audio File Analysis
            </button>
            <button
              onClick={() => onNavigate('live-call')}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" /> Mode B: Live Mic Stream
            </button>
          </div>
        </div>

        {/* Demo Test Scenarios Card */}
        <div className="bg-cyber-card border border-amber-500/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1.5">
              <Play className="w-4 h-4" /> PRESENTATION TEST SCENARIOS
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Repeatable Hackathon Scenarios</span>
          </div>

          <p className="text-xs text-slate-300">
            Pre-configured attack and genuine scenarios designed for repeatable, live judge presentations during hackathon evaluation.
          </p>
        </div>
      </div>

      {/* Scenario List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
          PRE-CONFIGURED PRESENTATION SCENARIOS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(DEMO_SCENARIOS).map(([id, scenario]) => {
            const isActive = activeScenarioId === id;
            return (
              <div
                key={id}
                onClick={() => onSelectScenario(id as ScenarioId)}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyber-dark/90 border-blue-500 shadow-blue-500/10 shadow-lg'
                    : 'bg-cyber-card border-cyber-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-100">{scenario.name}</h4>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    scenario.expectedRiskBand === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    scenario.expectedRiskBand === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    Expected Band: {scenario.expectedRiskBand}
                  </span>
                </div>
                <p className="text-xs text-blue-400 font-mono mb-2">{scenario.tagline}</p>
                <p className="text-xs text-slate-400">{scenario.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
