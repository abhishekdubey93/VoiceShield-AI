# VoiceShield AI — Real-Time AI Voice Impersonation Defense

> **Tagline:** "Real-Time AI Voice Impersonation Defense"  
> **Core Concept:** *"VoiceShield doesn't simply ask 'Is this voice fake?' — it evaluates the entire interaction: HOW RISKY IS THIS INTERACTION, and WHAT SHOULD HAPPEN NEXT?"*

---

## 🛡️ Problem & Solution

### Problem
AI-generated and cloned voices can seamlessly impersonate trusted individuals (family members, executive officers, banking agents) during phone calls and social-engineering attacks. Caller ID alone is vulnerable to SIP spoofing. Traditional single-factor "deepfake detectors" fail when genuine voices are coerced into high-risk transactions.

### Solution
**VoiceShield AI** provides a dynamic multi-vector defense pipeline that analyzes live voice streams, checks acoustic liveness, verifies speaker embedding consistency across multilingual code switches, evaluates transaction sensitivity, calculates a real-time weighted risk score (0–100), and triggers automated security protections.

```
VOICE → Preprocessing → Language ID → AI/Synthetic Detection → Speaker Verification → Liveness → Context → Risk Engine (0-100) → Protection Action
```

---

## ⚡ Technology Stack

- **Frontend Core:** React 18, TypeScript 5, Vite 6
- **Styling:** Vanilla Tailwind CSS with curated cyber dark palette & risk color tokens
- **Icons & UI:** Lucide React icons, Custom HTML5 Canvas audio waveform visualizer
- **Charts:** Recharts
- **Audio Stream API:** Web Audio API (MediaStream, AudioContext, AnalyserNode)
- **State Persistence:** LocalStorage for demo history, trusted voice profiles, custom weights, and security audit logs

---

## 🚀 How to Run & Build

### Prerequisites
Node.js (v18+) and npm.

### Installation & Development Server
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

### Production Build
```bash
# Compile TypeScript & bundle production build
npm run build
```

---

## 🎯 5 Hackathon Demo Scenarios

1. **Safe Family Call**: Genuine voice, matching profile, low synthetic score, routine conversation. Risk score: ~18 (LOW). Action: Continue call.
2. **Suspicious AI Voice**: Neural TTS artifacts detected (78% synthetic probability), unverified caller ID. Risk score: ~76 (HIGH). Action: Step-up verification required.
3. **Voice Clone Scam**: High synthetic probability (92%), speaker mismatch, urgent ₹75,000 transfer to unfamiliar beneficiary. Risk score: 92 (CRITICAL). Action: Automatic **TRANSACTION HOLD** + Step-Up MFA + Challenge.
4. **Multilingual Code Switching**: Caller transitions between Hindi → English → Hindi → Bhojpuri. Demonstrates that language switching does NOT falsely elevate risk scores while acoustic invariance is preserved.
5. **Genuine Voice + Sensitive Transaction**: Voice is genuine (94% similarity match), but caller requests sensitive banking OTP sharing under coercion. Demonstrates that transaction context raises risk even when the voice is authentic.

---

## ⏱️ 3-Minute Hackathon Live Presentation Flow

1. Open **Dashboard** → Highlight global telemetry cards & main **Current Call Risk Meter**.
2. Launch **Demo Control Center** → Select scenario **VOICE CLONE SCAM**.
3. Navigate to **Live Call Monitor** → Show live audio waveform & language detection timeline (Hindi).
4. Observe code switch to English → Explain that language transition does not penalize baseline risk.
5. Observe synthetic probability spike to 92% and speaker consistency drop to 54%.
6. Caller requests ₹75,000 transfer → Transaction context risk elevates score past 80 (CRITICAL).
7. System automatically triggers **TRANSACTION HOLD**.
8. Operator initiates **Liveness Challenge** ("47 blue mango") → Simulate liveness failure → Keep transaction blocked.
9. Open **Incident Forensics** & **Security Audit Log** → Show explainable AI breakdown (*Why is this interaction risky?*).

---

## 🔬 Architecture: Current Demo vs. Future Real AI Models

> [!IMPORTANT]
> **Hackathon Demo Transparency**:
> Simulated inference outputs are clearly labeled **DEMO AI ANALYSIS**. Clean TypeScript service interfaces (`IVoiceAnalysisService`) allow seamless replacement with real deepfake classifiers.

| Pipeline Component | Current Hackathon Demo Implementation | Future Real Production Architecture |
| :--- | :--- | :--- |
| **Synthetic Detection** | `DemoVoiceAnalysisService` mock spectral phase rules | **WavLM Large** / **wav2vec 2.0** anti-spoof model |
| **Speaker Verification** | Simulated vector similarity | **ECAPA-TDNN** 512-d embedding extractor |
| **Liveness Analysis** | Turn-taking timing & pass-phrase match | ResNet-based continuous prosodic liveness classifier |
| **Backend API** | Client-side React state + LocalStorage | **FastAPI** + **WebSockets** (`/ws/live-call`) + PostgreSQL |
| **Deployment** | Client browser Web Audio API | **Edge-Ready ONNX Runtime** near-device deployment |

---

## 🔒 Privacy & Security Design

- **Zero Raw Voice Storage Policy**: Transient PCM audio buffers are discarded immediately after feature extraction.
- **Hashed Biometric Embeddings**: Voice profiles store non-reconstructible mathematical hashes.
- **Audit Compliance**: Every security action generates a timestamped entry in the audit trail.
