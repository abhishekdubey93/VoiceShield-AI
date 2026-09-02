import React from 'react';
import { DemoScenario, ScenarioId } from '../types';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { SlidersHorizontal, Zap, Play, CheckCircle, ArrowRight, ShieldAlert, Globe, PhoneCall } from 'lucide-react';
import { Badge } from '../components/common/Badge';

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
  const scenarioList = Object.values(DEMO_SCENARIOS);

  const presentationSteps = [
    { step: 1, title: 'Open Dashboard', desc: 'Present global VoiceShield Security Dashboard and baseline telemetry.' },
    { step: 2, title: 'Launch Demo Control Center', desc: 'Show scenario selector for judge evaluation.' },
    { step: 3, title: 'Select VOICE CLONE SCAM', desc: 'Load active clone attack scenario.' },
    { step: 4, title: 'Open Live Call Monitor', desc: 'Observe real-time ticking stream inspection.' },
    { step: 5, title: 'Observe Audio Waveform', desc: 'Display live 16kHz PCM stream animation.' },
    { step: 6, title: 'Detect Hindi Language', desc: 'Chunk-level language classifier identifies Hindi.' },
    { step: 7, title: 'Switch to English Speech', desc: 'Caller transitions language naturally.' },
    { step: 8, title: 'Explain Language Invariance', desc: 'Language switching does NOT falsely elevate fraud risk.' },
    { step: 9, title: 'Synthetic Score Spikes (92%)', desc: 'WavLM neural TTS artifacts detected.' },
    { step: 10, title: 'Speaker Mismatch (54%)', desc: 'Voice embedding profile similarity drops.' },
    { step: 11, title: '₹75,000 Transfer Request', desc: 'Urgent transfer to unfamiliar beneficiary requested.' },
    { step: 12, title: 'Transaction Context Risk Rises', desc: 'Transaction risk vector elevates to 92%.' },
    { step: 13, title: 'Risk Score Crosses 80', desc: 'Calculated score enters CRITICAL band.' },
    { step: 14, title: 'Automatic Protection Triggered', desc: 'TRANSACTION HOLD automatically engaged.' },
    { step: 15, title: 'Trigger Challenge Verification', desc: 'Prompt phrase pass-code ("47 blue mango").' },
    { step: 16, title: 'Simulate Liveness Failure', desc: 'Voice cadence mismatch triggers liveness fail.' },
    { step: 17, title: 'Keep Transaction Blocked', desc: 'Hold maintained; scam attack thwarted.' },
    { step: 18, title: 'Open Incident Forensics', desc: 'Inspect chronological forensic event timeline.' },
    { step: 19, title: 'Open Security Audit Log', desc: 'Review immutable system action log.' },
    { step: 20, title: 'Explainable AI Breakdown', desc: 'Demonstrate exactly WHY VoiceShield protected user.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-400" /> DEMO CONTROL CENTER
            </h2>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              HACKATHON PRESENTATION CONTROLLER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-seeded test scenarios for judges & 3-minute live presentation flow guide
          </p>
        </div>

        <button
          onClick={() => onNavigate('live-call')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          Launch Live Call View <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Hackathon Demo Scenarios */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          SELECT HACKATHON DEMO SCENARIO
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioList.map((scen) => {
            const isSelected = activeScenarioId === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => {
                  onSelectScenario(scen.id);
                  onNavigate('live-call');
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500/60 shadow-xl ring-1 ring-blue-500/50'
                    : 'bg-cyber-card border-cyber-border hover:border-blue-500/40 hover:bg-cyber-card/80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">{scen.tagline}</span>
                    <Badge level={scen.expectedRiskBand} />
                  </div>

                  <h4 className="text-base font-bold text-slate-100">{scen.name}</h4>
                  <p className="text-xs text-slate-300 leading-snug">{scen.description}</p>
                </div>

                <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Default Score: <strong className="text-slate-200">{scen.defaultCall.riskBreakdown.finalScore} / 100</strong>
                  </span>
                  <button
                    className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyber-dark text-slate-300 border border-cyber-border hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" /> Activate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Minute Live Demo Presentation Flow Guide */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              3-MINUTE LIVE HACKATHON PRESENTATION FLOW
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
            JUDGE PRESENTATION SCRIPT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presentationSteps.map((s) => (
            <div key={s.step} className="bg-cyber-dark/60 border border-cyber-border p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-400">STEP {s.step}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
              <h5 className="text-xs font-bold text-slate-200">{s.title}</h5>
              <p className="text-[10px] text-slate-400 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
