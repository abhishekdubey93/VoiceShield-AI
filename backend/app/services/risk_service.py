from app.config import settings

class DeterministicRiskEngine:
    """
    Real Deterministic Dynamic Risk Engine for VoiceShield AI.
    Calculates normalized risk score (0-100) using configurable multi-vector weights.
    Never uses random numbers.
    """

    @staticmethod
    def calculate_risk(
        spoof_probability: float,        # 0.0 - 100.0
        speaker_similarity: float,       # 0.0 - 1.0 (or 0 - 100)
        liveness_score: float,           # 0.0 - 1.0 (or 0 - 100)
        call_context_risk: float = 15.0, # 0.0 - 100.0
        transaction_risk: float = 10.0,  # 0.0 - 100.0
        weights: dict = None
    ) -> dict:
        if weights is None:
            weights = {
                "synthetic_voice": settings.WEIGHT_SYNTHETIC,
                "speaker_mismatch": settings.WEIGHT_SPEAKER,
                "liveness_risk": settings.WEIGHT_LIVENESS,
                "call_context": settings.WEIGHT_CONTEXT,
                "transaction_risk": settings.WEIGHT_TRANSACTION,
            }

        # Normalize weights so sum = 100%
        total_weight = sum(weights.values()) or 100.0
        w_synth = weights.get("synthetic_voice", 40.0) / total_weight
        w_speaker = weights.get("speaker_mismatch", 25.0) / total_weight
        w_liveness = weights.get("liveness_risk", 15.0) / total_weight
        w_context = weights.get("call_context", 10.0) / total_weight
        w_tx = weights.get("transaction_risk", 10.0) / total_weight

        # Normalize speaker similarity & liveness to 0-100 risk components
        sim_norm = speaker_similarity * 100.0 if speaker_similarity <= 1.0 else speaker_similarity
        live_norm = liveness_score * 100.0 if liveness_score <= 1.0 else liveness_score

        speaker_mismatch_risk = max(0.0, 100.0 - sim_norm)
        liveness_deficit_risk = max(0.0, 100.0 - live_norm)

        pt_synth = round(spoof_probability * w_synth, 2)
        pt_speaker = round(speaker_mismatch_risk * w_speaker, 2)
        pt_liveness = round(liveness_deficit_risk * w_liveness, 2)
        pt_context = round(call_context_risk * w_context, 2)
        pt_tx = round(transaction_risk * w_tx, 2)

        raw_score = pt_synth + pt_speaker + pt_liveness + pt_context + pt_tx
        final_score = int(max(0, min(100, round(raw_score))))

        if final_score >= 81:
            level = "CRITICAL"
            action = "BLOCK_ACTION"
            recommended_action = "Block Sensitive Action & Place Transaction Hold Immediately"
        elif final_score >= 61:
            level = "HIGH"
            action = "VERIFY"
            recommended_action = "Require Additional Verification (MFA / Trusted Callback)"
        elif final_score >= 31:
            level = "MEDIUM"
            action = "WARNING"
            recommended_action = "Display Warning & Prompt Step-Up Identity Check"
        else:
            level = "LOW"
            action = "CONTINUE"
            recommended_action = "Continue call under automated monitoring"

        primary_drivers = []
        if spoof_probability >= 65.0:
            primary_drivers.append(f"High synthetic voice probability ({spoof_probability:.1f}%)")
        if sim_norm <= 65.0:
            primary_drivers.append(f"Speaker similarity below threshold ({sim_norm:.1f}%)")
        if live_norm <= 70.0:
            primary_drivers.append(f"Low voice liveness score ({live_norm:.1f}%)")
        if transaction_risk >= 60.0:
            primary_drivers.append(f"Sensitive transaction requested ({transaction_risk:.1f}%)")
        if call_context_risk >= 60.0:
            primary_drivers.append(f"Unverified caller ID / untrusted device origin ({call_context_risk:.1f}%)")

        if not primary_drivers:
            primary_drivers.append("Interaction parameters within safe baseline")

        return {
            "final_score": final_score,
            "level": level,
            "action": action,
            "recommended_action": recommended_action,
            "weighted_components": {
                "synthetic": pt_synth,
                "speaker": pt_speaker,
                "liveness": pt_liveness,
                "context": pt_context,
                "transaction": pt_tx,
            },
            "primary_drivers": primary_drivers,
        }
