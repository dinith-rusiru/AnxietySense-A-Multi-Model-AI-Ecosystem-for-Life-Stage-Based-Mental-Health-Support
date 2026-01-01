import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
from tensorflow import keras
from PIL import Image
import io

app = FastAPI(title="Face Emotion API")

model = keras.models.load_model(
    "model/face_emotion_cnn.h5",
    compile=False
)

emotion_dict = {
    0: "angry",
    1: "fear",
    2: "happy",
    3: "neutral",
    4: "sad",
    5: "surprise"
}

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

@app.post("/emotion")
async def detect_emotion(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = np.array(image)

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {"error": "No face detected"}

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (48, 48))
    face = face / 255.0
    face = face.reshape(1, 48, 48, 1)

    pred = model.predict(face, verbose=0)
    idx = int(np.argmax(pred))

    return {
        "emotion": emotion_dict[idx],
        "confidence": round(float(pred[0][idx] * 100), 2)
    }
