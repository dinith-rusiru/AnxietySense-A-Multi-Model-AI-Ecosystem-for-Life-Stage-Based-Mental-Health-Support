from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from deepface import DeepFace
import numpy as np
import cv2
import pandas as pd
import os
import datetime
import joblib

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


EMOTION_MODEL_PATH = "model.h5"
SONGS_CSV_PATH = "songs.csv"
ANXIETY_MODEL_PATH = "anxiety_model.pkl"

emotion_model = load_model(EMOTION_MODEL_PATH)
song_df = pd.read_csv(SONGS_CSV_PATH)
anxiety_model = joblib.load(ANXIETY_MODEL_PATH)

print("Emotion model loaded, songs CSV loaded, and anxiety model loaded successfully!")

class_map = {
    0: "angry",
    1: "disgust",
    2: "fear",
    3: "happy",
    4: "neutral",
    5: "sad",
    6: "surprise",
}

def predict_emotion(image_path: str):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image. Ensure it's a valid image file.")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (48, 48))
    img = img.astype("float32") / 255.0

    img = img.reshape(48, 48, 1)
    img = np.expand_dims(img, axis=0)

    pred = emotion_model.predict(img, verbose=0)
    pred_idx = int(np.argmax(pred))

    pred_label = class_map[pred_idx]
    pred_prob = float(np.max(pred))
    return pred_label, pred_prob

def detect_age(image_path: str):
    try:
        result = DeepFace.analyze(
            img_path=image_path,
            actions=["age"],
            enforce_detection=False,
        )
        age = result[0]["age"]
        return int(age)
    except Exception as e:
        print("Age detection error:", e)
        return None

def get_teenage_year_range(current_year: int, age: int):
    teenage_offset = age - 25
    teenage_year = current_year - teenage_offset
    return teenage_year - 5, teenage_year + 5

def get_song_recommendations(df: pd.DataFrame, mood: str, start_year: int, end_year: int):
    results = df[
        (df["mood"].astype(str).str.lower() == mood.lower())
        & (df["year"].between(start_year, end_year))
    ]
    return results

anxiety_labels = ["Minimal", "Mild", "Moderate", "Severe"]

def manual_anxiety_score(answers):
    total = sum(answers)
    if total <= 9:
        result = "Minimal"
    elif total <= 14:
        result = "Mild"
    elif total <= 21:
        result = "Moderate"
    else:
        result = "Severe"
    return total, result

def parse_anxiety_answers(data):
    answers = []
    for i in range(1, 11):
        key = f"q{i}"
        if key not in data:
            raise KeyError(f"Missing field: {key}")
        answers.append(int(data[key]))
    return answers

@app.get("/")
def home():
    return {"message": "API Running: /predict-emotion-songs (image + age) and /predict-anxiety (json)"}

@app.post("/predict-emotion-songs")
async def predict_emotion_songs(
    image: UploadFile = File(...),
    age: int = Form(...)
):
    # age is REQUIRED for song selection
    if not (1 <= age <= 120):
        raise HTTPException(status_code=400, detail="Invalid 'age'. Use a realistic integer (1-120).")

    temp_path = "temp_img.jpg"
    try:
        contents = await image.read()
        with open(temp_path, "wb") as f:
            f.write(contents)
        # predicted age for RETURN ONLY (not used in calculations)
        predicted_age = detect_age(temp_path)
        current_year = datetime.datetime.now().year

        mood, confidence = predict_emotion(temp_path)
        # IMPORTANT: use manual_age here
        start_year, end_year = get_teenage_year_range(current_year, age)
        results = get_song_recommendations(song_df, mood, start_year, end_year)

        return {
            "age_used": age,
            "predicted_age": predicted_age,
            "mood": mood,
            "confidence": confidence,
            "teenage_year_range": f"{start_year}-{end_year}",
            "recommended_songs": results.to_dict(orient="records"),
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

from pydantic import BaseModel
from typing import Dict

class AnxietyRequest(BaseModel):
    q1: int
    q2: int
    q3: int
    q4: int
    q5: int
    q6: int
    q7: int
    q8: int
    q9: int
    q10: int

@app.post("/predict-anxiety")
def predict_anxiety(data: AnxietyRequest):
    answers = parse_anxiety_answers(data.dict())
    features = np.array([answers])

    ml_prediction = int(anxiety_model.predict(features)[0])
    ml_result = (
        anxiety_labels[ml_prediction]
        if 0 <= ml_prediction < len(anxiety_labels)
        else str(ml_prediction)
    )

    total_score, manual_result = manual_anxiety_score(answers)

    return {
        "answers": answers,
        "total_score": total_score,
        "manual_result": manual_result,
        "ml_prediction": ml_result,
    }