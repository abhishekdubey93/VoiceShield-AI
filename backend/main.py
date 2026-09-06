import time

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from services.anti_spoof import AntiSpoofClassifier
from services.audio_processor import AudioProcessor
from services.audio_quality_evaluator import PythonAudioQualityEvaluator
from services.conversation_engine import PythonConversationEngine
from services.liveness_detector import LivenessDetector
from services.risk_engine import DynamicRiskEngine
from services.speaker_verifier import SpeakerVerifier

app = FastAPI(
    title="VoiceShield AI Backend Engine",
    description="Real-time AI Synthetic Voice Detection, Call Protection Sessions & Risk Engine API",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
ACTIVE_SESSIONS = {}

class StartSessionRequest(BaseModel):
    caller_name: str
    caller_number: str
    caller_type: Optional[str] = "SAVED_CONTACT"

class SessionEventRequest(BaseModel):
    session_id: str
    transcript_chunk: Optional[str] = ""
    synthetic_probability: Optional[float] = 10.0
    speaker_consistency: Optional[float] = 90.0
    noise_level: Optional[float] = 20.0
    background_noise_type: Optional[str] = "NORMAL"

class RiskRequest(BaseModel):
    synthetic_probability: float
    speaker_consistency: float
    liveness_score: float
    call_context_risk: Optional[float] = 15.0
    transaction_risk: Optional[float] = 10.0
    caller_type: Optional[str] = "SAVED_CONTACT"
    audio_quality: Optional[str] = "EXCELLENT"
    detected_categories: Optional[List[str]] = []
    weights: Optional[dict] = None

class SpeakerVerifyRequest(BaseModel):
    profile_id: str
    target_similarity: Optional[float] = 64.0

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "VoiceShield AI Backend Protection Engine",
        "models_loaded": {
            "anti_spoof_classifier": "DSP-Spectral-Vocoder-v1",
            "speaker_verifier": "MFCC-Cosine-Similarity-v1",
            "liveness_detector": "RMS-DynamicRange-v1",
            "risk_engine": "Centralized-Dynamic-Risk-Engine-v2.4",
            "conversation_engine": "NaturalLanguage-Threat-Classifier-v1",
        },
        "target_latency_ms": 300,
    }

@app.post("/api/call/session/start")
def start_call_session(req: StartSessionRequest):
    session_id = f"session_{int(time.time() * 1000)}"
    session_data = {
        "session_id": session_id,
        "caller_name": req.caller_name,
        "caller_number": req.caller_number,
        "caller_type": req.caller_type or "SAVED_CONTACT",
        "start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "state": "CALL_ACTIVE",
        "transcript": "",
        "detected_categories": [],
        "last_risk_result": None,
    }
    ACTIVE_SESSIONS[session_id] = session_data
    return {"status": "SUCCESS", "session_id": session_id, "session": session_data}

@app.post("/api/call/session/event")
def process_session_event(req: SessionEventRequest):
    if req.session_id not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=404, detail="Call session not found")

    session = ACTIVE_SESSIONS[req.session_id]
    if req.transcript_chunk:
        session["transcript"] += " " + req.transcript_chunk

    intent_res = PythonConversationEngine.analyze_text(session["transcript"])
    current_cats = set(session["detected_categories"])
    current_cats.update(intent_res["detected_categories"])
    session["detected_categories"] = list(current_cats)

    quality_eval = PythonAudioQualityEvaluator.evaluate_quality(req.noise_level or 20.0, req.background_noise_type or "NORMAL")

    risk_res = DynamicRiskEngine.calculate_risk(
        synthetic_probability=req.synthetic_probability or 10.0,
        speaker_consistency=req.speaker_consistency or 90.0,
        liveness_score=90.0,
        caller_type=session["caller_type"],
        audio_quality=quality_eval["grade"],
        detected_categories=session["detected_categories"],
    )

    session["last_risk_result"] = risk_res
    return {
        "status": "SUCCESS",
        "session_id": req.session_id,
        "audio_quality": quality_eval,
        "intent_analysis": intent_res,
        "risk_result": risk_res,
    }

@app.post("/api/call/session/end")
def end_call_session(session_id: str):
    if session_id not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=404, detail="Call session not found")

    session = ACTIVE_SESSIONS.pop(session_id)
    session["state"] = "COMPLETED"
    session["end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")

    return {
        "status": "SUCCESS",
        "message": "Call protection session ended successfully",
        "final_report": session,
    }

@app.get("/api/call/session/{session_id}")
def get_session_status(session_id: str):
    if session_id not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=404, detail="Call session not found")
    return ACTIVE_SESSIONS[session_id]

@app.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    start_time = time.time()
    audio_bytes = await file.read()
    pcm_signal, sample_rate = AudioProcessor.decode_wav_bytes(audio_bytes)
    anti_spoof_result = AntiSpoofClassifier.analyze_synthetic_voice(pcm_signal, sample_rate)
    speaker_result = SpeakerVerifier.verify_speaker(pcm_signal, "prof_1", sample_rate)
    liveness_result = LivenessDetector.analyze_liveness(pcm_signal, sample_rate)

    risk_result = DynamicRiskEngine.calculate_risk(
        synthetic_probability=anti_spoof_result["synthetic_probability"],
        speaker_consistency=speaker_result["similarity"],
        liveness_score=liveness_result["liveness_score"],
    )
    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "file_name": file.filename,
        "duration_seconds": round(len(pcm_signal) / (sample_rate or 16000), 2),
        "latency_ms": elapsed_ms,
        "signals": {
            "syntheticProbability": anti_spoof_result["synthetic_probability"],
            "speakerConsistency": speaker_result["similarity"],
            "livenessScore": liveness_result["liveness_score"],
        },
        "risk_breakdown": risk_result,
    }

@app.post("/api/risk/calculate")
def calculate_risk(req: RiskRequest):
    return DynamicRiskEngine.calculate_risk(
        synthetic_probability=req.synthetic_probability,
        speaker_consistency=req.speaker_consistency,
        liveness_score=req.liveness_score,
        call_context_risk=req.call_context_risk or 15.0,
        transaction_risk=req.transaction_risk or 10.0,
        weights=req.weights,
        caller_type=req.caller_type or "SAVED_CONTACT",
        audio_quality=req.audio_quality or "EXCELLENT",
        detected_categories=req.detected_categories or [],
    )
