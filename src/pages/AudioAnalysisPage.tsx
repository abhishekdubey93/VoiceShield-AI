import React, { useState } from 'react';
import { voiceAnalysisService, FileAnalysisResult } from '../services/voiceAnalysisService';
import { useMicrophone } from '../hooks/useMicrophone';
import { Waveform } from '../components/common/Waveform';
import { RiskMeter } from '../components/common/RiskMeter';
import { UploadCloud, Mic, FileAudio, RefreshCw, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { RiskEngine } from '../services/riskEngine';

export const AudioAnalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isActive: isMicActive, audioLevel, error: micError, startMicrophone, stopMicrophone } = useMicrophone();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['wav', 'mp3', 'm4a'].includes(ext || '')) {
      setErrorMessage('Unsupported format. Please upload .wav, .mp3, or .m4a files.');
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('File is empty (0 bytes). Please upload a valid audio recording.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await voiceAnalysisService.analyzeAudioFile(selectedFile);
      setAnalysisResult(res);
    } catch {
      setErrorMessage('Failed to analyze audio file. Demo inference error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cyber-card border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100">Audio File Inspection & Web Audio API Mic Stream</h2>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              DEMO MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload offline recordings (.wav, .mp3) or enable real-time browser microphone stream
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: File Upload Inspector */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-cyber-border pb-3">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Audio Recording File Inspector
            </h3>
          </div>

          <div className="border-2 border-dashed border-cyber-border rounded-xl p-6 text-center bg-cyber-dark/40 hover:border-blue-500/50 transition-colors">
            <input
              type="file"
              accept=".wav,.mp3,.m4a"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload-input"
            />
            <label htmlFor="audio-upload-input" className="cursor-pointer space-y-2 block">
              <FileAudio className="w-10 h-10 text-slate-500 mx-auto" />
              <span className="text-xs font-semibold text-slate-200 block">
                Click to browse or drop audio file (.wav, .mp3, .m4a)
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">Max size: 50MB</span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {selectedFile && (
            <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">File Name:</span>
                <span className="text-slate-100 font-bold">{selectedFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Size:</span>
                <span className="text-blue-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>

              <Waveform isActive={true} height={40} color="#3B82F6" />

              <button
                onClick={handleAnalyzeFile}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>{isAnalyzing ? 'Running VoiceShield Analysis...' : 'Analyze Audio File'}</span>
              </button>
            </div>
          )}

          {analysisResult && (
            <div className="bg-cyber-dark/80 p-5 rounded-xl border border-cyber-border space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-2">
                <span className="text-xs font-bold text-slate-200">DEMO AI ANALYSIS REPORT</span>
                <span className="text-[10px] font-mono text-emerald-400">COMPLETE</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-cyber-card rounded border border-cyber-border">
                  <span className="text-[10px] text-slate-400 block">Synthetic Prob</span>
                  <span className="text-base font-bold text-red-400">{analysisResult.signals.syntheticProbability}%</span>
                </div>
                <div className="p-2.5 bg-cyber-card rounded border border-cyber-border">
                  <span className="text-[10px] text-slate-400 block">Speaker Similarity</span>
                  <span className="text-base font-bold text-amber-400">{analysisResult.signals.speakerConsistency}%</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Detected Indicators</span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-1">
                    <span className={analysisResult.detectedIndicators.spectralAnomaly ? 'text-red-400' : 'text-emerald-400'}>●</span>
                    <span>Spectral Anomaly</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={analysisResult.detectedIndicators.prosodicInconsistency ? 'text-red-400' : 'text-emerald-400'}>●</span>
                    <span>Prosodic Flattening</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Box 2: Real Microphone Visualizer */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Live Microphone Web Audio API Capture
              </h3>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              BROWSER API
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Captures real-time audio input from your microphone using the HTML5 Web Audio API. Visualizes frequency amplitude spectrum.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-amber-300 text-xs font-mono">
            <span className="font-bold block">DEMO MODE DISCLAIMER</span>
            Real-time audio capture active. Deepfake classification on live mic uses simulated demonstration inference.
          </div>

          {micError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              Microphone error: {micError}
            </div>
          )}

          <div className="bg-cyber-dark p-5 rounded-xl border border-cyber-border space-y-4 text-center">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>Status: {isMicActive ? 'RECORDING ACTIVE' : 'INACTIVE'}</span>
              <span>Audio Level: {audioLevel}%</span>
            </div>

            <Waveform isActive={isMicActive} audioLevel={audioLevel} barCount={42} height={60} color="#10B981" />

            {!isMicActive ? (
              <button
                onClick={startMicrophone}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" /> Enable Microphone Capture
              </button>
            ) : (
              <button
                onClick={stopMicrophone}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" /> Stop Microphone Stream
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
