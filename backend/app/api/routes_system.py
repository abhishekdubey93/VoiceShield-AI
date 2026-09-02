from fastapi import APIRouter
from app.config import settings
from app.models.anti_spoof import anti_spoof_model
from app.models.speaker_verification import speaker_verification_model

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    torch = None

router = APIRouter(tags=["System Status"])

@router.get("/health")
@router.get("/api/system/status")
def get_system_status():
    """
    Returns real-time system health, loaded model status, CPU/CUDA hardware device,
    and database engine configuration.
    """
    cuda_available = HAS_TORCH and torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU (Digital Signal Processing + PyTorch Engine)"

    return {
        "status": "ONLINE",
        "service": settings.APP_NAME,
        "hardware_device": device_name,
        "is_cuda_active": cuda_available,
        "pytorch_installed": HAS_TORCH,
        "database": "SQLite (Local Development Mode)" if "sqlite" in settings.DATABASE_URL else "PostgreSQL",
        "models": {
            "anti_spoof_model": {
                "name": "PyTorch Convolutional STFT Classifier & Vocoder Phase Anomaly DSP",
                "loaded": anti_spoof_model.loaded,
                "device": str(anti_spoof_model.device),
            },
            "speaker_verification_model": {
                "name": "PyTorch ECAPA-TDNN 128-d Neural Embedding Matcher",
                "loaded": True,
                "device": str(speaker_verification_model.device),
            },
            "liveness_evaluator": {
                "name": "RMS Dynamic Range & Active Pass-phrase Challenge Evaluator",
                "loaded": True,
            },
        },
    }
