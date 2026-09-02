import React from 'react';
import { Lock, Shield, Cpu, Server, CheckCircle, AlertCircle, HardDrive, EyeOff } from 'lucide-react';

export const PrivacySecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" /> Privacy Center & Edge Architecture Design
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero raw-audio storage retention, near-device acoustic feature extraction, and privacy-preserving metadata streams
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <span>Zero Raw Voice Storage Policy</span>
        </div>
      </div>

      {/* Privacy Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-emerald-400">
            <span>RAW AUDIO RETENTION</span>
            <span>OFF</span>
          </div>
          <p className="text-xs text-slate-300">
            Raw voice streams are processed in transient memory buffers and discarded immediately after feature extraction.
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">Design Capability & Implemented</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-blue-400">
            <span>FEATURE RETENTION</span>
            <span>LIMITED (HASHED)</span>
          </div>
          <p className="text-xs text-slate-300">
            Only non-reconstructible 512-d mathematical voice embeddings are saved for registered profiles.
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">Design Capability</span>
        </div>

        <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-purple-400">
            <span>END-TO-END ENCRYPTION</span>
            <span>DEMO MODE</span>
          </div>
          <p className="text-xs text-slate-300">
            TLS 1.3 encrypted metadata WebSocket pipeline planned for production server integration.
          </p>
          <span className="text-[10px] text-amber-400 font-mono block">Currently Demo Simulated</span>
        </div>
      </div>

      {/* Edge Architecture Visualization */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              EDGE-READY DEPLOYMENT ARCHITECTURE
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            NEAR-DEVICE INFERENCE
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Future deployment moves acoustic feature extraction and lightweight ONNX inference to the near-device edge gateway. Only minimal 128-byte risk metadata payloads are transmitted to cloud orchestrators.
        </p>

        {/* Diagram Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">STEP 1</span>
            <span className="text-xs font-bold text-slate-100 block">Voice Stream</span>
            <p className="text-[10px] text-slate-400">Handset microphone input</p>
          </div>

          <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">STEP 2</span>
            <span className="text-xs font-bold text-blue-400 block">Near-Device Preprocess</span>
            <p className="text-[10px] text-slate-400">VAD & Mel-spectrogram</p>
          </div>

          <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">STEP 3</span>
            <span className="text-xs font-bold text-purple-400 block">AI Inference</span>
            <p className="text-[10px] text-slate-400">WavLM / Anti-spoof ONNX</p>
          </div>

          <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">STEP 4</span>
            <span className="text-xs font-bold text-emerald-400 block">Risk Engine</span>
            <p className="text-[10px] text-slate-400">Weighted score computation</p>
          </div>

          <div className="bg-cyber-dark p-3.5 rounded-lg border border-cyber-border text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">STEP 5</span>
            <span className="text-xs font-bold text-amber-400 block">Minimal Metadata</span>
            <p className="text-[10px] text-slate-400">128-byte JSON payload</p>
          </div>
        </div>
      </div>
    </div>
  );
};
