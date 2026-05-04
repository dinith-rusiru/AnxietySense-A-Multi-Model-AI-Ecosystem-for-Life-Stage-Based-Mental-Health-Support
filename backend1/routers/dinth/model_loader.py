import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import cv2
from mtcnn import MTCNN
from ultralytics import YOLO

# ══════════════════════════════════════════════════════════════
# EMOTION MODEL
# ══════════════════════════════════════════════════════════════
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


# ══════════════════════════════════════════════════════════════
# MTCNN DETECTOR
# ══════════════════════════════════════════════════════════════
_detector = None

def get_detector():
    global _detector
    if _detector is None:
        _detector = MTCNN()
    return _detector


# ══════════════════════════════════════════════════════════════
# YOLO CHILD / ADULT CLASSIFIER
# ══════════════════════════════════════════════════════════════
YOLO_MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    'models',
    'child_adult_classifier.pt'
)

# Class indices — alphabetical YOLO sort: adult=0, child=1
YOLO_CLASS_ADULT    = 0
YOLO_CLASS_CHILD    = 1
YOLO_MIN_CONFIDENCE = 0.60

_yolo_model = None

def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        if not os.path.exists(YOLO_MODEL_PATH):
            raise FileNotFoundError(
                f'YOLO child/adult model not found at {YOLO_MODEL_PATH}. '
                'Train it with train_classifier.py first.'
            )
        print('Loading YOLO child/adult classifier...')
        _yolo_model = YOLO(YOLO_MODEL_PATH)
        print('YOLO classifier loaded successfully')
    return _yolo_model


# ══════════════════════════════════════════════════════════════
# CONFIG
# ══════════════════════════════════════════════════════════════
IMG_SIZE              = (128, 128)
CHILDREN_CLASSES      = ['Natural', 'anger', 'fear', 'joy', 'sadness']
ANXIETY_WEIGHTS       = {
    'fear'   : 1.0,
    'sadness': 0.75,
    'anger'  : 0.6,
    'Natural': 0.0,
    'joy'    : 0.0,
}
FACE_CONFIDENCE_THRESHOLD = 0.95


# ══════════════════════════════════════════════════════════════
# CHILD / ADULT CLASSIFICATION  (replaces estimate_age)
# ══════════════════════════════════════════════════════════════
def classify_child_adult(image_bytes: bytes, face_box: list) -> dict:
    """
    Classifies the detected face crop as child or adult using YOLOv8-cls.

    Returns:
        {'valid': True,  'is_child': bool, 'confidence': float}
        {'valid': False, 'reason': str}
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        x, y, w, h = face_box
        pad = 10
        x1, y1 = max(0, x - pad), max(0, y - pad)
        x2, y2 = x + w + pad, y + h + pad
        face_crop = img.crop((x1, y1, x2, y2))

        mdl     = get_yolo_model()
        results = mdl.predict(face_crop, imgsz=64, verbose=False)
        probs   = results[0].probs

        top_cls  = int(probs.top1)
        top_conf = float(probs.top1conf)

        if top_conf < YOLO_MIN_CONFIDENCE:
            return {
                'valid' : False,
                'reason': (
                    f'Low classifier confidence ({round(top_conf * 100, 1)}%) '
                    '— cannot determine age group'
                ),
            }

        return {
            'valid'     : True,
            'is_child'  : top_cls == YOLO_CLASS_CHILD,
            'confidence': round(top_conf * 100, 1),
        }

    except FileNotFoundError:
        raise
    except Exception as e:
        return {'valid': False, 'reason': f'Classifier error: {str(e)}'}


# ══════════════════════════════════════════════════════════════
# PREDICT
# ══════════════════════════════════════════════════════════════
def predict_from_bytes(image_bytes: bytes) -> dict:

    # ── Step 1: Validate face with MTCNN ──────────────────────
    nparr   = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        return {'error': 'Could not decode image', 'valid': False}

    img_rgb  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    detector = get_detector()
    faces    = detector.detect_faces(img_rgb)

    if len(faces) == 0:
        return {'error': 'No face detected — please upload a face image', 'valid': False}

    best_face = max(faces, key=lambda f: f['confidence'])

    if best_face['confidence'] < FACE_CONFIDENCE_THRESHOLD:
        return {
            'error': f"Face confidence too low ({round(best_face['confidence'] * 100, 1)}%) — not a clear face",
            'valid': False,
        }

    # ── Step 2: Child / adult gate (YOLO replaces DeepFace) ───
    age_check = classify_child_adult(image_bytes, best_face['box'])

    if not age_check['valid']:
        return {'error': age_check['reason'], 'valid': False}

    if not age_check['is_child']:
        return {
            'error'          : 'adult_detected',
            'classifier_conf': age_check['confidence'],
            'valid'          : False,
        }

    # ── Step 3: Crop to face region ───────────────────────────
    x, y, w, h = best_face['box']
    pad = 10
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = x + w + pad, y + h + pad

    pil_img  = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    face_img = pil_img.crop((x1, y1, x2, y2)).resize(IMG_SIZE)
    arr      = np.expand_dims(np.array(face_img) / 255.0, axis=0)

    # ── Step 4: Predict emotion ───────────────────────────────
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
        'valid'          : True,
        'emotion'        : top_emotion,
        'confidence'     : round(confidence, 1),
        'anxiety_score'  : round(anxiety, 1),
        'anxiety_level'  : level,
        'classifier_conf': age_check['confidence'],     # YOLO confidence
        'face_confidence': round(best_face['confidence'] * 100, 1),
        'all_emotions'   : {
            CHILDREN_CLASSES[i]: round(float(probs[i] * 100), 1)
            for i in range(len(probs))
        },
    }