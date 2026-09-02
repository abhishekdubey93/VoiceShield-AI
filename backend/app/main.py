from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.db import engine, Base

# Import API Routers
from app.api.routes_system import router as system_router
from app.api.routes_audio import router as audio_router
from app.api.routes_voice_profile import router as profile_router
from app.api.routes_liveness import router as liveness_router
from app.api.routes_risk import router as risk_router
from app.api.routes_actions import router as actions_router
from app.api.websocket import router as ws_router

# Initialize Database Schema (SQLite / PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Real-Time AI Voice Impersonation Defense Engine — SIH 2026 Shortlisted Project (Team Ctrl Alt Elite)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend Vite dev server (http://localhost:3000, 3001, 3002, 3003)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(system_router)
app.include_router(audio_router)
app.include_router(profile_router)
app.include_router(liveness_router)
app.include_router(risk_router)
app.include_router(actions_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "project": "VoiceShield AI Engine",
        "team": "Ctrl Alt Elite (SIH 2026)",
        "status": "ONLINE",
        "docs": "/docs",
    }
