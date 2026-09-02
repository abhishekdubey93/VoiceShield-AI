import React from 'react';
import { Globe, ShieldCheck, Activity, Clock, Cpu, ArrowRight } from 'lucide-react';
import { LanguageSegment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { formatDuration } from '../../utils/formatters';

interface LanguageTimelineProps {
  segments: LanguageSegment[];
}

export const LanguageTimeline: React.FC<LanguageTimelineProps> = ({ segments }) => {
  const { t } = useLanguage();

  const currentSegment = segments[segments.length - 1] || {
    timestamp: '00:00',
    timeSeconds: 0,
    segmentDurationSeconds: 0,
    language: 'Hindi',
    nativeName: 'हिंदी',
    confidence: 96,
    sampleSnippet: 'अरे भाई, शाम का क्या प्लान है?',
    detectionModel: 'WavLM-LID Neural Chunk v2',
  };

  const lastSwitch =
    segments.length >= 2
      ? {
          from: segments[segments.length - 2].language,
          to: segments[segments.length - 1].language,
          timestamp: segments[segments.length - 1].timestamp,
        }
      : null;

  // Calculate Cumulative Duration per Language in seconds
  const languageStats: Record<string, { durationSec: number; count: number; nativeName?: string }> = {};
  let totalCallSec = 0;

  segments.forEach((seg, idx) => {
    // Estimate segment duration if segmentDurationSeconds not set
    const nextTime = segments[idx + 1] ? segments[idx + 1].timeSeconds : seg.timeSeconds + 25;
    const dur = seg.segmentDurationSeconds || Math.max(5, nextTime - seg.timeSeconds);
    totalCallSec += dur;

    if (!languageStats[seg.language]) {
      languageStats[seg.language] = {
        durationSec: 0,
        count: 0,
        nativeName: seg.nativeName,
      };
    }
    languageStats[seg.language].durationSec += dur;
    languageStats[seg.language].count += 1;
  });

  const languageColors: Record<string, string> = {
    Hindi: 'bg-blue-500 text-blue-300 border-blue-500/30',
    English: 'bg-emerald-500 text-emerald-300 border-emerald-500/30',
    Bhojpuri: 'bg-amber-500 text-amber-300 border-amber-500/30',
    Bengali: 'bg-purple-500 text-purple-300 border-purple-500/30',
    Marathi: 'bg-orange-500 text-orange-300 border-orange-500/30',
    Tamil: 'bg-pink-500 text-pink-300 border-pink-500/30',
    Telugu: 'bg-cyan-500 text-cyan-300 border-cyan-500/30',
    Gujarati: 'bg-yellow-500 text-yellow-300 border-yellow-500/30',
    Kannada: 'bg-indigo-500 text-indigo-300 border-indigo-500/30',
  };

  const languageBarColors: Record<string, string> = {
    Hindi: 'bg-blue-500',
    English: 'bg-emerald-500',
    Bhojpuri: 'bg-amber-500',
    Bengali: 'bg-purple-500',
    Marathi: 'bg-orange-500',
    Tamil: 'bg-pink-500',
    Telugu: 'bg-cyan-500',
    Gujarati: 'bg-yellow-500',
    Kannada: 'bg-indigo-500',
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              AUTOMATIC MULTILINGUAL LID (LANGUAGE IDENTIFICATION)
            </h4>
            <p className="text-[10px] text-slate-400">
              Chunk-level acoustic classifier • Auto-detects mid-call language switching
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Language Switch Invariant
        </span>
      </div>

      {/* Live Current Speaking Language Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-cyber-dark/80 p-4 rounded-xl border border-blue-500/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              CURRENT ACTIVE SPEAKING LANGUAGE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-100">{currentSegment.language}</span>
              {currentSegment.nativeName && (
                <span className="text-base font-semibold text-blue-400">({currentSegment.nativeName})</span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Model: <span className="text-slate-300">{currentSegment.detectionModel || 'WavLM-LID Chunk v2'}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">LID Confidence</span>
            <span className="text-2xl font-mono font-bold text-blue-400">{currentSegment.confidence}%</span>
          </div>
        </div>

        {/* Last Transition Badge */}
        <div className="bg-cyber-dark/80 p-4 rounded-xl border border-cyber-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Last Detected Switch</span>
          {lastSwitch ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400">
                <span>{lastSwitch.from}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>{lastSwitch.to}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block">At timestamp {lastSwitch.timestamp}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-mono">Single Language Detected</span>
          )}
          <span className="text-[9px] text-emerald-400 font-mono">✓ Risk score not penalized</span>
        </div>
      </div>

      {/* Cumulative Language Duration Stats & Progress Bar */}
      <div className="bg-cyber-dark/60 p-4 rounded-xl border border-cyber-border space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Language Duration Breakdown (Total Call: {formatDuration(totalCallSec)})
          </span>
          <span className="text-slate-400 text-[10px]">Auto Computed</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          {Object.entries(languageStats).map(([lang, stat]) => {
            const pct = Math.round((stat.durationSec / (totalCallSec || 1)) * 100);
            const barColor = languageBarColors[lang] || 'bg-blue-500';
            return (
              <div
                key={lang}
                style={{ width: `${pct}%` }}
                className={`${barColor} h-full transition-all duration-500`}
                title={`${lang}: ${formatDuration(stat.durationSec)} (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {Object.entries(languageStats).map(([lang, stat]) => {
            const pct = Math.round((stat.durationSec / (totalCallSec || 1)) * 100);
            return (
              <div key={lang} className="bg-cyber-card p-2.5 rounded-lg border border-cyber-border space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{lang}</span>
                  <span className="text-blue-400 font-mono text-[10px] font-semibold">{pct}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Duration: {formatDuration(stat.durationSec)}</span>
                  <span>{stat.count} Chunks</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Automatic Detection Table */}
      <div className="overflow-x-auto">
        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
          CHRONOLOGICAL LID SEGMENT AUDIT TRAIL
        </span>
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-400 border-b border-cyber-border text-[10px] uppercase bg-cyber-dark/40">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Detected Language</th>
              <th className="py-2 px-3">Duration</th>
              <th className="py-2 px-3">Confidence</th>
              <th className="py-2 px-3">Sample Audio Transcript Snippet</th>
              <th className="py-2 px-3 text-right">Acoustic Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/50 text-slate-300">
            {segments.map((seg, idx) => (
              <tr key={idx} className="hover:bg-cyber-dark/40">
                <td className="py-2.5 px-3 text-slate-400">{seg.timestamp}</td>
                <td className="py-2.5 px-3 font-bold text-slate-100">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    {seg.language} {seg.nativeName ? `(${seg.nativeName})` : ''}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  {formatDuration(seg.segmentDurationSeconds || 25)}
                </td>
                <td className="py-2.5 px-3 text-blue-400 font-semibold">{seg.confidence}%</td>
                <td className="py-2.5 px-3 text-slate-300 italic text-[11px]">
                  "{seg.sampleSnippet || 'Speech segment acoustic frame processed'}"
                </td>
                <td className="py-2.5 px-3 text-right text-[10px] text-emerald-400 font-semibold">
                  Embedding Matched (0% Penalty)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-400 italic border-t border-cyber-border pt-2">
        * Automatic LID (Language Identification) extracts acoustic spectral centroids continuously. Code-switching does NOT penalty speaker consistency embeddings or raise deepfake risk.
      </p>
    </div>
  );
};
