import librosa
import numpy as np

MIN_RMS = 0.01
MIN_ZCR = 0.01


def extract_gender_features(audio_path, sr=22050):
    try:
        y, sr = librosa.load(audio_path, sr=sr)

        if len(y) < sr:
            return None

        rms = np.mean(librosa.feature.rms(y=y))
        zcr = np.mean(librosa.feature.zero_crossing_rate(y))

        if rms < MIN_RMS or zcr < MIN_ZCR:
            return None

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)

        pitch, _, _ = librosa.pyin(
            y,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
        )

        pitch_mean = np.nanmean(pitch) if pitch is not None else 0.0

        features = np.hstack([
            np.mean(mfcc, axis=1),
            np.mean(chroma, axis=1),
            zcr,
            rms,
            pitch_mean,
        ])

        return features

    except Exception as e:
        print("Gender feature error:", e)
        return None


def extract_emotion_features(audio_path, sr=22050):
    try:
        y, sr = librosa.load(audio_path, sr=sr, duration=3, offset=0.5)

        rms = np.mean(librosa.feature.rms(y=y))
        if rms < MIN_RMS:
            return None

        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        return np.mean(mfcc.T, axis=0)

    except Exception as e:
        print("Emotion feature error:", e)
        return None
