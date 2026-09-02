import time
import json
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.anti_spoof import anti_spoof_model
from app.models.speaker_verification import speaker_verification_model
from app.services.risk_service import DeterministicRiskEngine

router = APIRouter(tags=["WebSocket Streaming"])

@router.websocket("/ws/analyze")
@router.websocket("/ws/live-call")
async def websocket_live_analysis(websocket: WebSocket):
    """
    MODE B — Real-Time WebSocket Microphone Streaming Endpoint (/ws/analyze).
    Receives Float32 PCM audio chunks from browser Web Audio API,
    runs real-time PyTorch inference, and returns incremental risk scores.
    """
    await websocket.accept()

    accumulated_pcm = []

    try:
        while True:
            raw_message = await websocket.receive()

            if "bytes" in raw_message:
                chunk_bytes = raw_message["bytes"]
                chunk_pcm = np.frombuffer(chunk_bytes, dtype=np.float32)
                accumulated_pcm.extend(chunk_pcm)
            elif "text" in raw_message:
                data = json.loads(raw_message["text"])
                if "pcm_data" in data:
                    chunk_pcm = np.array(data["pcm_data"], dtype=np.float32)
                    accumulated_pcm.extend(chunk_pcm)

            # Analyze window when 16,000 samples (~1 second) accumulated
            if len(accumulated_pcm) >= 16000:
                signal_array = np.array(accumulated_pcm[-32000:], dtype=np.float32) # Keep 2s sliding window

                # 1. Anti-Spoof Inference
                anti_spoof_res = anti_spoof_model.analyze_audio(signal_array, 16000)

                # 2. Speaker Verification
                speaker_res = speaker_verification_model.verify_speaker(signal_array, "prof_1")

                # 3. Dynamic Risk Engine
                risk_res = DeterministicRiskEngine.calculate_risk(
                    spoof_probability=anti_spoof_res["spoof_probability"],
                    speaker_similarity=speaker_res["speaker_similarity"],
                    liveness_score=90.0,
                    call_context_risk=15.0,
                    transaction_risk=10.0,
                )

                await websocket.send_json({
                    "timestamp": time.strftime("%H:%M:%S"),
                    "spoof_probability": anti_spoof_res["spoof_probability"],
                    "speaker_similarity": speaker_res["speaker_similarity"],
                    "liveness_score": 90.0,
                    "language": "Hindi",
                    "risk_score": risk_res["final_score"],
                    "risk_level": risk_res["level"],
                    "action": risk_res["action"],
                    "prediction": anti_spoof_res["prediction"],
                    "is_real_ai": True,
                })

                # Maintain sliding buffer memory
                accumulated_pcm = accumulated_pcm[-16000:]

    except WebSocketDisconnect:
        pass
