import { RiskLevel } from '../types';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '+91 ••••• •••••';
  const parts = phone.split(' ');
  if (parts.length >= 2) {
    const lastDigits = parts[parts.length - 1].slice(-2);
    return `${parts[0]} ••••• •••${lastDigits}`;
  }
  return phone.slice(0, 3) + ' ••••• •••' + phone.slice(-2);
}

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'MEDIUM':
      return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    case 'HIGH':
      return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    case 'CRITICAL':
      return 'text-red-400 border-red-500/30 bg-red-500/10';
    default:
      return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  }
}

export function getRiskLevelHex(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return '#10B981';
    case 'MEDIUM':
      return '#F59E0B';
    case 'HIGH':
      return '#F97316';
    case 'CRITICAL':
      return '#EF4444';
  }
}
