# from fastapi import FastAPI
# from pydantic import BaseModel
# import joblib
# import pandas as pd
# import os

# # --------------------------------------------------
# # Paths (FIXED)
# # --------------------------------------------------
# BASE_DIR = os.path.dirname(__file__)

# MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
# SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

# # --------------------------------------------------
# # Load Model & Scaler
# # --------------------------------------------------
# svm_model = joblib.load(MODEL_PATH)
# scaler = joblib.load(SCALER_PATH)

# # --------------------------------------------------
# # FastAPI App
# # --------------------------------------------------
# app = FastAPI(
#     title="AnxietySense API",
#     description="SVM-based Anxiety Score Prediction API",
#     version="1.0"
# )

# class PredictionInput(BaseModel):
#     features: dict

# def get_anxiety_level(score: float):
#     if score <= 20:
#         return "Minimal Anxiety"
#     elif score <= 25:
#         return "Mild Anxiety"
#     elif score <= 41:
#         return "Moderate Anxiety"
#     else:
#         return "Severe Anxiety"

# @app.get("/")
# def home():
#     return {"status": "Backend running"}

# @app.post("/predict")
# def predict(data: PredictionInput):
#     try:
#         input_df = pd.DataFrame([data.features])

#         input_df = input_df.reindex(
#             columns=[f"Q{i}" for i in range(1, 32)],
#             fill_value=0
#         )

#         input_scaled = scaler.transform(input_df)
#         predicted_score = svm_model.predict(input_scaled)[0]

#         return {
#             "predicted_total_score": round(float(predicted_score), 2),
#             "anxiety_level": get_anxiety_level(predicted_score)
#         }

#     except Exception as e:
#         return {"error": str(e)}

# from fastapi import FastAPI, UploadFile, File
# from pydantic import BaseModel
# import joblib
# import pandas as pd
# import numpy as np
# import os
# import shutil
# import tempfile

# # Feature extractor
# from voice_api.utils.feature_extractor import extract_features


# # --------------------------------------------------
# # Paths
# # --------------------------------------------------
# BASE_DIR = os.path.dirname(__file__)

# # Questionnaire model
# QUESTION_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
# QUESTION_SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

# # Gender model
# GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_svm_model.pkl")
# GENDER_SCALER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_scaler.pkl")

# # --------------------------------------------------
# # Load Models
# # --------------------------------------------------
# question_model = joblib.load(QUESTION_MODEL_PATH)
# question_scaler = joblib.load(QUESTION_SCALER_PATH)

# gender_model = joblib.load(GENDER_MODEL_PATH)
# gender_scaler = joblib.load(GENDER_SCALER_PATH)

# # --------------------------------------------------
# # FastAPI App
# # --------------------------------------------------
# app = FastAPI(
#     title="AnxietySense API",
#     description="Questionnaire + Voice Gender Detection API",
#     version="2.0"
# )

# # --------------------------------------------------
# # Data Models
# # --------------------------------------------------
# class PredictionInput(BaseModel):
#     features: dict

# # --------------------------------------------------
# # Helper Functions
# # --------------------------------------------------
# def get_anxiety_level(score: float):
#     if score <= 20:
#         return "Minimal Anxiety"
#     elif score <= 25:
#         return "Mild Anxiety"
#     elif score <= 41:
#         return "Moderate Anxiety"
#     else:
#         return "Severe Anxiety"

# # --------------------------------------------------
# # Health Check
# # --------------------------------------------------
# @app.get("/")
# def home():
#     return {"status": "Backend running successfully"}

# # --------------------------------------------------
# # 1️⃣ Voice Gender Detection Endpoint
# # --------------------------------------------------
# @app.post("/voice/analyze")
# async def analyze_voice(file: UploadFile = File(...)):
#     try:
#         # Save uploaded audio temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
#             shutil.copyfileobj(file.file, temp_audio)
#             temp_path = temp_audio.name

#         # Extract features
#         features = extract_features(temp_path)

#         # Remove temp file
#         os.remove(temp_path)

#         if features is None:
#             return {
#                 "success": False,
#                 "message": "Audio too short or invalid"
#             }

#         # Scale features
#         features_scaled = gender_scaler.transform([features])

#         # Predict gender
#         gender_pred = gender_model.predict(features_scaled)[0]

#         gender_label = "female" if gender_pred == 0 else "male"

#         # Reject male voices
#         if gender_label == "male":
#             return {
#                 "success": True,
#                 "gender": "male",
#                 "allowed": False,
#                 "message": "This application is designed for female users only."
#             }

#         # Female → allow to continue
#         return {
#             "success": True,
#             "gender": "female",
#             "allowed": True,
#             "message": "Female voice detected. You may continue."
#             # Emotion prediction will be added here later
#         }
    
#          # Placeholder emotion
#         emotion = "calm" if gender == "female" else None

#         return {"gender": gender, "emotion": emotion}

#     except Exception as e:
#         return {
#             "success": False,
#             "error": str(e)
#         }

# # --------------------------------------------------
# # 2️⃣ Questionnaire Prediction Endpoint (UNCHANGED)
# # --------------------------------------------------
# @app.post("/predict")
# def predict_questionnaire(data: PredictionInput):
#     try:
#         input_df = pd.DataFrame([data.features])

