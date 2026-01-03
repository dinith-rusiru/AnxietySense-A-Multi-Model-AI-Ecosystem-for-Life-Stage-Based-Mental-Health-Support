import librosa
import numpy as np

def extract_gender_features(audio_path, sr=22050):
    try:
        y, sr = librosa.load(audio_path, sr=sr)

        if len(y) < sr:
            return None

        # MFCC (13)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfcc, axis=1)

        # Chroma (12)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)

        # ZCR + RMS
        zcr = np.mean(librosa.feature.zero_crossing_rate(y))
        rms = np.mean(librosa.feature.rms(y=y))

        # Pitch (1)
        pitch, _, _ = librosa.pyin(
            y,
            fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C7')
        )
        pitch_mean = np.nanmean(pitch) if pitch is not None else 0.0

        # 13 + 12 + 1 + 1 + 1 = 28
        features = np.hstack([
            mfcc_mean,
            chroma_mean,
            zcr,
            rms,
            pitch_mean
        ])

        return features

    except Exception as e:
        print("Gender feature extraction error:", e)
        return None

# -----------------------------
# Emotion features (40 MFCCs)
# -----------------------------
def extract_emotion_features(audio_path, sr=22050):
    try:
        y, sr = librosa.load(audio_path, sr=sr, duration=3, offset=0.5)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        features = np.mean(mfcc.T, axis=0)  # shape (40,)
        return features
    except Exception as e:
        print("Emotion feature extraction error:", e)
        return None
