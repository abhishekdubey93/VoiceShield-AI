import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskLevelHex } from '../../utils/formatters';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  actionText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level, actionText, size = 'md' }) => {
  const hexColor = getRiskLevelHex(level);

  const dimensions = size === 'sm' ? 140 : size === 'lg' ? 240 : 190;
  const strokeWidth = size === 'sm' ? 12 : size === 'lg' ? 18 : 15;
  const radius = (dimensions - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions, height: dimensions }}>
        <svg className="transform -rotate-90" width={dimensions} height={dimensions}>
          {/* Background Track */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Ring */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke={hexColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400">Risk Score</span>
          <span className="font-extrabold tracking-tight" style={{ fontSize: size === 'sm' ? '1.75rem' : size === 'lg' ? '3rem' : '2.25rem', color: hexColor }}>
            {score}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
          <span className="mt-1 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${hexColor}20`, color: hexColor }}>
            {level}
          </span>
        </div>
      </div>

      {actionText && (
        <div className="mt-4 p-2.5 rounded-lg bg-cyber-dark/80 border border-cyber-border text-center max-w-xs">
          <span className="text-xs text-slate-400 block font-mono uppercase mb-0.5">Recommended Protection Action</span>
          <span className="text-xs font-medium text-slate-200">{actionText}</span>
        </div>
      )}
    </div>
  );
};
