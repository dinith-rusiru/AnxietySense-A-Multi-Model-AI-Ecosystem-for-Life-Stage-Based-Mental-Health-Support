from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os
import uuid
import tensorflow as tf
import librosa
import subprocess

from voice_api.utils.feature_extractor import extract_emotion_features

# ---------------- INIT ----------------
app = FastAPI(title="AnxietySense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(__file__)
TEMP_DIR = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(TEMP_DIR, exist_ok=True)

SVM_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_cnn_model.h5")
EMOTION_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_model.keras")
EMOTION_ENCODER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_label_encoder.pkl")

# ---------------- LOAD MODELS ----------------
svm_model = joblib.load(SVM_MODEL_PATH)
svm_scaler = joblib.load(SCALER_PATH)

gender_model = tf.keras.models.load_model(GENDER_MODEL_PATH)
emotion_model = tf.keras.models.load_model(EMOTION_MODEL_PATH)
emotion_encoder = joblib.load(EMOTION_ENCODER_PATH)

# ---------------- AUDIO HELPERS ----------------
def convert_to_wav(input_path):
    try:
        output_path = input_path.rsplit(".", 1)[0] + ".wav"

        subprocess.run([
            "ffmpeg", "-y",
            "-i", input_path,
            "-ar", "22050",
            "-ac", "1",
            "-f", "wav",
            output_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        return output_path if os.path.exists(output_path) else None

    except Exception as e:
        print("❌ FFmpeg error:", e)
        return None


def is_valid_voice(file_path, min_duration=1.2, energy_threshold=0.015, zcr_threshold=0.01):
    try:
        y, sr = librosa.load(file_path, sr=22050)
        y, _ = librosa.effects.trim(y)

        if len(y) == 0:
            return False

        duration = librosa.get_duration(y=y, sr=sr)
        rms = np.mean(librosa.feature.rms(y=y))
        zcr = np.mean(librosa.feature.zero_crossing_rate(y))

        print(f"🔍 Duration:{duration:.2f}s RMS:{rms:.5f} ZCR:{zcr:.5f}")

        return not (
            duration < min_duration or
            rms < energy_threshold or
            zcr < zcr_threshold
        )

    except Exception as e:
        print("❌ Validation error:", e)
        return False


def extract_mel_spectrogram(file_path, max_len=128):
    try:
        y, sr = librosa.load(file_path, sr=22050)
        y, _ = librosa.effects.trim(y)

        mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel = librosa.power_to_db(mel, ref=np.max)

        if mel.shape[1] < max_len:
            mel = np.pad(mel, ((0, 0), (0, max_len - mel.shape[1])))
        else:
            mel = mel[:, :max_len]

        return mel

    except Exception as e:
        print("❌ Spectrogram error:", e)
        return None


# ---------------- LOGIC HELPERS ----------------
def anxiety_level(score):
    if score <= 20:
        return "Minimal Anxiety"
    elif score <= 25:
        return "Mild Anxiety"
    elif score <= 41:
        return "Moderate Anxiety"
    return "Severe Anxiety"


def voice_anxiety_from_emotion(emotion):
    mapping = {
        "happy": 10,
        "neutral": 18,
        "sad": 28,
        "anger": 32,
        "fear": 40,
    }

    score = mapping.get(emotion, 18)
    return score, anxiety_level(score)


# ---------------- VOICE API ----------------
@app.post("/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):

    original_path = None
    converted_path = None

    try:
        uid = str(uuid.uuid4())

        # safer file naming
        filename = file.filename or "audio"
        original_path = os.path.join(TEMP_DIR, f"{uid}_{filename}")

        # save upload
        with open(original_path, "wb") as f:
            f.write(await file.read())

        print("🎤 Uploaded:", original_path)

        # convert ALL non-wav files
        if not original_path.endswith(".wav"):
            converted_path = convert_to_wav(original_path)
            if not converted_path:
                return {"success": False, "error": "Audio conversion failed"}
            path = converted_path
        else:
            path = original_path

        # validate speech
        if not is_valid_voice(path):
            return {
                "success": False,
                "error": "No clear speech detected. Speak 1–2 seconds clearly."
            }

        # ---------------- GENDER ----------------
        spec = extract_mel_spectrogram(path)
        if spec is None:
            return {"success": False, "error": "Audio too weak"}

        spec = spec[np.newaxis, ..., np.newaxis]
        pred = gender_model.predict(spec, verbose=0)[0][0]

        gender = "male" if pred > 0.5 else "female"
        gender_conf = float(max(pred, 1 - pred))

        # ---------------- EMOTION ----------------
        feat = extract_emotion_features(path)

        if feat is None:
            emotion = "neutral"
            emo_conf = 0.0
        else:
            inp = np.expand_dims(feat, axis=(0, 2))
            probs = emotion_model.predict(inp, verbose=0)[0]

            idx = int(np.argmax(probs))
            emotion = emotion_encoder.inverse_transform([idx])[0]
            emo_conf = float(probs[idx])

            if emo_conf < 0.5:
                emotion = "neutral"

        # ---------------- ANXIETY ----------------
        voice_score, voice_level = voice_anxiety_from_emotion(emotion)

        return {
            "success": True,
            "gender": gender,
            "gender_confidence": round(gender_conf, 2),
            "emotion": emotion,
            "emotion_confidence": round(emo_conf, 2),
            "voice_anxiety_score": voice_score,
            "voice_anxiety_level": voice_level,
            "is_allowed": gender == "female",
            "message": "Valid user" if gender == "female"
            else "This feature is designed for pregnant women."
        }

    except Exception as e:
        print("❌ API Error:", e)
        return {"success": False, "error": "Voice analysis failed"}

    finally:
        for p in [original_path, converted_path]:
            try:
                if p and os.path.exists(p):
                    os.remove(p)
            except:
                pass


# ---------------- QUESTIONNAIRE ----------------
class QuestionnaireInput(BaseModel):
    answers: dict | None = None
    emotion: str = "neutral"
    voice_score: float | None = None


@app.post("/anxiety/final")
def final_anxiety(data: QuestionnaireInput):

    questionnaire_score = None
    final_score = None
    mode = "unknown"

    if data.answers:
        df = pd.DataFrame([data.answers])
        df = df.reindex(columns=[f"Q{i}" for i in range(1, 32)], fill_value=0)

        scaled = svm_scaler.transform(df)
        questionnaire_score = float(svm_model.predict(scaled)[0])

    if questionnaire_score is not None and data.voice_score is not None:
        final_score = questionnaire_score + data.voice_score
        mode = "combined"

    elif questionnaire_score is not None:
        final_score = questionnaire_score
        mode = "questionnaire_only"

    elif data.voice_score is not None:
        final_score = data.voice_score
        mode = "voice_only"

    else:
        return {"error": "No valid input provided"}

    return {
        "mode": mode,
        "questionnaire_score": questionnaire_score,
        "emotion": data.emotion,
        "final_score": round(final_score, 2),
        "anxiety_level": anxiety_level(final_score),
    }


@app.get("/")
def root():
    return {"status": "AnxietySense backend running"}