import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskLevelColor } from '../../utils/formatters';

interface BadgeProps {
  level?: RiskLevel;
  text?: string;
  variant?: 'risk' | 'status' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ level, text, variant = 'risk', className = '' }) => {
  if (level) {
    const colorStyle = getRiskLevelColor(level);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
        {level} RISK
      </span>
    );
  }

  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'success') {
    style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (variant === 'warning') {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (variant === 'danger') {
    style = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (variant === 'status') {
    style = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
      {text}
    </span>
  );
};
