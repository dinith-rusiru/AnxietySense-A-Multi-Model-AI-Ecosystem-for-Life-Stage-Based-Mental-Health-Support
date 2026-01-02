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

# from fastapi import FastAPI, UploadFile, File
# from pydantic import BaseModel
# import joblib
# import pandas as pd
# import os
# import shutil
# import tempfile

# from voice_api.utils.feature_extractor import extract_features

# # --------------------------------------------------
# # Paths
# # --------------------------------------------------
# BASE_DIR = os.path.dirname(__file__)

# QUESTION_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
# QUESTION_SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

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
#     version="2.0"
# )

# # --------------------------------------------------
# # Questionnaire Schema
# # --------------------------------------------------
# class PredictionInput(BaseModel):
#     features: dict

# # --------------------------------------------------
# # Helpers
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
#     return {"status": "Backend running"}

# # --------------------------------------------------
# # 🎤 VOICE ANALYSIS (GENDER)
# # --------------------------------------------------
# @app.post("/voice/analyze")
# async def analyze_voice(file: UploadFile = File(...)):
#     try:
#         # Save temp file
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
#             shutil.copyfileobj(file.file, tmp)
#             audio_path = tmp.name

#         # Extract features
#         features = extract_features(audio_path)
#         os.remove(audio_path)

#         if features is None:
#             return {
#                 "success": False,
#                 "message": "Invalid or too short audio"
#             }

#         features_scaled = gender_scaler.transform([features])
#         prediction = gender_model.predict(features_scaled)[0]

#         gender = "female" if prediction == 0 else "male"

#         if gender == "male":
#             return {
#                 "success": True,
#                 "gender": "male",
#                 "allowed": False,
#                 "emotion": None
#             }

#         # Female → allowed
#         return {
#             "success": True,
#             "gender": "female",
#             "allowed": True,
#             "emotion": "calm"  # placeholder
#         }

#     except Exception as e:
#         return {
#             "success": False,
#             "error": str(e)
#         }

# # --------------------------------------------------
# # 📝 QUESTIONNAIRE
# # --------------------------------------------------
# @app.post("/predict")
# def predict_questionnaire(data: PredictionInput):
#     input_df = pd.DataFrame([data.features])

#     input_df = input_df.reindex(
#         columns=[f"Q{i}" for i in range(1, 32)],
#         fill_value=0
#     )

#     input_scaled = question_scaler.transform(input_df)
#     score = question_model.predict(input_scaled)[0]

#     return {
#         "predicted_total_score": round(float(score), 2),
#         "anxiety_level": get_anxiety_level(score)
#     }

# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import joblib
# import pandas as pd
# import os
# import shutil
# import tempfile
# import traceback
# from pydub import AudioSegment

# from voice_api.utils.feature_extractor import extract_features

# # --------------------------------------------------
# # Paths
# # --------------------------------------------------
# BASE_DIR = os.path.dirname(__file__)

# QUESTION_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
# QUESTION_SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

# GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_svm_model.pkl")
# GENDER_SCALER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_scaler.pkl")

# # --------------------------------------------------
# # Load Models
# # --------------------------------------------------
# try:
#     question_model = joblib.load(QUESTION_MODEL_PATH)
#     question_scaler = joblib.load(QUESTION_SCALER_PATH)
#     print("✓ Questionnaire models loaded successfully")
# except Exception as e:
#     print(f"✗ Error loading questionnaire models: {e}")
#     question_model = None
#     question_scaler = None

# try:
#     gender_model = joblib.load(GENDER_MODEL_PATH)
#     gender_scaler = joblib.load(GENDER_SCALER_PATH)
#     print("✓ Gender models loaded successfully")
# except Exception as e:
#     print(f"✗ Error loading gender models: {e}")
#     gender_model = None
#     gender_scaler = None

# # --------------------------------------------------
# # FastAPI App
# # --------------------------------------------------
# app = FastAPI(
#     title="AnxietySense API",
#     version="2.0"
# )

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --------------------------------------------------
# # Questionnaire Schema
# # --------------------------------------------------
# class PredictionInput(BaseModel):
#     features: dict

