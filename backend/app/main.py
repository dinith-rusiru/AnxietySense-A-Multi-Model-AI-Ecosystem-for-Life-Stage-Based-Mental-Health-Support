from pathlib import Path
import json
import numpy as np
from joblib import load

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
ML_DIR = APP_DIR / "ml"
MODEL_PATH = ML_DIR / "model.joblib"
META_PATH = ML_DIR / "meta.json"

app = FastAPI(title="Child Anxiety Score Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_meta = None

class PredictRequest(BaseModel):
    answers: list[float] = Field(..., min_length=1)

@app.on_event("startup")
def load_artifacts():
    global _model, _meta
    if not MODEL_PATH.exists() or not META_PATH.exists():
        raise RuntimeError("Model artifacts not found. Train notebook first.")
    _model = load(MODEL_PATH)
    _meta = json.loads(META_PATH.read_text())

@app.get("/health")
def health():
    return {"ok": True, "model_loaded": _model is not None}

@app.get("/meta")
def meta():
    if _meta is None:
        raise HTTPException(status_code=500, detail="Meta not loaded")
    return _meta

@app.post("/predict")
def predict(req: PredictRequest):
    if _model is None or _meta is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    feature_cols = _meta["feature_cols"]
    max_score = int(_meta.get("max_score", len(feature_cols) * 3))

    if len(req.answers) != len(feature_cols):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(feature_cols)} answers, got {len(req.answers)}"
        )

    X = np.array(req.answers, dtype=float).reshape(1, -1)

    score = float(_model.predict(X)[0])
    score = max(0.0, min(float(max_score), score))
    score_int = int(round(score))

    # numeric level from score (same as your dataset idea)
    if score_int <= 14:
        level_num = 0
    elif score_int <= 34:
        level_num = 1
    else:
        level_num = 2

    return {
        "predicted_score": score_int,
        "predicted_level_num": level_num
    }
