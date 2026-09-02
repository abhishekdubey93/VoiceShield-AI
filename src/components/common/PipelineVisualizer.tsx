import React from 'react';
import {
  Mic,
  Sliders,
  Globe,
  Activity,
  Cpu,
  UserCheck,
  ShieldAlert,
  PhoneCall,
  CreditCard,
  Gauge,
  Lock,
} from 'lucide-react';
import { VoiceAnalysisSignals } from '../../types';

interface PipelineVisualizerProps {
  signals?: VoiceAnalysisSignals;
  activeStage?: number;
  compact?: boolean;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  signals,
  compact = false,
}) => {
  const stages = [
    { id: 1, label: 'Incoming Audio', icon: Mic, value: '16kHz PCM / Realtime', desc: 'Raw voice stream ingestion' },
    { id: 2, label: 'Preprocessing', icon: Sliders, value: 'Noise Filter Active', desc: 'Denoising & VAD segmenting' },
    { id: 3, label: 'Language Detection', icon: Globe, value: 'Multilingual Model', desc: 'Chunk-level language ID' },
    { id: 4, label: 'Speech Representation', icon: Activity, value: 'Feature Extractor', desc: 'Mel-spectrogram & embeddings' },
    { id: 5, label: 'AI/Synthetic Detection', icon: Cpu, value: `${signals?.syntheticProbability ?? 82}% Synthetic`, desc: 'WavLM / Anti-spoof classifier' },
    { id: 6, label: 'Speaker Verification', icon: UserCheck, value: `${signals?.speakerConsistency ?? 64}% Similarity`, desc: 'ECAPA-TDNN profile match' },
    { id: 7, label: 'Liveness Analysis', icon: ShieldAlert, value: `${signals?.livenessScore ?? 71}% Liveness`, desc: 'Prosody & turn-taking check' },
    { id: 8, label: 'Call Context', icon: PhoneCall, value: `${signals?.callContextRisk ?? 58}% Risk`, desc: 'Caller ID & origin telemetry' },
    { id: 9, label: 'Transaction Context', icon: CreditCard, value: `${signals?.transactionRisk ?? 88}% Risk`, desc: 'Intent & amount sensitivity' },
    { id: 10, label: 'Dynamic Risk Engine', icon: Gauge, value: 'Weighted Score', desc: 'Normalized risk formula' },
    { id: 11, label: 'Protection Action', icon: Lock, value: 'Automated Shield', desc: 'MFA / Hold / Callback' },
  ];

  if (compact) {
    return (
      <div className="flex items-center overflow-x-auto gap-2 py-3 px-1 no-scrollbar">
        {stages.map((stg, idx) => {
          const IconComp = stg.icon;
          return (
            <React.Fragment key={stg.id}>
              <div className="flex flex-col items-center flex-shrink-0 bg-cyber-card border border-cyber-border p-2 rounded-lg text-center min-w-[100px]">
                <IconComp className="w-4 h-4 text-blue-400 mb-1" />
                <span className="text-[10px] font-semibold text-slate-300 truncate w-full">{stg.label}</span>
                <span className="text-[9px] font-mono text-blue-400">{stg.value}</span>
              </div>
              {idx < stages.length - 1 && (
                <span className="text-slate-600 font-mono text-xs flex-shrink-0">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-cyber-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-400" /> VoiceShield End-to-End Inspection Pipeline
          </h3>
          <p className="text-xs text-slate-400">Sequential acoustic, contextual, and behavioral analysis flow</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
          DEMO ENGINE ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((stg, idx) => {
          const IconComp = stg.icon;
          return (
            <div
              key={stg.id}
              className="relative bg-cyber-dark/60 border border-cyber-border p-3.5 rounded-lg hover:border-blue-500/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">STAGE {idx + 1}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate mt-0.5">{stg.label}</h4>
                  <p className="text-[11px] font-mono font-semibold text-blue-400 mt-1 truncate">{stg.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{stg.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
