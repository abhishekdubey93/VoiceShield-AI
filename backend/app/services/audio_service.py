import io
import wave
import numpy as np
import scipy.signal

class AudioPreprocessingService:
    """
    Real Audio Preprocessing Service.
    Handles WAV/MP3 byte parsing, 16kHz resampling, mono channel mixdown,
    amplitude normalization, and Voice Activity Detection (VAD) silence trimming.
    """

    TARGET_SAMPLE_RATE = 16000

    @classmethod
    def process_audio_bytes(cls, audio_bytes: bytes) -> tuple[np.ndarray, int, dict]:
        """
        Parses raw audio input and returns clean 16kHz Float32 PCM numpy array (-1.0 to +1.0),
        sample rate, and preprocessor metadata metrics.
        """
        raw_pcm, src_sr = cls._decode_bytes(audio_bytes)

        # 1. Mono conversion if stereo
        if raw_pcm.ndim > 1:
            raw_pcm = np.mean(raw_pcm, axis=1)

        # 2. Resampling to 16,000 Hz if necessary
        if src_sr != cls.TARGET_SAMPLE_RATE and src_sr > 0 and len(raw_pcm) > 0:
            num_samples = int(round(len(raw_pcm) * cls.TARGET_SAMPLE_RATE / src_sr))
            processed_pcm = scipy.signal.resample(raw_pcm, num_samples).astype(np.float32)
        else:
            processed_pcm = raw_pcm.astype(np.float32)

        # 3. Peak / RMS Amplitude Normalization
        max_amp = np.max(np.abs(processed_pcm)) if len(processed_pcm) > 0 else 0
        if max_amp > 1e-4:
            normalized_pcm = processed_pcm / max_amp
        else:
            normalized_pcm = processed_pcm

        # 4. Voice Activity Detection (VAD) Silence Trimming
        vad_pcm, speech_ratio = cls._vad_trim(normalized_pcm, cls.TARGET_SAMPLE_RATE)

        duration_sec = len(vad_pcm) / cls.TARGET_SAMPLE_RATE

        metadata = {
            "original_sample_rate": src_sr,
            "processed_sample_rate": cls.TARGET_SAMPLE_RATE,
            "duration_seconds": round(duration_sec, 2),
            "speech_ratio": round(speech_ratio, 3),
            "is_valid_speech": duration_sec >= 0.5,
        }

        return vad_pcm, cls.TARGET_SAMPLE_RATE, metadata

    @staticmethod
    def _decode_bytes(audio_bytes: bytes) -> tuple[np.ndarray, int]:
        try:
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav_file:
                sr = wav_file.getframerate()
                num_channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                num_frames = wav_file.getnframes()
                raw_data = wav_file.readframes(num_frames)

                if sample_width == 1:
                    pcm = (np.frombuffer(raw_data, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
                elif sample_width == 2:
                    pcm = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0
                elif sample_width == 4:
                    pcm = np.frombuffer(raw_data, dtype=np.int32).astype(np.float32) / 2147483648.0
                else:
                    pcm = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0

                if num_channels > 1:
                    pcm = pcm.reshape(-1, num_channels)

                return pcm, sr
        except Exception:
            # Raw Float32 fallback
            pcm = np.frombuffer(audio_bytes, dtype=np.float32)
            if len(pcm) == 0:
                pcm = np.zeros(16000, dtype=np.float32)
            return pcm, 16000

    @staticmethod
    def _vad_trim(signal: np.ndarray, sample_rate: int) -> tuple[np.ndarray, float]:
        if len(signal) == 0:
            return signal, 0.0

        frame_len = int(sample_rate * 0.02) # 20ms frame
        num_frames = len(signal) // frame_len
        if num_frames == 0:
            return signal, 1.0

        speech_mask = []
        for i in range(num_frames):
            frame = signal[i * frame_len : (i + 1) * frame_len]
            rms = np.sqrt(np.mean(frame ** 2))
            speech_mask.append(rms > 0.015)

        speech_mask = np.array(speech_mask)
        speech_ratio = float(np.mean(speech_mask))

        # Keep active speech frames + short margin
        if np.any(speech_mask):
            first_speech = np.argmax(speech_mask) * frame_len
            last_speech = (len(speech_mask) - np.argmax(speech_mask[::-1])) * frame_len
            trimmed = signal[max(0, first_speech - 1600) : min(len(signal), last_speech + 1600)]
            return trimmed, speech_ratio

        return signal, speech_ratio
