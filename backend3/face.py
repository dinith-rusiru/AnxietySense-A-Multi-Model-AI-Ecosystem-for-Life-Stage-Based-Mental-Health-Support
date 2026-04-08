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

print("📦 Loading emotion model...")
model = load_model("model/emotion_detection_model.h5")
print("✅ Emotion model loaded")

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    print("📥 Received image:", file.filename)

    image_bytes = await file.read()
    print("🧠 Image bytes size:", len(image_bytes))

    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_GRAYSCALE)

    if img is None:
        print("❌ OpenCV failed to decode image")
        return {"emotion": "Neutral", "confidence": 0}

    face = cv2.resize(img, (48, 48))
    face = face / 255.0
    face = face.reshape(1, 48, 48, 1)

    preds = model.predict(face)
    idx = int(np.argmax(preds))

    emotion = EMOTIONS[idx]
    confidence = round(float(np.max(preds)) * 100, 2)

    print(f"🎭 Emotion: {emotion}, Confidence: {confidence}%")

    return {
        "emotion": emotion,
        "confidence": confidence
    }
