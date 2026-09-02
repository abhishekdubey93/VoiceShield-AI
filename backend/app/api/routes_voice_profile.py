from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.audio_service import AudioPreprocessingService
from app.models.speaker_verification import speaker_verification_model

router = APIRouter(prefix="/api/voice-profile", tags=["Voice Profiles"])

@router.post("/enroll")
async def enroll_voice_profile(
    profile_id: str = Form(...),
    name: str = Form(...),
    relationship: str = Form("Contact"),
    phone_number: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Enrolls a trusted voice profile from an uploaded clean recording.
    Extracts PyTorch 128-d neural speaker embedding and saves profile.
    """
    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Enrollment audio file is empty.")

    pcm_signal, sample_rate, prep_metadata = AudioPreprocessingService.process_audio_bytes(audio_bytes)

    if prep_metadata["duration_seconds"] < 1.0:
        raise HTTPException(
            status_code=400,
            detail="Enrollment audio sample must be at least 1.0 second of clean speech.",
        )

    profile_info = speaker_verification_model.create_voice_profile(profile_id, pcm_signal)

    return {
        "status": "ENROLLED",
        "profile_id": profile_id,
        "name": name,
        "relationship": relationship,
        "phone_number": phone_number,
        "sample_duration_seconds": prep_metadata["duration_seconds"],
        "embedding_details": profile_info,
        "message": "Trusted voice profile enrolled successfully.",
    }

@router.post("/verify")
async def verify_voice_profile(
    profile_id: str = Form("prof_1"),
    file: UploadFile = File(...),
):
    """Verifies an incoming voice sample against a registered trusted profile."""
    audio_bytes = await file.read()
    pcm_signal, sample_rate, prep_metadata = AudioPreprocessingService.process_audio_bytes(audio_bytes)
    res = speaker_verification_model.verify_speaker(pcm_signal, profile_id)
    return {
        "status": "COMPLETED",
        "verification_result": res,
        "audio_duration_seconds": prep_metadata["duration_seconds"],
    }
