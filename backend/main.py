from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import os

# --------------------------------------------------
# Paths (FIXED)
# --------------------------------------------------
BASE_DIR = os.path.dirname(__file__)

MODEL_PATH = os.path.join(BASE_DIR, "model", "svm_total_score_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

# --------------------------------------------------
# Load Model & Scaler
# --------------------------------------------------
svm_model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title="AnxietySense API",
    description="SVM-based Anxiety Score Prediction API",
    version="1.0"
)

class PredictionInput(BaseModel):
    features: dict

def get_anxiety_level(score: float):
    if score <= 20:
        return "Minimal Anxiety"
    elif score <= 25:
        return "Mild Anxiety"
    elif score <= 41:
        return "Moderate Anxiety"
    else:
        return "Severe Anxiety"

@app.get("/")
def home():
    return {"status": "Backend running"}

@app.post("/predict")
def predict(data: PredictionInput):
    try:
        input_df = pd.DataFrame([data.features])

        input_df = input_df.reindex(
            columns=[f"Q{i}" for i in range(1, 32)],
            fill_value=0
        )

        input_scaled = scaler.transform(input_df)
        predicted_score = svm_model.predict(input_scaled)[0]

        return {
            "predicted_total_score": round(float(predicted_score), 2),
            "anxiety_level": get_anxiety_level(predicted_score)
        }

    except Exception as e:
        return {"error": str(e)}
