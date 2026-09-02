from fastapi import APIRouter, UploadFile, File, Form
from app.services.audio_service import AudioPreprocessingService
from app.models.speech_recognition import ChallengeLivenessEvaluator

router = APIRouter(prefix="/api/liveness", tags=["Liveness Verification"])

@router.post("/challenge")
async def evaluate_liveness_challenge(
    target_phrase: str = Form("47 blue mango"),
    file: UploadFile = File(...),
):
    """
    Active Liveness Challenge Phrase Endpoint.
    Analyzes spoken audio response against expected random pass-phrase.
    """
    audio_bytes = await file.read()
    pcm_signal, sample_rate, prep_metadata = AudioPreprocessingService.process_audio_bytes(audio_bytes)

    res = ChallengeLivenessEvaluator.evaluate_challenge_response(pcm_signal, target_phrase, sample_rate)

    return {
        "status": "COMPLETED",
        "challenge_type": "Active liveness challenge",
        "result": res,
        "prep_metadata": prep_metadata,
    }
