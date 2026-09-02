from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.risk_service import DeterministicRiskEngine

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])

class RiskCalculationSchema(BaseModel):
    spoof_probability: float
    speaker_similarity: float
    liveness_score: float
    call_context_risk: Optional[float] = 15.0
    transaction_risk: Optional[float] = 10.0
    weights: Optional[dict] = None

@router.post("/calculate")
def calculate_risk(schema: RiskCalculationSchema):
    """
    Computes mathematical deterministic risk score (0-100)
    using configurable weights: Synthetic (40%), Speaker (25%), Liveness (15%), Context (10%), Transaction (10%).
    """
    return DeterministicRiskEngine.calculate_risk(
        spoof_probability=schema.spoof_probability,
        speaker_similarity=schema.speaker_similarity,
        liveness_score=schema.liveness_score,
        call_context_risk=schema.call_context_risk or 15.0,
        transaction_risk=schema.transaction_risk or 10.0,
        weights=schema.weights,
    )
