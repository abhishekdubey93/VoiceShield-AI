import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { LanguageCode, LanguageSegment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageTimelineProps {
  segments: LanguageSegment[];
  onManualLanguageSwitch?: (lang: LanguageCode) => void;
}

export const LanguageTimeline: React.FC<LanguageTimelineProps> = ({
  segments,
  onManualLanguageSwitch,
}) => {
  const { t } = useLanguage();

  const lastSwitch =
    segments.length >= 2
      ? `${segments[segments.length - 2].language} → ${segments[segments.length - 1].language}`
      : null;

  const availableLanguages: LanguageCode[] = [
    'Hindi',
    'English',
    'Bhojpuri',
    'Bengali',
    'Marathi',
    'Tamil',
    'Telugu',
    'Gujarati',
    'Kannada',
  ];

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 shadow-md space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {t('codeSwitchingTitle')}
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Language Switch Risk Invariant
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-snug">
        {t('codeSwitchingDesc')} ({t('switchNotice')})
      </p>

      {lastSwitch && (
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-center justify-between font-mono">
          <span>Active Code-Switch Detected:</span>
          <span className="font-bold flex items-center gap-1 text-blue-400">
            {lastSwitch}
          </span>
        </div>
      )}

      {/* Interactive Mid-Call Code-Switch Simulator Buttons */}
      {onManualLanguageSwitch && (
        <div className="bg-cyber-dark/60 p-3 rounded-lg border border-cyber-border space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
            {t('simulateLanguageSwitch')} (Click to Trigger Mid-Call Language Change):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableLanguages.map((lang) => {
              const isCurrent = segments[segments.length - 1]?.language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onManualLanguageSwitch(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-cyber-card hover:bg-blue-600/30 text-slate-300 border border-cyber-border'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Segment Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-500 border-b border-cyber-border text-[10px] uppercase">
              <th className="pb-1.5">Timestamp</th>
              <th className="pb-1.5">Language</th>
              <th className="pb-1.5">Confidence</th>
              <th className="pb-1.5 text-right">Acoustic Model Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/50 text-slate-300">
            {segments.map((seg, idx) => (
              <tr key={idx} className="hover:bg-cyber-dark/40">
                <td className="py-2 text-slate-400">{seg.timestamp}</td>
                <td className="py-2 font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  {seg.language}
                </td>
                <td className="py-2">
                  <span className="text-blue-400 font-semibold">{seg.confidence}%</span>
                </td>
                <td className="py-2 text-right text-[10px] text-emerald-400">
                  Feature Vector Adapted (Risk Baseline Preserved)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
