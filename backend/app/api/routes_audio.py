import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.audio_service import AudioPreprocessingService
from app.models.anti_spoof import anti_spoof_model
from app.models.speaker_verification import speaker_verification_model
from app.models.speech_recognition import ChallengeLivenessEvaluator
from app.services.risk_service import DeterministicRiskEngine

router = APIRouter(prefix="/api/analyze", tags=["Audio Analysis"])

@router.post("/audio")
async def analyze_audio_file(
    file: UploadFile = File(...),
    target_profile_id: str = Form("prof_1"),
    call_context_risk: float = Form(15.0),
    transaction_risk: float = Form(10.0),
):
    """
    MODE A — Real Audio File Analysis (.wav, .mp3, .m4a, .flac)
    Performs resampling to 16kHz, mono conversion, VAD silence trimming,
    and runs PyTorch anti-spoof inference, speaker verification, liveness check, and risk engine.
    """
    start_time = time.time()
    audio_bytes = await file.read()

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Audio file is empty (0 bytes).")

    # 1. Real Audio Preprocessing & VAD Trimming
    pcm_signal, sample_rate, prep_metadata = AudioPreprocessingService.process_audio_bytes(audio_bytes)

    if not prep_metadata["is_valid_speech"]:
        raise HTTPException(
            status_code=400,
            detail=f"Audio duration ({prep_metadata['duration_seconds']}s) is too short or contains no active speech.",
        )

    # 2. Real PyTorch Neural Anti-Spoof Detection
    t_anti_spoof = time.time()
    anti_spoof_res = anti_spoof_model.analyze_audio(pcm_signal, sample_rate)
    anti_spoof_ms = round((time.time() - t_anti_spoof) * 1000, 2)

    # 3. Real PyTorch Speaker Embedding Verification
    t_speaker = time.time()
    speaker_res = speaker_verification_model.verify_speaker(pcm_signal, target_profile_id)
    speaker_ms = round((time.time() - t_speaker) * 1000, 2)

    # 4. Real Liveness Evaluation
    t_liveness = time.time()
    liveness_res = ChallengeLivenessEvaluator.evaluate_challenge_response(pcm_signal, "47 blue mango", sample_rate)
    liveness_ms = round((time.time() - t_liveness) * 1000, 2)

    liveness_score = 90.0 if liveness_res["liveness_passed"] else 45.0

    # 5. Real Deterministic Risk Engine Calculation
    t_risk = time.time()
    risk_res = DeterministicRiskEngine.calculate_risk(
        spoof_probability=anti_spoof_res["spoof_probability"],
        speaker_similarity=speaker_res["speaker_similarity"],
        liveness_score=liveness_score,
        call_context_risk=call_context_risk,
        transaction_risk=transaction_risk,
    )
    risk_ms = round((time.time() - t_risk) * 1000, 2)

    total_latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "file_name": file.filename,
        "file_size_bytes": len(audio_bytes),
        "duration_seconds": prep_metadata["duration_seconds"],
        "preprocessing_metadata": prep_metadata,
        "signals": {
            "syntheticProbability": anti_spoof_res["spoof_probability"],
            "authenticityConfidence": anti_spoof_res["genuine_probability"],
            "speakerConsistency": round(speaker_res["speaker_similarity"] * 100, 1),
            "livenessScore": liveness_score,
            "callContextRisk": call_context_risk,
            "transactionRisk": transaction_risk,
        },
        "anti_spoof_analysis": anti_spoof_res,
        "speaker_verification": speaker_res,
        "liveness_analysis": liveness_res,
        "risk_breakdown": risk_res,
        "performance_telemetry": {
            "preprocessing_ms": round(total_latency_ms - anti_spoof_ms - speaker_ms - liveness_ms - risk_ms, 2),
            "anti_spoof_inference_ms": anti_spoof_ms,
            "speaker_verification_ms": speaker_ms,
            "liveness_eval_ms": liveness_ms,
            "risk_engine_ms": risk_ms,
            "total_latency_ms": total_latency_ms,
            "is_demo": False,
        },
        "is_real_ai_analysis": True,
    }
