import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    'models',
    'final_child_anxiety_model_v2.keras'
)

model = None

def get_model():
    global model
    if model is None:
        print('Loading child anxiety model...')
        model = tf.keras.models.load_model(MODEL_PATH)
        print('Model loaded successfully')
    return model

IMG_SIZE         = (128, 128)
CHILDREN_CLASSES = ['Natural', 'anger', 'fear', 'joy', 'sadness']
ANXIETY_WEIGHTS  = {
    'fear'   : 1.0,
    'sadness': 0.75,
    'anger'  : 0.6,
    'Natural': 0.0,
    'joy'    : 0.0,
}

def predict_from_bytes(image_bytes: bytes) -> dict:
    img  = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img  = img.resize(IMG_SIZE)
    arr  = np.array(img) / 255.0
    arr  = np.expand_dims(arr, axis=0)

    mdl   = get_model()
    probs = mdl.predict(arr, verbose=0)[0]

    top_idx     = int(np.argmax(probs))
    top_emotion = CHILDREN_CLASSES[top_idx]
    confidence  = float(probs[top_idx] * 100)

    anxiety = float(sum(
        probs[i] * ANXIETY_WEIGHTS.get(CHILDREN_CLASSES[i], 0)
        for i in range(len(probs))
    ) * 100)

    if anxiety >= 60:
        level = 'HIGH'
    elif anxiety >= 35:
        level = 'MODERATE'
    else:
        level = 'CALM'

    return {
        'emotion'      : top_emotion,
        'confidence'   : round(confidence, 1),
        'anxiety_score': round(anxiety, 1),
        'anxiety_level': level,
        'all_emotions' : {
            CHILDREN_CLASSES[i]: round(float(probs[i] * 100), 1)
            for i in range(len(probs))
        }
    }