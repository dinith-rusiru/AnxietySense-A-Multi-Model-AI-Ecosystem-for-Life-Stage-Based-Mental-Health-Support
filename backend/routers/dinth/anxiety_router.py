from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
from .model_loader import predict_from_bytes

router = APIRouter()

# ── Drawing models ────────────────────────────────────────────
class DrawingMetrics(BaseModel):
    totalStrokes    : int
    colorUsage      : Dict[str, int]
    zoneStrokes     : Dict[str, int]
    zoneDarkness    : Dict[str, Any]
    crossings       : int
    pauses          : List[float]
    overpaintPixels : int
    duration        : int

class DrawingPayload(BaseModel):
    metrics      : DrawingMetrics
    camera_score : float

# ── Camera predict ────────────────────────────────────────────
@router.get('/health')
def health():
    return {'status': 'ok', 'module': 'dinth-child-anxiety'}

@router.post('/predict')
async def predict_anxiety(file: UploadFile = File(...)):
    print(f'Received: {file.filename} | type: {file.content_type}')
    try:
        image_bytes = await file.read()
        print(f'Size: {len(image_bytes)} bytes')
        if len(image_bytes) < 1000:
            raise HTTPException(400, f'Image too small: {len(image_bytes)} bytes')
        result = predict_from_bytes(image_bytes)
        return {'success': True, 'data': result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f'Prediction failed: {str(e)}')

# ── Drawing analysis ──────────────────────────────────────────
DARK_COLORS = {'#795548', '#607d8b', '#212121'}

ZONES_META = {
    'sky'         : 'Mood & environment',
    'roof'        : 'Fantasy & thoughts',
    'chimney'     : 'Family warmth',
    'wall'        : 'Ego & self-esteem',
    'door'        : 'Social openness',
    'window_left' : 'View of past',
    'window_right': 'Hope for future',
    'ground'      : 'Security & stability',
    'tree'        : 'Life energy & growth',
}

def analyze_drawing(metrics: DrawingMetrics) -> dict:
    scores, flags = {}, []

    # 1. Darkness (0-25)
    total  = sum(metrics.colorUsage.values()) or 1
    dark   = sum(v for k,v in metrics.colorUsage.items() if k.lower() in DARK_COLORS)
    dp     = dark / total
    scores['darkness'] = round(dp * 25)
    if dp > 0.5:
        flags.append({'label': f'Heavy dark color use ({round(dp*100)}%)', 'severity': 'high' if dp > 0.7 else 'medium'})

    # 2. Crossings (0-25)
    cr = min(1.0, metrics.crossings / 30)
    scores['crossing'] = round(cr * 25)
    if metrics.crossings > 5:
        flags.append({'label': f'{metrics.crossings} boundary crossings', 'severity': 'high' if metrics.crossings > 15 else 'medium'})

    # 3. Zone avoidance (0-20)
    avoided = len(ZONES_META) - len(metrics.zoneStrokes)
    scores['avoidance'] = round((avoided / len(ZONES_META)) * 20)
    if avoided > 3:
        flags.append({'label': f'{avoided} zones left uncolored', 'severity': 'high' if avoided > 6 else 'medium'})
    if 'door' not in metrics.zoneStrokes:
        flags.append({'label': 'Door uncolored — social avoidance indicator', 'severity': 'high'})

    # 4. Hesitation (0-15)
    lp = [p for p in metrics.pauses if p > 4000]
    scores['hesitation'] = min(15, len(lp) * 3)
    if len(lp) > 2:
        flags.append({'label': f'{len(lp)} long hesitation pauses', 'severity': 'medium'})

    # 5. Overpainting (0-15)
    scores['overpainting'] = round(min(1.0, metrics.overpaintPixels / 5000) * 15)
    if metrics.overpaintPixels > 2000:
        flags.append({'label': 'Excessive overpainting — rumination indicator', 'severity': 'high' if metrics.overpaintPixels > 4000 else 'medium'})

    total_score = sum(scores.values())
    level = 'HIGH' if total_score >= 60 else 'MODERATE' if total_score >= 35 else 'CALM'

    return {
        'scores'     : scores,
        'total'      : total_score,
        'level'      : level,
        'flags'      : flags,
        'darkPct'    : round(dp, 2),
        'colorCount' : len(metrics.colorUsage),
    }

@router.post('/analyze-drawing')
def analyze_drawing_endpoint(payload: DrawingPayload):
    drawing = analyze_drawing(payload.metrics)

    # Camera is primary (70%), drawing adds detail (30%)
    combined_score = round(payload.camera_score * 0.7 + drawing['total'] * 0.3)
    combined_level = 'HIGH' if combined_score >= 60 else 'MODERATE' if combined_score >= 35 else 'CALM'

    recs = []
    if combined_level == 'HIGH':
        recs = [
            'Schedule follow-up session within 1 week',
            'Consider referral for formal anxiety assessment',
            'Discuss findings with guardian immediately',
        ]
    elif combined_level == 'MODERATE':
        recs = [
            'Monitor closely over the next 2–3 weeks',
            'Consider structured play therapy activities',
            'Encourage open conversation with the child',
        ]
    else:
        recs = [
            'Continue periodic monitoring through creative sessions',
            'Encourage expressive drawing at home',
            'Child appears to be in a healthy emotional state',
        ]
    if any('door' in f['label'].lower() for f in drawing['flags']):
        recs.append('Next session: use social scenario themes')

    return {
        'drawing'        : drawing,
        'camera_score'   : payload.camera_score,
        'combined_score' : combined_score,
        'combined_level' : combined_level,
        'recommendations': recs,
    }
# ```

# ---

# ## Complete flow summary
# ```
# HomeScreen
#   └── ChildScreen       (face scan + real-time live detection)
#         └── ResultScreen     (camera score → 📊 → "🎨 Next: Draw →")
#               └── DrawingScreen    (color the house + behavioral tracking)
#                     └── FinalResultScreen  (camera 70% + drawing 30% = combined)
# ```

# Files to create/update:
# ```
# client/App.js                              ← unchanged
# client/src/navigation/AppNavigator.js      ← add DrawingScreen + FinalResultScreen
# client/src/screens/HomeScreen.js           ← unchanged
# client/src/screens/dinth/ChildScreen.js    ← updated
# client/src/screens/dinth/ResultScreen.js   ← updated (adds "Next: Draw" button)
# client/src/screens/dinth/DrawingScreen.js  ← NEW
# client/src/screens/dinth/FinalResultScreen.js ← NEW
# client/src/services/dinth/anxietyService.js   ← add analyzeDrawing()
# backend/routers/dinth/anxiety_router.py    ← add /analyze-drawing endpoint