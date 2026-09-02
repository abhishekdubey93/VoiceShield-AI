import React, { useState } from 'react';
import { CallRecord, RiskLevel } from '../types';
import { Badge } from '../components/common/Badge';
import { formatDuration, maskPhoneNumber } from '../utils/formatters';
import { History, Search, Filter, ArrowUpDown, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CallHistoryPageProps {
  callHistory: CallRecord[];
  onSelectCall: (call: CallRecord) => void;
}

export const CallHistoryPage: React.FC<CallHistoryPageProps> = ({ callHistory, onSelectCall }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'risk' | 'duration'>('date');

  const filteredCalls = callHistory.filter((call) => {
    const matchesSearch =
      call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.callerNumber.includes(searchQuery) ||
      call.primaryLanguage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || call.riskBreakdown.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const sortedCalls = [...filteredCalls].sort((a, b) => {
    if (sortBy === 'risk') {
      return b.riskBreakdown.finalScore - a.riskBreakdown.finalScore;
    } else if (sortBy === 'duration') {
      return b.durationSeconds - a.durationSeconds;
    }
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" /> Historical Call Threat Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete archive of analyzed voice interactions, synthetic probability scores, and protection interventions
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-cyber-dark px-3 py-1.5 rounded-lg border border-cyber-border">
          Total Archived Records: <strong className="text-slate-100">{callHistory.length}</strong>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by caller, phone, language..."
            className="w-full bg-cyber-dark border border-cyber-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5" /> Filter Risk:
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as RiskLevel | 'ALL')}
              className="bg-cyber-dark border border-cyber-border rounded text-xs text-slate-200 px-2 py-1 focus:outline-none"
            >
              <option value="ALL">ALL LEVELS</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'risk' | 'duration')}
              className="bg-cyber-dark border border-cyber-border rounded text-xs text-slate-200 px-2 py-1 focus:outline-none"
            >
              <option value="date">Newest Date</option>
              <option value="risk">Highest Risk</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-cyber-dark text-slate-400 border-b border-cyber-border uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Caller Identity</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Language Detected</th>
                <th className="py-3 px-4">Synthetic Prob</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Band</th>
                <th className="py-3 px-4">Protection Action</th>
                <th className="py-3 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border text-slate-300">
              {sortedCalls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call)}
                  className="hover:bg-cyber-dark/60 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-100">
                    <div>{call.callerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{maskPhoneNumber(call.callerNumber)}</div>
                  </td>
                  <td className="py-3.5 px-4">{formatDuration(call.durationSeconds)}</td>
                  <td className="py-3.5 px-4 text-blue-400 font-semibold">{call.primaryLanguage}</td>
                  <td className="py-3.5 px-4 font-bold text-red-400">{call.signals.syntheticProbability}%</td>
                  <td className="py-3.5 px-4 font-bold text-slate-100 text-sm">
                    {call.riskBreakdown.finalScore} / 100
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge level={call.riskBreakdown.level} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    {call.actionsTaken[0]?.type || 'CONTINUE'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 p-1 font-semibold flex items-center gap-1 justify-end ml-auto">
                      Forensics <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