# # --------------------------------------------------
# # Helper Functions
# # --------------------------------------------------
# def get_anxiety_level(score: float):
#     """Determine anxiety level based on score"""
#     if score <= 20:
#         return "Minimal Anxiety"
#     elif score <= 25:
#         return "Mild Anxiety"
#     elif score <= 41:
#         return "Moderate Anxiety"
#     else:
#         return "Severe Anxiety"

# def convert_to_wav(input_path: str, output_path: str) -> bool:
#     """
#     Convert audio file to WAV format
#     Supports: m4a, mp3, ogg, flac, etc.
#     Returns True if successful, False otherwise
#     """
#     try:
#         print(f"Converting {input_path} to WAV format...")
        
#         # Detect file format from extension
#         file_ext = input_path.split('.')[-1].lower()
        
#         # Load audio file
#         if file_ext == 'm4a':
#             audio = AudioSegment.from_file(input_path, format='m4a')
#         elif file_ext == 'mp3':
#             audio = AudioSegment.from_mp3(input_path)
#         elif file_ext == 'ogg':
#             audio = AudioSegment.from_ogg(input_path)
#         elif file_ext == 'wav':
#             # Already WAV, just copy
#             shutil.copy(input_path, output_path)
#             print("File already in WAV format")
#             return True
#         else:
#             # Try generic format
#             audio = AudioSegment.from_file(input_path)
        
#         # Export as WAV with standard parameters
#         audio.export(
#             output_path,
#             format='wav',
#             parameters=[
#                 '-ar', '22050',  # Sample rate 22050 Hz
#                 '-ac', '1',       # Mono channel
#                 '-sample_fmt', 's16'  # 16-bit
#             ]
#         )
        
#         print(f"✓ Successfully converted to WAV: {output_path}")
#         return True
        
#     except Exception as e:
#         print(f"✗ Conversion error: {e}")
#         print(traceback.format_exc())
#         return False

# # --------------------------------------------------
# # Health Check
# # --------------------------------------------------
# @app.get("/")
# def home():
#     return {
#         "status": "Backend running",
#         "version": "2.0",
#         "models_loaded": {
#             "gender": gender_model is not None,
#             "questionnaire": question_model is not None
#         }
#     }

# # --------------------------------------------------
# # 🎤 VOICE ANALYSIS (GENDER DETECTION)
# # --------------------------------------------------
# @app.post("/voice/analyze")
# async def analyze_voice(file: UploadFile = File(...)):
#     """
#     Analyze voice recording for gender detection
#     Accepts: m4a, mp3, wav, ogg, etc.
#     Returns: gender, allowed status, emotion
#     """
#     temp_input_path = None
#     temp_wav_path = None
    
#     try:
#         print(f"\n{'='*50}")
#         print(f"Received file: {file.filename}")
#         print(f"Content type: {file.content_type}")
#         print(f"{'='*50}\n")
        
#         # Check if models are loaded
#         if gender_model is None or gender_scaler is None:
#             return {
#                 "success": False,
#                 "message": "Gender detection models not loaded on server",
#                 "gender": None,
#                 "allowed": False,
#                 "emotion": None
#             }
        
#         # Determine file extension
#         file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'unknown'
#         print(f"Detected file extension: {file_ext}")
        
#         # Save uploaded file temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp_input:
#             shutil.copyfileobj(file.file, tmp_input)
#             temp_input_path = tmp_input.name
        
#         print(f"Saved uploaded file to: {temp_input_path}")
#         print(f"File size: {os.path.getsize(temp_input_path)} bytes")
        
#         # Convert to WAV if needed
#         temp_wav_path = tempfile.mktemp(suffix='.wav')
        
#         if file_ext != 'wav':
#             print(f"Converting {file_ext} to WAV...")
#             conversion_success = convert_to_wav(temp_input_path, temp_wav_path)
            
