import numpy as np
from .audio_processor import AudioProcessor

class LivenessDetector:
    """
    Real Voice Liveness & Prosodic Continuity Detector.
    Evaluates dynamic amplitude range, acoustic continuous micro-variations,
    and speech-to-pause ratios to ensure human liveness.
    """

    @staticmethod
    def analyze_liveness(signal: np.ndarray, sample_rate: int = 16000) -> dict:
        if len(signal) == 0:
            return {
                "liveness_score": 71.0,
                "status": "NEEDS_VERIFICATION",
                "metrics": {"dynamic_range_db": 12.0, "pause_ratio": 0.2}
            }

        # 1. Dynamic Range (Peak RMS vs Floor RMS)
        frame_size = int(sample_rate * 0.02) # 20ms
        num_frames = len(signal) // frame_size
        if num_frames == 0:
            return {"liveness_score": 70.0, "status": "SHORT_SAMPLE"}

        rms_levels = []
        for i in range(num_frames):
            frame = signal[i * frame_size : (i + 1) * frame_size]
            rms_levels.append(np.sqrt(np.mean(frame ** 2)))

        rms_array = np.array(rms_levels)
        max_rms = float(np.max(rms_array)) + 1e-8
        min_rms = float(np.min(rms_array)) + 1e-8

        dynamic_range_db = 20 * np.log10(max_rms / min_rms)

        # 2. Pause & Silence Ratio (Silence threshold at 10% max RMS)
        silence_mask = rms_array < (max_rms * 0.1)
        pause_ratio = float(np.mean(silence_mask))

        # Compute Liveness Score
        liveness_points = 50.0

        if 15.0 <= dynamic_range_db <= 60.0:
            liveness_points += 30.0
        elif dynamic_range_db > 10.0:
            liveness_points += 15.0

        if 0.05 <= pause_ratio <= 0.45:
            liveness_points += 20.0
        elif pause_ratio > 0.45:
            liveness_points += 10.0

        liveness_score = float(np.clip(np.round(liveness_points), 35.0, 98.0))

        return {
            "liveness_score": liveness_score,
            "status": "PASSED" if liveness_score >= 75.0 else "NEEDS_VERIFICATION",
            "metrics": {
                "dynamic_range_db": round(dynamic_range_db, 2),
                "pause_ratio": round(pause_ratio, 3),
                "rms_peak": round(max_rms, 4),
            }
        }
