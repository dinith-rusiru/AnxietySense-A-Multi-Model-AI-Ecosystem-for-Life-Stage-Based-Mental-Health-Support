import json
import numpy as np
import cv2
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

MODEL_PATH = "emotion_model.keras"
CLASS_PATH = "class_names.json"
IMG_SIZE = (48, 48)

app = FastAPI(title="Emotion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model(MODEL_PATH, compile=False)
class_names = json.load(open(CLASS_PATH, "r"))

@app.get("/health")
def health():
    return {"ok": True, "classes": class_names}

@app.post("/predict-emotion")
async def predict_emotion(image: UploadFile = File(...)):
    data = await image.read()

    # decode image
    npimg = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return {"error": "Invalid image"}

    img = cv2.resize(img, IMG_SIZE)
    x = img.astype("float32") / 255.0
    x = x.reshape(1, IMG_SIZE[0], IMG_SIZE[1], 1)

    probs = model.predict(x, verbose=0)[0]
    idx = int(np.argmax(probs))
    return {
        "emotion": class_names[idx],
        "confidence": float(probs[idx]),
        "all_probs": {class_names[i]: float(probs[i]) for i in range(len(class_names))}
    }
