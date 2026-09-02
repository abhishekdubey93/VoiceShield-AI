import React from 'react';
import { Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageSegment } from '../../types';

interface LanguageTimelineProps {
  segments: LanguageSegment[];
}

export const LanguageTimeline: React.FC<LanguageTimelineProps> = ({ segments }) => {
  const lastSwitch =
    segments.length >= 2
      ? `${segments[segments.length - 2].language} → ${segments[segments.length - 1].language}`
      : null;

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Multilingual Chunk Timeline
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Language Switch Invariant
        </span>
      </div>

      {lastSwitch && (
        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300 flex items-center justify-between font-mono">
          <span>Active Code Switch Detected:</span>
          <span className="font-bold flex items-center gap-1 text-blue-400">
            {lastSwitch}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-500 border-b border-cyber-border text-[10px]">
              <th className="pb-1">Time</th>
              <th className="pb-1">Language</th>
              <th className="pb-1">Confidence</th>
              <th className="pb-1 text-right">Model Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/50 text-slate-300">
            {segments.map((seg, idx) => (
              <tr key={idx} className="hover:bg-cyber-dark/40">
                <td className="py-2 text-slate-400">{seg.timestamp}</td>
                <td className="py-2 font-bold text-slate-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {seg.language}
                </td>
                <td className="py-2">
                  <span className="text-blue-400 font-semibold">{seg.confidence}%</span>
                </td>
                <td className="py-2 text-right text-[10px] text-emerald-400">
                  Feature Extractor Adapted
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 italic">
        * VoiceShield continuously verifies speaker embedding & liveness across language boundaries without penalty.
      </p>
    </div>
  );
};
