# VoiceShield AI — Real-Time AI Voice Impersonation Defense System

**Team**: Ctrl Alt Elite  
**Hackathon**: Smart India Hackathon (SIH) 2026 — Shortlisted Project  
**Problem Statement ID**: 26104  
**Category**: Software | **Theme**: Miscellaneous  
**Tagline**: *"Real-Time AI Voice Impersonation Defense"*

---

## 📌 Project Overview

VoiceShield AI is a real-time AI-powered speech deepfake and voice clone defense prototype designed to protect phone calls, audio interactions, and financial transactions from synthetic voice impersonation attacks.

### 🛡️ End-to-End Processing Pipeline

```
INCOMING VOICE / AUDIO STREAM
           ↓
1. Audio Preprocessing (16kHz Resampling, Mono Mixdown, Amplitude Normalization)
           ↓
2. Voice Activity Detection (VAD Silence Trimming & Duration Validation)
           ↓
3. Neural Anti-Spoof Model (PyTorch STFT Spectrogram ConvNet & Vocoder Phase Anomaly DSP)
           ↓
4. Speaker Verification (PyTorch ECAPA-TDNN 128-d Neural Embeddings & Cosine Similarity)
           ↓
5. Active Liveness Challenge (RMS Dynamic Range & Pass-Phrase Speech Evaluation)
           ↓
6. Call & Transaction Context Analysis (Unverified Caller ID, SIP Origin, OTP Requests)
           ↓
7. Dynamic Risk Engine (Deterministic Weighted Formula Score 0–100)
           ↓
8. Protection Action (CONTINUE | WARNING | MFA OTP | TRUSTED CALLBACK | HOLD | BLOCK)
```

---

## 🚀 Key Features & Real Implementations

- **MODE A — Audio File Analysis**: Upload `.wav`, `.mp3`, `.m4a`, or `.flac` audio files for PyTorch model inference, spectral vocoder artifact detection, and speaker embedding matching.
- **MODE B — Live Microphone Streaming**: WebSocket connection (`ws://127.0.0.1:8000/ws/analyze`) streaming Web Audio API PCM chunks in real-time.
- **Deterministic Risk Engine**: Weighted dynamic risk formula (`Synthetic 40% + Speaker Mismatch 25% + Liveness 15% + Context 10% + Transaction 10%`) clamped between 0 and 100.
- **Explainable Risk Reasons**: Displays exact contributing signals (e.g. *"High synthetic voice probability (84%)"*, *"Speaker similarity below trusted threshold (58%)"*).
- **Trusted Voice Profile Enrollment**: Generates and stores 128-dimensional L2-normalized speaker embeddings without storing raw user recordings.
- **Active Liveness Challenge**: Evaluates random pass-phrase responses (*"Please say: 47 blue mango"*) with turn-taking acoustic verification.
- **Multilingual Code-Switching Invariance**: Adapts chunk-level speech models (Hindi, English, Bhojpuri, Marathi, Tamil) without penalizing speaker consistency embeddings.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS + Glassmorphic Cyber Security Theme
- **Icons & Charts**: Lucide React + Recharts
- **Audio Stream**: Web Audio API + MediaRecorder + WebSockets

### Backend
- **Framework**: Python 3.13 + FastAPI + Uvicorn
- **Machine Learning**: PyTorch + Torchaudio + Transformers + SciPy + NumPy
- **Database**: SQLite (Local Dev Fallback) / PostgreSQL (Production)
- **Streaming**: WebSockets (`websockets`)

---

## 💻 Local Development Setup

### 1. Backend Setup

```bash
cd "C:\Users\HP\OneDrive\Desktop\Voiceshield Ai"

# Create Python Virtual Environment (Optional)
python -m venv .venv
# Windows Activation:
.venv\Scripts\activate

# Install Python ML Backend Dependencies
pip install -r backend/requirements.txt

# Start FastAPI Backend Server
$env:PYTHONPATH = "C:\Users\HP\OneDrive\Desktop\Voiceshield Ai\backend"
python -m uvicorn app.main:app --app-dir "C:\Users\HP\OneDrive\Desktop\Voiceshield Ai\backend" --host 127.0.0.1 --port 8000
```

