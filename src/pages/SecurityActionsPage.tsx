import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { AuditService } from '../services/auditService';
import { ShieldCheck, KeyRound, PhoneCall, Lock, UserCheck, Download, Search, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const SecurityActionsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => AuditService.getLogs());
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.actionTaken.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportJson = () => {
    const jsonStr = AuditService.exportLogsAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceshield_audit_logs_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Automated Security Actions & Audit Log Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable security execution logs, step-up MFA, trusted callbacks, and transaction holds
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Export Audit Log JSON
        </button>
      </div>

      {/* Action Capability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <KeyRound className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Step-Up MFA / OTP</h3>
          </div>
          <p className="text-xs text-slate-300">
            Triggers secondary 6-digit passcode authentication when synthetic score crosses 60%.
          </p>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <PhoneCall className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Trusted Callback</h3>
          </div>
          <p className="text-xs text-slate-300">
            Out-of-band cellular dial back to bypass caller ID spoofing and verify subscriber presence.
          </p>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <Lock className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Transaction Hold</h3>
          </div>
          <p className="text-xs text-slate-300">
            Automated hold on transfers and sensitive OTPs when overall risk score &ge;80 CRITICAL.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            SECURITY AUDIT TRAIL LOG ({filteredLogs.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full bg-cyber-dark border border-cyber-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-cyber-dark text-slate-400 border-b border-cyber-border uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Security Event</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cyber-dark/40">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-100">{log.event}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{log.riskScore} / 100</td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">{log.actionTaken}</td>
                  <td className="py-3 px-4 text-slate-400">{log.actor}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {log.status}
                    </span>
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