#             if not conversion_success:
#                 return {
#                     "success": False,
#                     "message": f"Could not convert {file_ext} to WAV format. Please try recording again.",
#                     "gender": None,
#                     "allowed": False,
#                     "emotion": None
#                 }
#         else:
#             # Already WAV, use it directly
#             shutil.copy(temp_input_path, temp_wav_path)
        
#         print(f"WAV file ready: {temp_wav_path}")
#         print(f"WAV file size: {os.path.getsize(temp_wav_path)} bytes")
        
#         # Extract features from WAV file
#         print("Extracting audio features...")
#         features = extract_features(temp_wav_path)
        
#         # Clean up temp files
#         if temp_input_path and os.path.exists(temp_input_path):
#             os.remove(temp_input_path)
#         if temp_wav_path and os.path.exists(temp_wav_path):
#             os.remove(temp_wav_path)
        
#         if features is None:
#             return {
#                 "success": False,
#                 "message": "Audio too short or invalid. Please record for at least 2-3 seconds.",
#                 "gender": None,
#                 "allowed": False,
#                 "emotion": None
#             }
        
#         print(f"Features extracted successfully. Shape: {features.shape}")
        
#         # Scale features
#         features_scaled = gender_scaler.transform([features])
#         print("Features scaled")
        
#         # Predict gender
#         prediction = gender_model.predict(features_scaled)[0]
#         print(f"Raw prediction: {prediction}")
        
#         # Map prediction to gender
#         # Assuming: 0 = female, 1 = male (verify with your training data)
#         gender = "female" if prediction == 0 else "male"
#         allowed = (gender == "female")
        
#         response = {
#             "success": True,
#             "gender": gender,
#             "allowed": allowed,
#             "emotion": "calm" if allowed else None  # Placeholder
#         }
        
#         print(f"\n{'='*50}")
#         print(f"FINAL RESPONSE: {response}")
#         print(f"{'='*50}\n")
        
#         return response
    
#     except Exception as e:
#         # Clean up temp files
#         if temp_input_path and os.path.exists(temp_input_path):
#             try:
#                 os.remove(temp_input_path)
#             except:
#                 pass
#         if temp_wav_path and os.path.exists(temp_wav_path):
#             try:
#                 os.remove(temp_wav_path)
#             except:
#                 pass
        
#         print(f"\n{'='*50}")
#         print(f"ERROR in voice analysis:")
#         print(str(e))
#         print(traceback.format_exc())
#         print(f"{'='*50}\n")
        
#         return {
#             "success": False,
#             "error": str(e),
#             "message": "Voice analysis failed. Please try again.",
#             "gender": None,
#             "allowed": False,
#             "emotion": None
#         }

# # --------------------------------------------------
# # 📝 QUESTIONNAIRE PREDICTION
# # --------------------------------------------------
# @app.post("/predict")
# def predict_questionnaire(data: PredictionInput):
#     """
#     Predict anxiety score from questionnaire responses
#     """
#     try:
#         if question_model is None or question_scaler is None:
#             raise HTTPException(
#                 status_code=500,
#                 detail="Questionnaire models not loaded"
#             )
        
#         # Create dataframe
#         input_df = pd.DataFrame([data.features])
        
#         # Ensure all 31 questions present
#         input_df = input_df.reindex(
#             columns=[f"Q{i}" for i in range(1, 32)],
#             fill_value=0
#         )
        
#         # Scale and predict
#         input_scaled = question_scaler.transform(input_df)
#         score = question_model.predict(input_scaled)[0]
        
#         return {
#             "success": True,
#             "predicted_total_score": round(float(score), 2),
#             "anxiety_level": get_anxiety_level(score)
#         }
    
#     except Exception as e:
#         print(f"Questionnaire error: {e}")
#         print(traceback.format_exc())
#         raise HTTPException(status_code=500, detail=str(e))

# # --------------------------------------------------
# # Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
# # --------------------------------------------------

# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import joblib
# import numpy as np
# import pandas as pd
# import os
# import uuid
# import librosa
# import tensorflow as tf
# from pydub import AudioSegment

