import React, { useState } from 'react';
import { TrustedVoiceProfile } from '../types';
import { StorageService } from '../services/storageService';
import { voiceAnalysisService } from '../services/voiceAnalysisService';
import { UserCheck, Mic, Plus, Trash2, ShieldCheck, RefreshCw, AlertTriangle, Check, Phone } from 'lucide-react';
import { maskPhoneNumber } from '../utils/formatters';

export const VoiceVerificationPage: React.FC = () => {
  const [profiles, setProfiles] = useState<TrustedVoiceProfile[]>(() => StorageService.getTrustedProfiles());
  const [selectedProfile, setSelectedProfile] = useState<TrustedVoiceProfile>(profiles[0]);
  const [similarityScore, setSimilarityScore] = useState(64);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New profile state
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleVerify = async (prof: TrustedVoiceProfile) => {
    setIsVerifying(true);
    const res = await voiceAnalysisService.verifySpeakerProfile(prof.id, similarityScore);
    setIsVerifying(false);
    setSimilarityScore(res.similarity);
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newProf: TrustedVoiceProfile = {
      id: `prof_${Date.now()}`,
      name: newName,
      relationship: newRelation || 'Contact',
      phoneNumber: newPhone,
      status: 'REGISTERED',
      registeredDate: new Date().toISOString().split('T')[0],
      sampleCount: 3,
      embeddingHash: `sha256_${Math.random().toString(36).substr(2, 10)}`,
      lastVerifiedAt: 'Just Now',
    };

    const updated = [newProf, ...profiles];
    setProfiles(updated);
    StorageService.saveTrustedProfiles(updated);
    setSelectedProfile(newProf);
    setIsAddingNew(false);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    StorageService.saveTrustedProfiles(updated);
    if (selectedProfile.id === id && updated.length > 0) {
      setSelectedProfile(updated[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cyber-card border border-cyber-border p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" /> Trusted Voice Profiles & Biometric Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ECAPA-TDNN embedding similarity matching & trusted contact biometric vault
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Trusted Voice Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile List */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            REGISTERED VOICE PROFILES ({profiles.length})
          </h3>

          <div className="space-y-2">
            {profiles.map((prof) => {
              const isSelected = selectedProfile.id === prof.id;
              return (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfile(prof)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-md'
                      : 'bg-cyber-dark/60 border-cyber-border hover:bg-cyber-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-100">{prof.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        prof.status === 'REGISTERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {prof.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
                    <span>{prof.relationship}</span>
                    <span>{maskPhoneNumber(prof.phoneNumber)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Biometric Detail & Similarity Analyzer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProfile && (
            <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedProfile.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedProfile.relationship} • Registered: {selectedProfile.registeredDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(selectedProfile)}
                    disabled={isVerifying}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Verify Speaker</span>
                  </button>

                  <button
                    onClick={() => handleDeleteProfile(selectedProfile.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-colors"
                    title="Delete Voice Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Similarity Meter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-cyber-dark p-5 rounded-xl border border-cyber-border text-center space-y-3">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    CURRENT VOICE SIMILARITY SCORE
                  </span>
                  <div className="text-4xl font-extrabold font-mono text-amber-400">
                    {similarityScore}%
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-bold font-mono ${
                      similarityScore >= 75
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {similarityScore >= 75 ? 'MATCH VERIFIED' : 'MATCH WITH WARNING'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Threshold: &ge;75% required for automatic pass
                  </p>
                </div>

                <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-cyber-border/60 pb-2">
                    <span className="text-slate-400">Embedding Hash:</span>
                    <span className="text-blue-400">{selectedProfile.embeddingHash}</span>
                  </div>
                  <div className="flex justify-between border-b border-cyber-border/60 pb-2">
                    <span className="text-slate-400">Acoustic Samples:</span>
                    <span className="text-slate-200">{selectedProfile.sampleCount} Reference Recordings</span>
                  </div>
                  <div className="flex justify-between border-b border-cyber-border/60 pb-2">
                    <span className="text-slate-400">Last Verified:</span>
                    <span className="text-slate-200">{selectedProfile.lastVerifiedAt || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Future Model API:</span>
                    <span className="text-emerald-400">ECAPA-TDNN / ResNet34</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={() => setSimilarityScore(95)}
                  className="py-2 px-3 rounded bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-xs font-semibold text-slate-200"
                >
                  [Register Voice]
                </button>
                <button
                  onClick={() => handleVerify(selectedProfile)}
                  className="py-2 px-3 rounded bg-cyber-dark hover:bg-slate-800 border border-cyber-border text-xs font-semibold text-slate-200"
                >
                  [Record Sample]
                </button>
                <button
                  onClick={() => handleVerify(selectedProfile)}
                  className="py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  [Verify Speaker]
                </button>
                <button
                  onClick={() => handleDeleteProfile(selectedProfile.id)}
                  className="py-2 px-3 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold"
                >
                  [Delete Profile]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Profile Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleAddProfile} className="bg-cyber-card border border-cyber-border p-6 rounded-xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add Trusted Voice Profile</h3>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Relationship</label>
              <input
                type="text"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="e.g. Brother, Manager"
                className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Phone Number (Mock)</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-xs text-slate-200"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
