import os

class Settings:
    APP_NAME: str = "VoiceShield AI Backend Engine"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = True

    # Database: Default to SQLite for local dev, PostgreSQL when DATABASE_URL is configured
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./voiceshield.db")

    # Device selection: Auto CUDA if GPU available, else CPU
    DEVICE: str = os.getenv("MODEL_DEVICE", "auto")

    # Model Weights & Pretrained Caches
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")

    # Security & CORS
    CORS_ORIGINS: list = ["*"]
    SECRET_KEY: str = os.getenv("SECRET_KEY", "voiceshield_sih_2026_super_secret_key")

    # Risk Engine Default Weights (Sum = 100%)
    WEIGHT_SYNTHETIC: float = 40.0
    WEIGHT_SPEAKER: float = 25.0
    WEIGHT_LIVENESS: float = 15.0
    WEIGHT_CONTEXT: float = 10.0
    WEIGHT_TRANSACTION: float = 10.0

settings = Settings()