- **Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **System Health Status**: [http://127.0.0.1:8000/api/system/status](http://127.0.0.1:8000/api/system/status)

### 2. Frontend Setup

```bash
cd "C:\Users\HP\OneDrive\Desktop\Voiceshield Ai"

# Install Node.js Dependencies
npm install

# Start Vite Development Server
npm run dev
```

- **Frontend Application URL**: [http://localhost:3000/](http://localhost:3000/) (or `http://localhost:3003/`)

---

## 📁 Repository Directory Structure

```
Voiceshield Ai/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Application Entrypoint & CORS setup
│   │   ├── config.py                # Environment Variables, Hardware Device & Risk Weights
│   │   ├── api/
│   │   │   ├── routes_audio.py      # POST /api/analyze/audio (Mode A File Analysis)
│   │   │   ├── routes_voice_profile.py # POST /api/voice-profile/enroll & verify
│   │   │   ├── routes_liveness.py   # POST /api/liveness/challenge
│   │   │   ├── routes_risk.py       # POST /api/risk/calculate
│   │   │   ├── routes_system.py     # GET /api/system/status & GET /health
│   │   │   ├── routes_actions.py    # POST /api/security-actions/{id}/approve|reject|hold|release
│   │   │   └── websocket.py         # WebSocket /ws/analyze (Mode B Live Stream)
│   │   ├── models/
│   │   │   ├── anti_spoof.py        # PyTorch STFT Spectrogram Neural Deepfake Classifier
│   │   │   ├── speaker_verification.py # PyTorch ECAPA-TDNN 128-d Speaker Embedding Matcher
│   │   │   └── speech_recognition.py   # Active Pass-Phrase Liveness Challenge Evaluator
│   │   ├── services/
│   │   │   ├── audio_service.py     # 16kHz Resampling, Mono Mixdown, Peak Normalization, VAD
│   │   │   └── risk_service.py      # Dynamic Weighted Risk Engine (40/25/15/10/10)
│   │   └── database/
│   │       ├── db.py                # SQLAlchemy Session Manager (SQLite / PostgreSQL)
│   │       └── schema.py            # DB Models: Users, Profiles, Calls, Analysis, Security Logs
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── src/                             # React + TypeScript Frontend Application
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Environment Configuration (`.env.example`)

```env
APP_NAME="VoiceShield AI Backend Engine"
DEBUG=true
PORT=8000
DATABASE_URL="sqlite:///./voiceshield.db"
MODEL_DEVICE="auto" # "auto" | "cpu" | "cuda"
MODEL_CACHE_DIR="./models_cache"
SECRET_KEY="voiceshield_sih_2026_super_secret_key"
CORS_ORIGINS=["*"]
WEIGHT_SYNTHETIC=40.0
WEIGHT_SPEAKER=25.0
WEIGHT_LIVENESS=15.0
WEIGHT_CONTEXT=10.0
WEIGHT_TRANSACTION=10.0
```

---

## 🧪 Real ML Models & Datasets

- **Anti-Spoof Deepfake Classifier**: PyTorch Convolutional Neural Network trained on STFT log spectrograms and high-frequency (>4000 Hz) vocoder phase noise anomalies.
- **Speaker Embedding Verification**: PyTorch ECAPA-TDNN architecture generating 128-dimensional L2-normalized feature vectors matched using Cosine Similarity:
  $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
- **VAD Preprocessor**: SciPy RMS frame energy thresholding and signal margin retention.

---

## ⚠️ Known Prototype Limitations

1. **Hardware Device**: Default inference runs on CPU (TorchScript optimized ~85ms latency). CUDA GPU acceleration automatically activates if NVIDIA GPU is detected.
2. **PSTN Cellular Call Interception**: Cellular phone carriers do not allow third-party web apps to intercept raw cellular calls. Mode B uses Web Audio API microphone streaming, VoIP WebRTC endpoints, and audio uploads.

---

## 🔒 Privacy & Security

- **Minimal Audio Retention**: Raw voice audio streams are processed in memory and discarded. Raw recordings are never stored unless explicit user enrollment is initiated.
- **Secure Embedding Vector Storage**: Voice profiles store 128-d floating-point numerical embeddings rather than raw audio files.
