import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { realVoiceAnalysisService } from '../services/realVoiceAnalysisService';
import { UserCheck, ShieldCheck, Plus, CheckCircle, Lock, Cpu, Upload } from 'lucide-react';

export const VoiceVerificationPage: React.FC = () => {
  const { t } = useLanguage();
  const [profileName, setProfileName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEnroll = async () => {
    if (!selectedFile || !profileName || !phoneNumber) return;

    setIsEnrolling(true);
    setEnrollStatus(null);

    try {
      const profileId = `prof_${Date.now()}`;
      await realVoiceAnalysisService.enrollVoiceProfile(
        profileId,
        profileName,
        relationship,
        phoneNumber,
        selectedFile
      );
      setEnrollStatus(`Trusted voice profile for "${profileName}" enrolled successfully on PyTorch AI Backend.`);
      setProfileName('');
      setSelectedFile(null);
    } catch (e: any) {
      setEnrollStatus(`Error enrolling profile: ${e.message}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-tight">
              {t('voiceVerificationTitle')}
            </h2>
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              ECAPA-TDNN 128-D EMBEDDINGS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enroll trusted contact voice profiles into PyTorch neural embedding registry for real-time similarity matching.
          </p>
        </div>
      </div>

      {/* Enrollment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" /> ENROLL NEW TRUSTED VOICE PROFILE
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Contact Name:</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Relationship / Tag:</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-2.5 text-slate-100 focus:outline-none"
              >
                <option value="Family">Family Member</option>
                <option value="Executive">Executive / Supervisor</option>
                <option value="Finance Contact">Bank / Finance Authorized</option>
                <option value="Friend">Trusted Friend</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Phone Number:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Enrollment Audio Sample (.wav, .mp3):</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full bg-cyber-dark border border-cyber-border rounded-lg p-2 text-slate-300"
              />
            </div>

            <button
              onClick={handleEnroll}
              disabled={isEnrolling || !selectedFile || !profileName}
              className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors ${
                isEnrolling || !selectedFile || !profileName
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{isEnrolling ? 'Generating Neural Embedding...' : 'Enroll Voice Profile'}</span>
            </button>

            {enrollStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
                ✓ {enrollStatus}
              </div>
            )}
          </div>
        </div>

        {/* Profile List */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> REGISTERED VOICE PROFILES
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-cyber-dark/80 p-4 rounded-xl border border-cyber-border flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-100 text-sm block">Rahul Sharma</span>
                <span className="text-slate-400 text-[10px]">Family • +91 ••••• •••42</span>
                <span className="text-emerald-400 block text-[10px] mt-1">128-d Embedding Saved</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="bg-cyber-dark/80 p-4 rounded-xl border border-cyber-border flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-100 text-sm block">Anita Sharma</span>
                <span className="text-slate-400 text-[10px]">Family • +91 ••••• •••78</span>
                <span className="text-emerald-400 block text-[10px] mt-1">128-d Embedding Saved</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
