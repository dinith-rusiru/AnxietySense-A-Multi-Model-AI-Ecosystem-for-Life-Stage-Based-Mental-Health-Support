from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os
import uuid
import tensorflow as tf
from pydub import AudioSegment

from voice_api.utils.feature_extractor import (
    extract_gender_features,
    extract_emotion_features,
)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(__file__)
TEMP_DIR = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(TEMP_DIR, exist_ok=True)

# Models
SVM_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_svm_model.pkl")
GENDER_SCALER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_scaler.pkl")

EMOTION_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_model.keras")
EMOTION_ENCODER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_label_encoder.pkl")

# ---------------- LOAD MODELS ----------------
svm_model = joblib.load(SVM_MODEL_PATH)
svm_scaler = joblib.load(SCALER_PATH)

gender_model = joblib.load(GENDER_MODEL_PATH)
gender_scaler = joblib.load(GENDER_SCALER_PATH)

emotion_model = tf.keras.models.load_model(EMOTION_MODEL_PATH)
emotion_encoder = joblib.load(EMOTION_ENCODER_PATH)

# ---------------- APP ----------------
app = FastAPI(title="AnxietySense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HELPERS ----------------
def anxiety_level(score):
    if score <= 20:
        return "Minimal Anxiety"
    elif score <= 25:
        return "Mild Anxiety"
    elif score <= 41:
        return "Moderate Anxiety"
    else:
        return "Severe Anxiety"


def emotion_weight(emotion):
    return {
        "happy": -3,
        "sad": 2,
        "fear": 4,
        "anger": 3,
        "neutral": 0,
    }.get(emotion, 0)

# ---------------- VOICE ----------------
@app.post("/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        uid = str(uuid.uuid4())
        ext = file.filename.split(".")[-1]
        path = os.path.join(TEMP_DIR, f"{uid}.{ext}")

        with open(path, "wb") as f:
            f.write(await file.read())

        gender_features = extract_gender_features(path)
        if gender_features is None:
            return {"success": False, "error": "No clear voice detected"}

        gender_scaled = gender_scaler.transform(gender_features.reshape(1, -1))
        gender = "female" if gender_model.predict(gender_scaled)[0] == 1 else "male"

        emotion_features = extract_emotion_features(path)
        if emotion_features is None:
            emotion = "neutral"
            confidence = 0.0
        else:
            inp = np.expand_dims(emotion_features, axis=(0, 2))
            probs = emotion_model.predict(inp)[0]
            idx = int(np.argmax(probs))
            emotion = emotion_encoder.inverse_transform([idx])[0]
            confidence = float(probs[idx])

            if confidence < 0.5:
                emotion = "neutral"

        return {
            "success": True,
            "gender": gender,
            "emotion": emotion,
            "emotion_confidence": round(confidence, 2),
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

# ---------------- QUESTIONNAIRE ----------------
class QuestionnaireInput(BaseModel):
    answers: dict
    emotion: str

@app.post("/anxiety/final")
def final_anxiety(data: QuestionnaireInput):
    df = pd.DataFrame([data.answers])
    df = df.reindex(columns=[f"Q{i}" for i in range(1, 32)], fill_value=0)

    scaled = svm_scaler.transform(df)
    score = float(svm_model.predict(scaled)[0])

    final_score = score + emotion_weight(data.emotion)

    return {
        "questionnaire_score": round(score, 2),
        "emotion": data.emotion,
        "final_score": round(final_score, 2),
        "anxiety_level": anxiety_level(final_score),
    }

@app.get("/")
def root():
    return {"status": "AnxietySense backend running"}
