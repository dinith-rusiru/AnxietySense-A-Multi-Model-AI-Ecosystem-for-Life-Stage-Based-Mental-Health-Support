from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

router = APIRouter()

# ══════════════════════════════════════════════════════════════
# MODEL LOADERS
# ══════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(__file__)

# Face model
FACE_MODEL_PATH = os.path.join(BASE_DIR, '..', '..','models', 'final_child_anxiety_model_v2.keras')
face_model      = None

def get_face_model():
    global face_model
    if face_model is None:
        print('Loading face anxiety model...')
        face_model = tf.keras.models.load_model(FACE_MODEL_PATH)
        print('✅ Face model loaded')
    return face_model

# Drawing model (your downloaded drawing_emotion_modelfinal.keras)
DRAW_MODEL_PATH = os.path.join(BASE_DIR, '..', '..', 'models', 'drawing_emotion_modelfinal.keras')
draw_model      = None

def get_draw_model():
    global draw_model
    if draw_model is None:
        if not os.path.exists(DRAW_MODEL_PATH):
            raise FileNotFoundError(f'Drawing model not found at {DRAW_MODEL_PATH}')
        print('Loading drawing emotion model...')
        draw_model = tf.keras.models.load_model(DRAW_MODEL_PATH)
        print('✅ Drawing model loaded')
    return draw_model

# ══════════════════════════════════════════════════════════════
# CONFIG
# ══════════════════════════════════════════════════════════════

# Face model config
FACE_IMG_SIZE  = (128, 128)
FACE_CLASSES   = ['Natural', 'anger', 'fear', 'joy', 'sadness']
FACE_ANXIETY_W = {'fear': 1.0, 'sadness': 0.75, 'anger': 0.6, 'Natural': 0.0, 'joy': 0.0}

# Drawing model config (Angry/Fear/Happy/Sad from Kaggle dataset)
DRAW_IMG_SIZE  = (224, 224)
DRAW_CLASSES   = ['Angry', 'Fear', 'Happy', 'Sad']
DRAW_ANXIETY_W = {'Angry': 0.75, 'Fear': 1.0, 'Happy': 0.0, 'Sad': 0.65}

# ══════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════
def bytes_to_array(image_bytes: bytes, size: tuple) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(size)
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

def anxiety_level(score: float) -> str:
    if score >= 60: return 'HIGH'
    if score >= 35: return 'MODERATE'
    return 'CALM'

# ══════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════

@router.get('/health')
def health():
    face_ok = os.path.exists(FACE_MODEL_PATH)
    draw_ok = os.path.exists(DRAW_MODEL_PATH)
    return {
        'status'       : 'ok',
        'module'       : 'dinth-child-anxiety',
        'face_model'   : '✅ found' if face_ok else '❌ missing',
        'drawing_model': '✅ found' if draw_ok else '❌ missing — place drawing_emotion_modelfinal.keras in models/',
    }