# # -------------------------------
# # PATHS
# # -------------------------------
# BASE_DIR = os.path.dirname(__file__)
# TEMP_DIR = os.path.join(BASE_DIR, "temp_audio")
# os.makedirs(TEMP_DIR, exist_ok=True)

# # Questionnaire model
# SVM_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
# SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

# # Voice models
# GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_svm_model.pkl")
# GENDER_SCALER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_scaler.pkl")

# EMOTION_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_model.keras")
# EMOTION_ENCODER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_label_encoder.pkl")

# # -------------------------------
# # LOAD MODELS
# # -------------------------------
# svm_model = joblib.load(SVM_MODEL_PATH)
# svm_scaler = joblib.load(SCALER_PATH)

# gender_model = joblib.load(GENDER_MODEL_PATH)
# gender_scaler = joblib.load(GENDER_SCALER_PATH)

# emotion_model = tf.keras.models.load_model(EMOTION_MODEL_PATH)
# emotion_encoder = joblib.load(EMOTION_ENCODER_PATH)

# # -------------------------------
# # FASTAPI APP
# # -------------------------------
# app = FastAPI(title="AnxietySense API", version="1.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -------------------------------
# # HELPERS
# # -------------------------------
# def convert_m4a_to_wav(input_path, output_path):
#     audio = AudioSegment.from_file(input_path, format="m4a")
#     audio.export(output_path, format="wav")

# def extract_mfcc(file_path):
#     y, sr = librosa.load(file_path, duration=3, offset=0.5)
#     mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
#     return mfcc

# def anxiety_level(score):
#     if score <= 20:
#         return "Minimal Anxiety"
#     elif score <= 25:
#         return "Mild Anxiety"
#     elif score <= 41:
#         return "Moderate Anxiety"
#     else:
#         return "Severe Anxiety"

# def emotion_weight(emotion):
#     weights = {
#         "happy": -2,
#         "sad": 3,
#         "fear": 4,
#         "anger": 4
#     }
#     return weights.get(emotion, 0)

# # -------------------------------
# # VOICE ANALYSIS ENDPOINT
# # -------------------------------
# @app.post("/voice/analyze")
# async def analyze_voice(file: UploadFile = File(...)):
#     uid = str(uuid.uuid4())
#     m4a_path = os.path.join(TEMP_DIR, f"{uid}.m4a")
#     wav_path = os.path.join(TEMP_DIR, f"{uid}.wav")

#     with open(m4a_path, "wb") as f:
#         f.write(await file.read())

#     convert_m4a_to_wav(m4a_path, wav_path)

#     mfcc = extract_mfcc(wav_path).reshape(1, -1)

#     # Gender
#     gender_scaled = gender_scaler.transform(mfcc)
#     gender_pred = gender_model.predict(gender_scaled)[0]
#     gender = "female" if gender_pred == 1 else "male"

#     # Emotion
#     emotion_input = np.expand_dims(mfcc, -1)
#     emotion_probs = emotion_model.predict(emotion_input)
#     emotion_idx = np.argmax(emotion_probs)
#     emotion = emotion_encoder.inverse_transform([emotion_idx])[0]

#     return {
#         "success": True,
#         "gender": gender,
#         "emotion": emotion,
#         "allowed": gender == "female"
#     }

# # -------------------------------
# # QUESTIONNAIRE INPUT
# # -------------------------------
# class QuestionnaireInput(BaseModel):
#     answers: dict
#     emotion: str

# # -------------------------------
# # FINAL ANXIETY PREDICTION
# # -------------------------------
# @app.post("/anxiety/final")
# def final_anxiety(data: QuestionnaireInput):
#     df = pd.DataFrame([data.answers])
#     df = df.reindex(columns=[f"Q{i}" for i in range(1, 32)], fill_value=0)

#     scaled = svm_scaler.transform(df)
#     score = svm_model.predict(scaled)[0]

#     final_score = score + emotion_weight(data.emotion)

#     return {
#         "questionnaire_score": round(float(score), 2),
#         "emotion": data.emotion,
#         "final_score": round(float(final_score), 2),
#         "anxiety_level": anxiety_level(final_score)
#     }