#         # Ensure all questions exist
#         input_df = input_df.reindex(
#             columns=[f"Q{i}" for i in range(1, 32)],
#             fill_value=0
#         )

#         # Scale input
#         input_scaled = question_scaler.transform(input_df)

#         # Predict score
#         predicted_score = question_model.predict(input_scaled)[0]

#         return {
#             "predicted_total_score": round(float(predicted_score), 2),
#             "anxiety_level": get_anxiety_level(predicted_score)
#         }

#     except Exception as e:
#         return {"error": str(e)}

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import shutil
import tempfile

from voice_api.utils.feature_extractor import extract_features

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(__file__)

QUESTION_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
QUESTION_SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_svm_model.pkl")
GENDER_SCALER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_scaler.pkl")

# --------------------------------------------------
# Load Models
# --------------------------------------------------
question_model = joblib.load(QUESTION_MODEL_PATH)
question_scaler = joblib.load(QUESTION_SCALER_PATH)

gender_model = joblib.load(GENDER_MODEL_PATH)
gender_scaler = joblib.load(GENDER_SCALER_PATH)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title="AnxietySense API",
    version="2.0"
)

# --------------------------------------------------
# Questionnaire Schema
# --------------------------------------------------
class PredictionInput(BaseModel):
    features: dict

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def get_anxiety_level(score: float):
    if score <= 20:
        return "Minimal Anxiety"
    elif score <= 25:
        return "Mild Anxiety"
    elif score <= 41:
        return "Moderate Anxiety"
    else:
        return "Severe Anxiety"

# --------------------------------------------------
# Health Check
# --------------------------------------------------
@app.get("/")
def home():
    return {"status": "Backend running"}

# --------------------------------------------------
# 🎤 VOICE ANALYSIS (GENDER)
# --------------------------------------------------
@app.post("/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            audio_path = tmp.name

        # Extract features
        features = extract_features(audio_path)
        os.remove(audio_path)

        if features is None:
            return {
                "success": False,
                "message": "Invalid or too short audio"
            }

        features_scaled = gender_scaler.transform([features])
        prediction = gender_model.predict(features_scaled)[0]

        gender = "female" if prediction == 0 else "male"

        if gender == "male":
            return {
                "success": True,
                "gender": "male",
                "allowed": False,
                "emotion": None
            }

        # Female → allowed
        return {
            "success": True,
            "gender": "female",
            "allowed": True,
            "emotion": "calm"  # placeholder
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# --------------------------------------------------
# 📝 QUESTIONNAIRE
# --------------------------------------------------
@app.post("/predict")
def predict_questionnaire(data: PredictionInput):
    input_df = pd.DataFrame([data.features])

    input_df = input_df.reindex(
        columns=[f"Q{i}" for i in range(1, 32)],
        fill_value=0
    )

    input_scaled = question_scaler.transform(input_df)
    score = question_model.predict(input_scaled)[0]

    return {
        "predicted_total_score": round(float(score), 2),
        "anxiety_level": get_anxiety_level(score)
    }


# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import joblib
# import numpy as np
# import os
# import tempfile

# # -----------------------------
# # IMPORT FEATURE EXTRACTOR
# # -----------------------------
# from voice_api.utils.feature_extractor import extract_features

# # -----------------------------
# # PATHS
# # -----------------------------
# BASE_DIR = os.path.dirname(__file__)

# GENDER_MODEL_PATH = os.path.join(
#     BASE_DIR, "voice_api", "model", "gender_svm_model.pkl"
# )
# GENDER_SCALER_PATH = os.path.join(
#     BASE_DIR, "voice_api", "model", "gender_scaler.pkl"
# )

# # -----------------------------
# # LOAD MODEL
# # -----------------------------
# gender_model = joblib.load(GENDER_MODEL_PATH)
# gender_scaler = joblib.load(GENDER_SCALER_PATH)

# # -----------------------------
# # FASTAPI APP
# # -----------------------------
# app = FastAPI(
#     title="AnxietySense API",
#     version="1.0"
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -----------------------------
# # VOICE ANALYSIS ENDPOINT
# # -----------------------------
# @app.post("/voice/analyze")
# async def analyze_voice(file: UploadFile = File(...)):
#     try:
#         # Save uploaded file temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             tmp.write(await file.read())
#             audio_path = tmp.name

#         # Extract features
#         features = extract_features(audio_path)

#         # ❌ INVALID / SILENT AUDIO
#         if features is None or len(features) == 0:
#             return {
#                 "success": False,
#                 "error": "No valid voice detected. Please speak clearly."
#             }

#         # Scale & Predict
#         features = features.reshape(1, -1)
#         features_scaled = gender_scaler.transform(features)
#         pred = gender_model.predict(features_scaled)[0]

#         gender = "female" if pred == 1 else "male"

#         # ❌ BLOCK MALE USERS
#         if gender == "male":
#             return {
#                 "success": True,
#                 "gender": "male",
#                 "allowed": False,
#                 "message": "This application is for women only."
#             }

#         # ✅ FEMALE → CONTINUE
#         return {
#             "success": True,
#             "gender": "female",
#             "allowed": True,
#             "emotion": "calm"  # placeholder for now
#         }

#     except Exception as e:
#         return {
#             "success": False,
#             "error": str(e)
#         }
