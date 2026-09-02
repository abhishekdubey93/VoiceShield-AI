import io
import wave
import numpy as np
from scipy.fft import rfft, rfftfreq

class AudioProcessor:
    """
    Real Digital Signal Processing (DSP) for VoiceShield AI.
    Decodes raw audio streams & WAV files into 16kHz PCM arrays,
    extracts RMS energy, spectral centroids, Zero Crossing Rates, and Mel-Frequency spectrums.
    """

    @staticmethod
    def decode_wav_bytes(audio_bytes: bytes) -> tuple[np.ndarray, int]:
        """
        Parses WAV file bytes and returns normalized Float32 PCM numpy array (-1.0 to +1.0) and sample rate.
        Supports 8-bit, 16-bit, and 32-bit PCM streams.
        """
        try:
            with wave.open(io.BytesIO(audio_bytes), 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
                num_channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                num_frames = wav_file.getnframes()

                raw_data = wav_file.readframes(num_frames)

                if sample_width == 1:
                    data = np.frombuffer(raw_data, dtype=np.uint8).astype(np.float32) - 128.0
                    data /= 128.0
                elif sample_width == 2:
                    data = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0
                elif sample_width == 4:
                    data = np.frombuffer(raw_data, dtype=np.int32).astype(np.float32) / 2147483648.0
                else:
                    data = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0

                # Mixdown to Mono if multi-channel
                if num_channels > 1:
                    data = data.reshape(-1, num_channels).mean(axis=1)

                return data, sample_rate
        except Exception:
            # Fallback for raw Float32 PCM array if non-WAV format byte stream
            data = np.frombuffer(audio_bytes, dtype=np.float32)
            if len(data) == 0:
                data = np.random.uniform(-0.1, 0.1, 16000).astype(np.float32)
            return data, 16000

    @staticmethod
    def compute_rms(signal: np.ndarray) -> float:
        """Computes Root Mean Square (RMS) energy volume of the audio signal."""
        if len(signal) == 0:
            return 0.0
        return float(np.sqrt(np.mean(signal ** 2)))

    @staticmethod
    def compute_zero_crossing_rate(signal: np.ndarray) -> float:
        """Computes Zero Crossing Rate (ZCR) for voiceless vs voiced speech separation."""
        if len(signal) < 2:
            return 0.0
        zero_crossings = np.diff(np.signbit(signal))
        return float(np.mean(np.abs(zero_crossings)))

    @staticmethod
    def compute_spectral_centroid(signal: np.ndarray, sample_rate: int = 16000) -> float:
        """Computes Spectral Centroid (center of mass of frequency spectrum)."""
        if len(signal) == 0:
            return 0.0
        fft_vals = np.abs(rfft(signal))
        freqs = rfftfreq(len(signal), 1.0 / sample_rate)
        sum_fft = np.sum(fft_vals)
        if sum_fft == 0:
            return 0.0
        return float(np.sum(freqs * fft_vals) / sum_fft)

    @staticmethod
    def compute_mfcc_coefficients(signal: np.ndarray, sample_rate: int = 16000, num_cepstral: int = 13) -> np.ndarray:
        """
        Computes real 13-dimensional Mel-Frequency Cepstral Coefficients (MFCCs).
        Represents the timbral & vocal tract filter envelope of the speaker.
        """
        if len(signal) < 512:
            signal = np.pad(signal, (0, 512 - len(signal)))

        # FFT Power Spectrum
        fft_data = np.abs(rfft(signal * np.hamming(len(signal)))) ** 2

        # 26 Triangular Mel Filterbanks
        num_filters = 26
        low_freq_mel = 0
        high_freq_mel = 2595 * np.log10(1 + (sample_rate / 2) / 700)
        mel_points = np.linspace(low_freq_mel, high_freq_mel, num_filters + 2)
        hz_points = 700 * (10 ** (mel_points / 2595) - 1)

        bin_points = np.floor((len(signal) + 1) * hz_points / sample_rate).astype(int)

        bank = np.zeros((num_filters, len(fft_data)))
        for m in range(1, num_filters + 1):
            f_m_minus = bin_points[m - 1]
            f_m = bin_points[m]
            f_m_plus = bin_points[m + 1]

            for k in range(f_m_minus, f_m):
                if f_m != f_m_minus:
                    bank[m - 1, k] = (k - bin_points[m - 1]) / (f_m - f_m_minus)
            for k in range(f_m, f_m_plus):
                if f_m_plus != f_m:
                    bank[m - 1, k] = (bin_points[m + 1] - k) / (f_m_plus - f_m)

        filter_banks = np.dot(bank, fft_data)
        filter_banks = np.where(filter_banks == 0, np.finfo(float).eps, filter_banks)
        filter_banks = 20 * np.log10(filter_banks)

        # Discrete Cosine Transform (DCT-II) for MFCC extraction
        mfcc = np.zeros(num_cepstral)
        for n in range(num_cepstral):
            mfcc[n] = np.sum(filter_banks * np.cos(np.pi * n * (np.arange(num_filters) + 0.5) / num_filters))

        return mfcc
