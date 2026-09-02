from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import time

router = APIRouter(prefix="/api/security-actions", tags=["Security Actions"])

class SecurityActionRequest(BaseModel):
    action_type: str # MFA_OTP | TRUSTED_CALLBACK | SUPERVISOR_APPROVAL | TRANSACTION_HOLD
    details: Optional[str] = "Manual operator intervention"

@router.post("/{action_id}/approve")
def approve_action(action_id: str, req: Optional[SecurityActionRequest] = None):
    return {
        "action_id": action_id,
        "status": "APPROVED",
        "actor": "Supervisor",
        "timestamp": time.strftime("%H:%M:%S"),
        "message": f"Action {action_id} approved by supervisor.",
    }

@router.post("/{action_id}/reject")
def reject_action(action_id: str, req: Optional[SecurityActionRequest] = None):
    return {
        "action_id": action_id,
        "status": "REJECTED",
        "actor": "Supervisor",
        "timestamp": time.strftime("%H:%M:%S"),
        "message": f"Action {action_id} permanently rejected.",
    }

@router.post("/{action_id}/hold")
def hold_transaction(action_id: str, req: Optional[SecurityActionRequest] = None):
    return {
        "action_id": action_id,
        "status": "BLOCKED",
        "actor": "System",
        "timestamp": time.strftime("%H:%M:%S"),
        "transaction_status": "HELD",
        "message": f"Transaction hold activated for {action_id}.",
    }

@router.post("/{action_id}/release")
def release_transaction(action_id: str, req: Optional[SecurityActionRequest] = None):
    return {
        "action_id": action_id,
        "status": "RELEASED",
        "actor": "User",
        "timestamp": time.strftime("%H:%M:%S"),
        "transaction_status": "RELEASED",
        "message": f"Transaction hold released for {action_id}.",
    }
