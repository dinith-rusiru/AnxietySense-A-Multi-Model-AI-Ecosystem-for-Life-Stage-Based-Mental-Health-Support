from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
import tensorflow as tf
import tf_keras
import h5py
import json
import numpy as np
from PIL import Image, ImageOps
import io
import os
import cv2
from mtcnn import MTCNN

router = APIRouter()

# ══════════════════════════════════════════════════════════════
# MTCNN FACE DETECTOR (blocks non-face images)
# ══════════════════════════════════════════════════════════════
_detector = None

def get_detector():
    global _detector
    if _detector is None:
        print('Loading MTCNN face detector...')
        _detector = MTCNN()
        print('✅ MTCNN loaded')
    return _detector

FACE_CONFIDENCE_THRESHOLD = 0.95

def validate_face(image_bytes: bytes) -> dict:
    nparr   = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return {'valid': False, 'reason': 'Could not decode image'}

    img_rgb  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    detector = get_detector()
    faces    = detector.detect_faces(img_rgb)

    if len(faces) == 0:
        return {'valid': False, 'reason': 'No face detected in image'}

    best = max(faces, key=lambda f: f['confidence'])

    if best['confidence'] < FACE_CONFIDENCE_THRESHOLD:
        return {
            'valid' : False,
            'reason': f"Low face confidence ({round(best['confidence']*100, 1)}%) — not a clear face"
        }

    return {'valid': True, 'face_box': best['box'], 'confidence': best['confidence']}


# ══════════════════════════════════════════════════════════════
# TEACHABLE MACHINE — CHILD / ADULT CLASSIFIER
# Uses tf_keras (legacy Keras 2) because Teachable Machine .h5
# files are incompatible with Keras 3 that ships with TF 2.16+
# ══════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(__file__)

CHILD_ADULT_MODEL_PATH  = os.path.join(BASE_DIR, '..', '..', 'models', 'keras_Model.h5')
CHILD_ADULT_LABELS_PATH = os.path.join(BASE_DIR, '..', '..', 'models', 'labels.txt')
child_adult_model       = None

def patch_h5(path: str):
    """
    Patches the .h5 model config in-place to remove the 'groups' key
    that DepthwiseConv2D in newer Keras does not accept.
    Safe to call multiple times — idempotent.
    """
    with h5py.File(path, 'r+') as f:
        cfg = f.attrs.get('model_config')
        if cfg is None:
            return
        if isinstance(cfg, bytes):
            cfg = cfg.decode('utf-8')
        cfg = cfg.replace('"groups": 1,', '').replace(', "groups": 1', '')
        f.attrs['model_config'] = cfg.encode('utf-8')
    print('✅ Patched keras_Model.h5 for Keras 3 compatibility')

def get_child_adult_model():
    global child_adult_model
    if child_adult_model is None:
        if not os.path.exists(CHILD_ADULT_MODEL_PATH):
            raise FileNotFoundError(
                f'Child/Adult model not found at {CHILD_ADULT_MODEL_PATH}. '
                'Place keras_Model.h5 in the models/ folder.'
            )
        print('Loading Teachable Machine child/adult classifier...')
        patch_h5(CHILD_ADULT_MODEL_PATH)
        # tf_keras is legacy Keras 2 — required for Teachable Machine .h5 files
        child_adult_model = tf_keras.models.load_model(
            CHILD_ADULT_MODEL_PATH, compile=False
        )
        print('✅ Child/Adult classifier loaded')
    return child_adult_model

def is_child_face(image_bytes: bytes) -> dict:
    """
    Runs the Teachable Machine model to classify child vs adult.
    labels.txt must contain:
        0 Child
        1 Adult
    Returns {'valid': True,  'is_child': bool, 'label': str, 'confidence': float}
         or {'valid': False, 'reason': str}
    """
    try:
        class_names = open(CHILD_ADULT_LABELS_PATH, 'r').readlines()

        img  = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img  = ImageOps.fit(img, (224, 224), Image.Resampling.LANCZOS)
        arr  = np.asarray(img, dtype=np.float32)
        norm = (arr / 127.5) - 1
        data = np.expand_dims(norm, axis=0)

        mdl        = get_child_adult_model()
        prediction = mdl.predict(data, verbose=0)
        index      = int(np.argmax(prediction))
        label      = class_names[index][2:].strip().lower()  # strips "0 " / "1 "
        confidence = float(prediction[0][index])

        return {
            'valid'     : True,
            'is_child'  : label == 'child',
            'label'     : label,
            'confidence': round(confidence * 100, 1),
        }
    except FileNotFoundError:
        raise
    except Exception as e:
        return {'valid': False, 'reason': f'Child/Adult classifier error: {str(e)}'}


# ══════════════════════════════════════════════════════════════
# EMOTION MODEL LOADERS
# ══════════════════════════════════════════════════════════════
FACE_MODEL_PATH = os.path.join(BASE_DIR, '..', '..', 'models', 'final_child_anxiety_model_v2.keras')
face_model = None

def get_face_model():
    global face_model
    if face_model is None:
        print('Loading face anxiety model...')
        face_model = tf.keras.models.load_model(FACE_MODEL_PATH)
        print('✅ Face model loaded')
    return face_model

DRAW_MODEL_PATH = os.path.join(BASE_DIR, '..', '..', 'models', 'drawing_emotion_modelfinal.keras')
draw_model = None

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
FACE_IMG_SIZE  = (128, 128)
FACE_CLASSES   = ['Natural', 'anger', 'fear', 'joy', 'sadness']
FACE_ANXIETY_W = {'fear': 1.0, 'sadness': 0.75, 'anger': 0.6, 'Natural': 0.0, 'joy': 0.0}

