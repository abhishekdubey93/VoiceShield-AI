class PythonAudioQualityEvaluator:
    @staticmethod
    def evaluate_quality(noise_level: float = 20.0, background_noise_type: str = "NORMAL") -> dict:
        snr_db = max(5.0, round(40.0 - noise_level * 0.35, 1))

        if noise_level > 65.0 or background_noise_type in ["TRAFFIC", "WIND"]:
            grade = "UNUSUALLY_POOR"
        elif noise_level > 45.0 or background_noise_type in ["COUGHING", "SPEAKERPHONE"]:
            grade = "NOISY"
        elif noise_level > 30.0:
            grade = "DEGRADED"
        elif noise_level > 15.0:
            grade = "GOOD"
        else:
            grade = "EXCELLENT"

        is_sufficient = grade in ["EXCELLENT", "GOOD"]
        recommended_status = "VERIFIED" if is_sufficient else "INCONCLUSIVE"
        reason = None if is_sufficient else "Audio quality is insufficient for reliable identity verification due to environmental noise or compression."

        return {
            "grade": grade,
            "snr_db": snr_db,
            "is_sufficient": is_sufficient,
            "recommended_status": recommended_status,
            "reason": reason,
        }
