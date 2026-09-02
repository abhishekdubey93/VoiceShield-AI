import numpy as np

class DynamicRiskEngine:
    """
    Real Dynamic Risk Score Engine.
    Computes mathematical normalized risk score (0-100) based on real acoustic signals & contextual parameters.
    """

    @staticmethod
    def calculate_risk(
        synthetic_probability: float,
        speaker_consistency: float,
        liveness_score: float,
        call_context_risk: float = 15.0,
        transaction_risk: float = 10.0,
        weights: dict = None
    ) -> dict:
        if weights is None:
            weights = {
                "synthetic_voice": 40.0,
                "speaker_mismatch": 25.0,
                "liveness_risk": 15.0,
                "call_context": 10.0,
                "transaction_risk": 10.0,
            }

        total_weight = sum(weights.values()) or 100.0

        w_synth = weights.get("synthetic_voice", 40.0) / total_weight
        w_speaker = weights.get("speaker_mismatch", 25.0) / total_weight
        w_liveness = weights.get("liveness_risk", 15.0) / total_weight
        w_context = weights.get("call_context", 10.0) / total_weight
        w_tx = weights.get("transaction_risk", 10.0) / total_weight

        speaker_mismatch_risk = max(0.0, 100.0 - speaker_consistency)
        liveness_deficit_risk = max(0.0, 100.0 - liveness_score)

        pt_synth = round(synthetic_probability * w_synth, 2)
        pt_speaker = round(speaker_mismatch_risk * w_speaker, 2)
        pt_liveness = round(liveness_deficit_risk * w_liveness, 2)
        pt_context = round(call_context_risk * w_context, 2)
        pt_tx = round(transaction_risk * w_tx, 2)

        raw_score = pt_synth + pt_speaker + pt_liveness + pt_context + pt_tx
        final_score = int(np.clip(round(raw_score), 0, 100))

        if final_score >= 81:
            level = "CRITICAL"
            recommended_action = "Block Sensitive Action & Place Transaction Hold Immediately"
        elif final_score >= 61:
            level = "HIGH"
            recommended_action = "Require Step-Up Verification (MFA / Trusted Callback)"
        elif final_score >= 31:
            level = "MEDIUM"
            recommended_action = "Display Operator Warning & Prompt Verification"
        else:
            level = "LOW"
            recommended_action = "Continue call under automated monitoring"

        primary_drivers = []
        if synthetic_probability >= 65:
            primary_drivers.append(f"High synthetic voice probability ({synthetic_probability}%)")
        if speaker_consistency <= 65:
            primary_drivers.append(f"Speaker consistency mismatch ({speaker_consistency}% similarity)")
        if liveness_score <= 70:
            primary_drivers.append(f"Low voice liveness score ({liveness_score}%)")
        if transaction_risk >= 60:
            primary_drivers.append(f"Sensitive transaction request ({transaction_risk}%)")
        if call_context_risk >= 60:
            primary_drivers.append(f"Unverified caller ID / SIP origin risk ({call_context_risk}%)")

        if not primary_drivers:
            primary_drivers.append("Interaction parameters within safe baseline")

        return {
            "final_score": final_score,
            "level": level,
            "weighted_breakdown": {
                "synthetic_pts": pt_synth,
                "speaker_pts": pt_speaker,
                "liveness_pts": pt_liveness,
                "context_pts": pt_context,
                "transaction_pts": pt_tx,
            },
            "recommended_action": recommended_action,
            "primary_drivers": primary_drivers,
        }