DRAW_IMG_SIZE  = (224, 224)
DRAW_CLASSES   = ['Angry', 'Fear', 'Happy', 'Sad']
DRAW_ANXIETY_W = {'Angry': 0.75, 'Fear': 1.0, 'Happy': 0.0, 'Sad': 0.65}


# ══════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════
def bytes_to_array(image_bytes: bytes, size: tuple) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize(size)
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

def bytes_to_face_crop_array(image_bytes: bytes, face_box: list, size: tuple) -> np.ndarray:
    """Crop to the detected face region before predicting."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    x, y, w, h = face_box
    pad = 10
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = x + w + pad
    y2 = y + h + pad
    face_img = img.crop((x1, y1, x2, y2)).resize(size)
    arr = np.array(face_img) / 255.0
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
    face_ok       = os.path.exists(FACE_MODEL_PATH)
    draw_ok       = os.path.exists(DRAW_MODEL_PATH)
    classifier_ok = os.path.exists(CHILD_ADULT_MODEL_PATH)
    labels_ok     = os.path.exists(CHILD_ADULT_LABELS_PATH)
    return {
        'status'           : 'ok',
        'module'           : 'dinth-child-anxiety',
        'face_model'       : '✅ found' if face_ok else '❌ missing',
        'drawing_model'    : '✅ found' if draw_ok else '❌ missing',
        'face_detector'    : '✅ MTCNN active',
        'child_classifier' : '✅ keras_Model.h5 found' if classifier_ok else '❌ missing — place keras_Model.h5 in models/',
        'labels_file'      : '✅ labels.txt found' if labels_ok else '❌ missing — place labels.txt in models/',
    }


# ── Face emotion prediction ────────────────────────────────────
@router.post('/predict')
async def predict_anxiety(file: UploadFile = File(...)):
    print(f'Face predict: {file.filename} | {file.content_type}')
    try:
        image_bytes = await file.read()

        if len(image_bytes) < 1000:
            raise HTTPException(400, f'Image too small: {len(image_bytes)} bytes')

        # ── 1. MTCNN — confirm face exists ─────────────────────
        face_check = validate_face(image_bytes)
        if not face_check['valid']:
            return {
                'success': False,
                'error'  : face_check['reason'],
                'data'   : None
            }

        # ── 2. Teachable Machine — child or adult? ─────────────
        child_check = is_child_face(image_bytes)
        if not child_check['valid']:
            return {
                'success': False,
                'error'  : child_check['reason'],
                'data'   : None
            }

        if not child_check['is_child']:
            return {
                'success': False,
                'error'  : 'adult_detected',
                'data'   : None
            }

        # ── 3. Crop face & predict emotion ─────────────────────
        arr   = bytes_to_face_crop_array(image_bytes, face_check['face_box'], FACE_IMG_SIZE)
        mdl   = get_face_model()
        probs = mdl.predict(arr, verbose=0)[0]

        top_idx = int(np.argmax(probs))
        emotion = FACE_CLASSES[top_idx]
        conf    = float(probs[top_idx] * 100)
        anxiety = float(sum(
            probs[i] * FACE_ANXIETY_W.get(FACE_CLASSES[i], 0)
            for i in range(len(probs))
        ) * 100)

        return {
            'success': True,
            'data': {
                'emotion'         : emotion,
                'confidence'      : round(conf, 1),
                'anxiety_score'   : round(anxiety, 1),
                'anxiety_level'   : anxiety_level(anxiety),
                'face_confidence' : round(face_check['confidence'] * 100, 1),
                'classifier_conf' : child_check['confidence'],
                'all_emotions'    : {
                    FACE_CLASSES[i]: round(float(probs[i] * 100), 1)
                    for i in range(len(probs))
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f'Face prediction failed: {str(e)}')


# ── Drawing emotion prediction ─────────────────────────────────
@router.post('/predict-drawing')
async def predict_drawing(file: UploadFile = File(...)):
    print(f'Drawing predict: {file.filename} | {file.content_type}')
    try:
        image_bytes = await file.read()

        if len(image_bytes) < 500:
            raise HTTPException(400, f'Image too small: {len(image_bytes)} bytes')

        arr   = bytes_to_array(image_bytes, DRAW_IMG_SIZE)
        mdl   = get_draw_model()
        probs = mdl.predict(arr, verbose=0)[0]

        top_idx = int(np.argmax(probs))
        emotion = DRAW_CLASSES[top_idx]
        conf    = float(probs[top_idx] * 100)
        anxiety = float(sum(
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


# ── Algorithmic drawing analysis ───────────────────────────────
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
    'sky'         : 'Mood',
    'roof'        : 'Fantasy',
    'wall'        : 'Ego',
    'door'        : 'Social',
    'window_left' : 'Past',
    'window_right': 'Future',
    'ground'      : 'Security',
}

@router.post('/analyze-drawing')
def analyze_drawing_endpoint(payload: DrawingPayload):
    m = payload.metrics
    scores, flags = {}, []

    total = sum(m.colorUsage.values()) or 1
    dark  = sum(v for k, v in m.colorUsage.items() if k.lower() in DARK_COLORS)
    dp    = dark / total
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
    scores['hesitation']   = min(15, len(lp) * 3)
    scores['overpainting'] = round(min(1.0, m.overpaintPixels / 5000) * 15)

    total_score  = sum(scores.values())
    combined     = round(payload.camera_score * 0.7 + total_score * 0.3)
    combined_lvl = anxiety_level(combined)

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