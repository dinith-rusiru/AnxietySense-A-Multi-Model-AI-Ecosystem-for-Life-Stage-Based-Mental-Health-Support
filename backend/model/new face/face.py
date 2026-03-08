from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from tensorflow.keras.models import load_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model("model/emotion_detection_model.h5")

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_GRAYSCALE)

    face = cv2.resize(img, (48, 48))
    face = face / 255.0
    face = face.reshape(1, 48, 48, 1)

    preds = model.predict(face)
    emotion = EMOTIONS[np.argmax(preds)]

    return {
        "emotion": emotion,
        "confidence": round(float(np.max(preds)) * 100, 2)
    }
