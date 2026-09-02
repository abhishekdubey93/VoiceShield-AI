import React from 'react';
import { CallRecord } from '../types';
import { Badge } from '../components/common/Badge';
import { RiskMeter } from '../components/common/RiskMeter';
import { formatCurrency, formatDuration, maskPhoneNumber } from '../utils/formatters';
import { ArrowLeft, Clock, ShieldAlert, FileText, CheckCircle, AlertTriangle, UserCheck, Cpu, PhoneCall, CreditCard } from 'lucide-react';

interface IncidentDetailPageProps {
  call: CallRecord;
  onBack: () => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({ call, onBack }) => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-200 bg-cyber-dark rounded-lg border border-cyber-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Incident Forensics Report: <span className="font-mono text-blue-400">{call.id}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Caller: {call.callerName} ({maskPhoneNumber(call.callerNumber)}) • Started: {call.startTime}
            </p>
          </div>
        </div>

        <Badge level={call.riskBreakdown.level} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline & Signal Deep Dive */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Timeline */}
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Chronological Incident Forensic Timeline
            </h3>

            <div className="relative border-l-2 border-cyber-border ml-3 pl-6 space-y-6">
              {call.incidentTimeline.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-cyber-dark ${
                      evt.severity === 'CRITICAL'
                        ? 'border-red-500 bg-red-500'
                        : evt.severity === 'HIGH'
                        ? 'border-orange-500 bg-orange-500'
                        : evt.severity === 'WARNING'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-blue-500 bg-blue-500'
                    }`}
                  />
                  <div className="bg-cyber-dark/60 border border-cyber-border p-3.5 rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-blue-400">{evt.timestamp}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          evt.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100">{evt.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forensic Signals */}
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              CONTRIBUTING ACOUSTIC & CONTEXT SIGNALS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                <span className="text-[10px] text-slate-400 block">Synthetic Voice</span>
                <span className="text-lg font-bold text-red-400">{call.signals.syntheticProbability}%</span>
              </div>

              <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                <span className="text-[10px] text-slate-400 block">Speaker Consistency</span>
                <span className="text-lg font-bold text-amber-400">{call.signals.speakerConsistency}%</span>
              </div>

              <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                <span className="text-[10px] text-slate-400 block">Liveness Score</span>
                <span className="text-lg font-bold text-blue-400">{call.signals.livenessScore}%</span>
              </div>

              <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                <span className="text-[10px] text-slate-400 block">Call Context Risk</span>
                <span className="text-lg font-bold text-emerald-400">{call.signals.callContextRisk}%</span>
              </div>

              <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                <span className="text-[10px] text-slate-400 block">Transaction Risk</span>
                <span className="text-lg font-bold text-purple-400">{call.signals.transactionRisk}%</span>
              </div>

              <div className="bg-cyber-dark p-3 rounded-lg border border-cyber-border">
                <span className="text-[10px] text-slate-400 block">Total Duration</span>
                <span className="text-lg font-bold text-slate-100">{formatDuration(call.durationSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Risk Meter & Audit Actions */}
        <div className="space-y-6">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl text-center space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">CALCULATED INCIDENT RISK</h4>

            <RiskMeter
              score={call.riskBreakdown.finalScore}
              level={call.riskBreakdown.level}
              actionText={call.riskBreakdown.recommendedAction}
              size="md"
            />

            <div className="bg-cyber-dark p-4 rounded-lg border border-cyber-border text-left space-y-2 text-xs font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Transaction Details</span>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className="text-slate-200 font-bold">{call.transaction.action}</span>
              </div>
              {call.transaction.amount && (
                <div className="flex justify-between text-red-400">
                  <span>Amount:</span>
                  <span className="font-bold">{formatCurrency(call.transaction.amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="text-slate-300">{call.transaction.recipient || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-cyber-dark p-4 rounded-lg border border-cyber-border text-left space-y-2 text-xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Security Actions Executed</span>
              {call.actionsTaken.map((act) => (
                <div key={act.id} className="p-2 rounded bg-cyber-card border border-cyber-border">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-0.5">
                    <span>{act.type}</span>
                    <span className="text-emerald-400">{act.status}</span>
                  </div>
                  <p className="text-slate-200">{act.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
