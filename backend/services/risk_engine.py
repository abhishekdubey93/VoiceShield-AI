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
        weights: dict = None,
        caller_type: str = "SAVED_CONTACT",
        audio_quality: str = "EXCELLENT",
        detected_categories: list = None
    ) -> dict:
        if weights is None:
            weights = {
                "synthetic_voice": 40.0,
                "speaker_mismatch": 25.0,
                "liveness_risk": 15.0,
                "call_context": 10.0,
                "transaction_risk": 10.0,
            }

        if detected_categories is None:
            detected_categories = []

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

        # Baseline: Saved = ~4, Unknown = ~18
        base_score = 4.0 if caller_type == "SAVED_CONTACT" else 18.0

        is_audio_inconclusive = audio_quality in ["DEGRADED", "NOISY", "UNUSUALLY_POOR"]
        voice_status = "INCONCLUSIVE" if is_audio_inconclusive else ("POSSIBLE_MISMATCH" if speaker_consistency < 55.0 else "VERIFIED")

        primary_drivers = []
        if is_audio_inconclusive:
            primary_drivers.append("Voice verification inconclusive due to ambient noise / audio quality")
        elif voice_status == "POSSIBLE_MISMATCH":
            primary_drivers.append(f"Possible voice profile mismatch ({speaker_consistency}% similarity)")
            base_score += 20.0

        if synthetic_probability >= 65.0:
            base_score += round((synthetic_probability - 50.0) * 0.5, 2)
            primary_drivers.append(f"Elevated synthetic voice probability ({synthetic_probability}%)")

        critical_intents = ["OTP_REQUEST", "UPI_PIN_REQUEST", "ATM_PIN_REQUEST", "CVV_REQUEST", "REMOTE_ACCESS_REQUEST", "URGENT_PAYMENT_REQUEST", "THREAT", "EXTORTION"]
        high_intents = ["MONEY_TRANSFER_REQUEST", "BANK_ACCOUNT_REQUEST", "CARD_NUMBER_REQUEST", "FINANCIAL_IMPERSONATION"]

        max_intent_score = 0.0
        for cat in detected_categories:
            if cat in critical_intents:
                max_intent_score = max(max_intent_score, 75.0)
                primary_drivers.append(f"Critical security request detected: {cat}")
            elif cat in high_intents:
                max_intent_score = max(max_intent_score, 55.0)
                primary_drivers.append(f"High risk financial request detected: {cat}")

        final_raw = max(base_score, max_intent_score + base_score * 0.3)
        if any(c in critical_intents for c in detected_categories) and (voice_status == "POSSIBLE_MISMATCH" or synthetic_probability > 70.0):
            final_raw = max(final_raw, 92.0)

        final_score = int(np.clip(round(final_raw), 0, 100))

        if final_score >= 81:
            level = "CRITICAL"
            recommended_action = "DO NOT SHARE OTP OR TRANSFER FUNDS. Verify caller through independent trusted channel."
        elif final_score >= 61:
            level = "HIGH"
            recommended_action = "Require Step-Up Verification (MFA / Trusted Callback)"
        elif final_score >= 31:
            level = "MEDIUM"
            recommended_action = "Display Operator Warning & Prompt Verification"
        else:
            level = "LOW"
            recommended_action = "Continue call under automated monitoring"

        if not primary_drivers:
            primary_drivers.append("Saved contact with safe conversation parameters" if caller_type == "SAVED_CONTACT" else "Unknown contact baseline with safe conversation")

        return {
            "final_score": final_score,
            "level": level,
            "caller_type": caller_type,
            "voice_verification_status": voice_status,
            "audio_quality": audio_quality,
            "detected_indicators": detected_categories,
            "weighted_breakdown": {
                "synthetic_pts": pt_synth,
                "speaker_pts": pt_speaker,
                "liveness_pts": pt_liveness,
                "context_pts": pt_context,
                "transaction_pts": pt_tx,
            },
            "recommended_action": recommended_action,
            "primary_drivers": primary_drivers,
            "alert_required": final_score >= 61,
            "vibration_recommended": final_score >= 61,
        }