# # -------------------------------
# # ROOT
# # -------------------------------
# @app.get("/")
# def root():
#     return {"status": "AnxietySense backend running"}


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

from voice_api.utils.feature_extractor import extract_gender_features, extract_emotion_features

# -----------------------------
# PATHS
# -----------------------------
BASE_DIR = os.path.dirname(__file__)
TEMP_DIR = os.path.join(BASE_DIR, "temp_audio")
os.makedirs(TEMP_DIR, exist_ok=True)

# Questionnaire
SVM_MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

# Voice
GENDER_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_svm_model.pkl")
GENDER_SCALER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "gender_scaler.pkl")

EMOTION_MODEL_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_model.keras")
EMOTION_ENCODER_PATH = os.path.join(BASE_DIR, "voice_api", "model", "emotion_label_encoder.pkl")

# -----------------------------
# LOAD MODELS
# -----------------------------
svm_model = joblib.load(SVM_MODEL_PATH)
svm_scaler = joblib.load(SCALER_PATH)

gender_model = joblib.load(GENDER_MODEL_PATH)
gender_scaler = joblib.load(GENDER_SCALER_PATH)

emotion_model = tf.keras.models.load_model(EMOTION_MODEL_PATH)
emotion_encoder = joblib.load(EMOTION_ENCODER_PATH)

# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI(title="AnxietySense API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def convert_m4a_to_wav(input_path, output_path):
    audio = AudioSegment.from_file(input_path, format="m4a")
    audio.export(output_path, format="wav")

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
    weights = {
        "happy": -2,
        "sad": 3,
        "fear": 4,
        "anger": 4
    }
    return weights.get(emotion, 0)

# -----------------------------
# VOICE ANALYSIS
# -----------------------------
@app.post("/voice/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        uid = str(uuid.uuid4())
        m4a_path = os.path.join(TEMP_DIR, f"{uid}.m4a")
        wav_path = os.path.join(TEMP_DIR, f"{uid}.wav")

        # Save uploaded file
        with open(m4a_path, "wb") as f:
            f.write(await file.read())

        convert_m4a_to_wav(m4a_path, wav_path)

        # -----------------------------
        # Gender prediction
        # -----------------------------
        gender_features = extract_gender_features(wav_path)
        if gender_features is None:
            return {"success": False, "error": "No valid voice detected"}

        gender_scaled = gender_scaler.transform(gender_features.reshape(1, -1))
        gender_pred = gender_model.predict(gender_scaled)[0]
        gender = "female" if gender_pred == 1 else "male"

        # -----------------------------
        # Emotion prediction
        # -----------------------------
        emotion_features = extract_emotion_features(wav_path)
        emotion_input = np.expand_dims(emotion_features, axis=(0,2))  # shape (1,40,1)
        emotion_probs = emotion_model.predict(emotion_input)
        emotion_idx = np.argmax(emotion_probs)
        emotion = emotion_encoder.inverse_transform([emotion_idx])[0]

        # -----------------------------
        # Response
        # -----------------------------
        return {
            "success": True,
            "gender": gender,
            "emotion": emotion,
            "allowed": gender=="female"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

# -----------------------------
# QUESTIONNAIRE FINAL ANXIETY
# -----------------------------
class QuestionnaireInput(BaseModel):
    answers: dict
    emotion: str

@app.post("/anxiety/final")
def final_anxiety(data: QuestionnaireInput):
    df = pd.DataFrame([data.answers])
    df = df.reindex(columns=[f"Q{i}" for i in range(1,32)], fill_value=0)
    scaled = svm_scaler.transform(df)
    score = svm_model.predict(scaled)[0]
    final_score = score + emotion_weight(data.emotion)
    return {
        "questionnaire_score": round(float(score),2),
        "emotion": data.emotion,
        "final_score": round(float(final_score),2),
        "anxiety_level": anxiety_level(final_score)
    }

# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
def root():
    return {"status": "AnxietySense backend running"}
