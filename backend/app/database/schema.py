from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrustedVoiceProfile(Base):
    __tablename__ = "trusted_voice_profiles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    relationship_label = Column(String)
    phone_number = Column(String, index=True)
    status = Column(String, default="REGISTERED") # REGISTERED | PENDING | NOT_ENROLLED
    sample_count = Column(Integer, default=1)
    embedding_vector = Column(Text) # JSON serialized 13-dim / 512-dim embedding
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_verified_at = Column(DateTime, nullable=True)

class CallRecord(Base):
    __tablename__ = "calls"

    id = Column(String, primary_key=True, index=True)
    caller_name = Column(String)
    caller_number = Column(String)
    start_time = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer, default=0)
    status = Column(String, default="LIVE") # LIVE | PROTECTED | BLOCKED | COMPLETED
    primary_language = Column(String, default="Hindi")
    synthetic_probability = Column(Float, default=0.0)
    speaker_similarity = Column(Float, default=0.0)
    liveness_score = Column(Float, default=0.0)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW") # LOW | MEDIUM | HIGH | CRITICAL
    recommended_action = Column(String)

class VoiceAnalysisRecord(Base):
    __tablename__ = "voice_analysis"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=True)
    file_name = Column(String, nullable=True)
    audio_duration_sec = Column(Float)
    synthetic_prob = Column(Float)
    authenticity_confidence = Column(Float)
    speaker_consistency = Column(Float)
    liveness_score = Column(Float)
    call_context_risk = Column(Float)
    transaction_risk = Column(Float)
    model_inference_ms = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class SecurityActionLog(Base):
    __tablename__ = "security_actions"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, nullable=True)
    action_type = Column(String) # MFA_OTP | TRUSTED_CALLBACK | CHALLENGE_VERIFICATION | SUPERVISOR_APPROVAL | TRANSACTION_HOLD | BLOCK_ACTION
    status = Column(String) # PASSED | FAILED | BLOCKED | RELEASED | APPROVED | REJECTED
    details = Column(Text)
    actor = Column(String, default="System")
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    event = Column(String)
    risk_score = Column(Integer)
    action_taken = Column(String)
    actor = Column(String, default="System")
    status = Column(String, default="Completed")
    timestamp = Column(DateTime, default=datetime.utcnow)
