import librosa
import numpy as np

def extract_features(audio_path, sr=22050):
    """
    Extract voice features from an audio file.
    Returns a 1D numpy array (fixed length).
    """

    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=sr)

        # Ensure minimum length
        if len(y) < sr:
            return None

        # ========================
        # Feature Extraction
        # ========================

        # MFCC (13)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_mean = np.mean(mfccs, axis=1)

        # Chroma
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)

        # Spectral Centroid
        spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        spec_centroid_mean = np.mean(spec_centroid)

        # Zero Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y)
        zcr_mean = np.mean(zcr)

        # RMS Energy
        rms = librosa.feature.rms(y=y)
        rms_mean = np.mean(rms)

        # ========================
        # Combine all features
        # ========================

        features = np.hstack([
            mfccs_mean,
            chroma_mean,
            spec_centroid_mean,
            zcr_mean,
            rms_mean
        ])

        return features

    except Exception as e:
        print("Feature extraction error:", e)
        return None