# ── Face emotion prediction ───────────────────────────────────
@router.post('/predict')
async def predict_anxiety(file: UploadFile = File(...)):
    print(f'Face predict: {file.filename} | {file.content_type}')
    try:
        image_bytes = await file.read()
        if len(image_bytes) < 1000:
            raise HTTPException(400, f'Image too small: {len(image_bytes)} bytes')

        arr   = bytes_to_array(image_bytes, FACE_IMG_SIZE)
        mdl   = get_face_model()
        probs = mdl.predict(arr, verbose=0)[0]

        top_idx  = int(np.argmax(probs))
        emotion  = FACE_CLASSES[top_idx]
        conf     = float(probs[top_idx] * 100)
        anxiety  = float(sum(
            probs[i] * FACE_ANXIETY_W.get(FACE_CLASSES[i], 0)
            for i in range(len(probs))
        ) * 100)

        return {
            'success': True,
            'data': {
                'emotion'      : emotion,
                'confidence'   : round(conf, 1),
                'anxiety_score': round(anxiety, 1),
                'anxiety_level': anxiety_level(anxiety),
                'all_emotions' : {
                    FACE_CLASSES[i]: round(float(probs[i] * 100), 1)
                    for i in range(len(probs))
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f'Face prediction failed: {str(e)}')

# ── Drawing emotion prediction (NEW) ─────────────────────────
@router.post('/predict-drawing')
async def predict_drawing(file: UploadFile = File(...)):
    """
    Receives a drawing image (canvas screenshot or uploaded image).
    Returns: emotion (Angry/Fear/Happy/Sad), anxiety score, level.
    """
    print(f'Drawing predict: {file.filename} | {file.content_type}')
    try:
        image_bytes = await file.read()
        if len(image_bytes) < 500:
            raise HTTPException(400, f'Image too small: {len(image_bytes)} bytes')

        arr   = bytes_to_array(image_bytes, DRAW_IMG_SIZE)
        mdl   = get_draw_model()
        probs = mdl.predict(arr, verbose=0)[0]

        top_idx  = int(np.argmax(probs))
        emotion  = DRAW_CLASSES[top_idx]
        conf     = float(probs[top_idx] * 100)
        anxiety  = float(sum(
            probs[i] * DRAW_ANXIETY_W.get(DRAW_CLASSES[i], 0)
            for i in range(len(probs))
        ) * 100)

        return {
            'success': True,
            'data': {
                'emotion'      : emotion,
                'confidence'   : round(conf, 1),
                'anxiety_score': round(anxiety, 1),
                'anxiety_level': anxiety_level(anxiety),
                'all_emotions' : {
                    DRAW_CLASSES[i]: round(float(probs[i] * 100), 1)
                    for i in range(len(probs))
                }
            }
        }
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f'Drawing prediction failed: {str(e)}')

# ── Algorithmic drawing analysis (kept for optional use) ──────
class DrawingMetrics(BaseModel):
    totalStrokes    : int
    colorUsage      : Dict[str, int]
    zoneStrokes     : Dict[str, int]
    zoneDarkness    : Dict[str, Any]
    crossings       : int
    pauses          : List[float]
    overpaintPixels : int
    duration        : int
    mode            : str = 'draw'

class DrawingPayload(BaseModel):
    metrics      : DrawingMetrics
    camera_score : float

DARK_COLORS = {'#795548', '#607d8b', '#212121'}
ZONES_META  = {
    'sky': 'Mood', 'roof': 'Fantasy', 'wall': 'Ego',
    'door': 'Social', 'window_left': 'Past', 'window_right': 'Future', 'ground': 'Security',
}

@router.post('/analyze-drawing')
def analyze_drawing_endpoint(payload: DrawingPayload):
    m = payload.metrics
    scores, flags = {}, []

    total  = sum(m.colorUsage.values()) or 1
    dark   = sum(v for k, v in m.colorUsage.items() if k.lower() in DARK_COLORS)
    dp     = dark / total
    scores['darkness'] = round(dp * 25)
    if dp > 0.5:
        flags.append({'label': f'Heavy dark use ({round(dp*100)}%)', 'severity': 'high' if dp > 0.7 else 'medium'})

    cr = min(1.0, m.crossings / 30)
    scores['crossing'] = round(cr * 25)
    if m.crossings > 5:
        flags.append({'label': f'{m.crossings} boundary crossings', 'severity': 'high' if m.crossings > 15 else 'medium'})

    avoided = len(ZONES_META) - len(m.zoneStrokes)
    scores['avoidance'] = round((avoided / len(ZONES_META)) * 20)
    if 'door' not in m.zoneStrokes:
        flags.append({'label': 'Door uncolored — social avoidance', 'severity': 'high'})

    lp = [p for p in m.pauses if p > 4000]
    scores['hesitation'] = min(15, len(lp) * 3)

    scores['overpainting'] = round(min(1.0, m.overpaintPixels / 5000) * 15)

    total_score   = sum(scores.values())
    combined      = round(payload.camera_score * 0.7 + total_score * 0.3)
    combined_lvl  = anxiety_level(combined)

    recs = []
    if combined_lvl == 'HIGH':
        recs = ['Schedule follow-up within 1 week', 'Consider formal anxiety referral', 'Discuss with guardian immediately']
    elif combined_lvl == 'MODERATE':
        recs = ['Monitor over next 2–3 weeks', 'Consider play therapy', 'Encourage open conversation']
    else:
        recs = ['Continue monitoring', 'Encourage drawing at home', 'Child appears emotionally healthy']

    return {
        'drawing'        : {'scores': scores, 'total': total_score, 'level': anxiety_level(total_score), 'flags': flags, 'darkPct': round(dp, 2), 'colorCount': len(m.colorUsage)},
        'camera_score'   : payload.camera_score,
        'combined_score' : combined,
        'combined_level' : combined_lvl,
        'recommendations': recs,
    }
