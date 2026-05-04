
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import base64
from tensorflow.keras.models import load_model
from deepface import DeepFace

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

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# ── Age group boundaries ─────────────────────────────────────────────────────
YOUNG_ADULT_MIN = 18
YOUNG_ADULT_MAX = 35
CHILD_SAFE_BUFFER = 4  # ages below (MIN + BUFFER) = below 22 → treated as child


def get_age_group(age: int) -> str:
    """
    Classify age with a safety buffer on the child boundary.
    DeepFace over-estimates children, so we pad the lower threshold.
    """
    if age < YOUNG_ADULT_MIN + CHILD_SAFE_BUFFER:  # below 22 → child
        return "child"
    elif age <= YOUNG_ADULT_MAX:
        return "young_adult"
    else:
        return "older_adult"


def estimate_age(face_bgr: np.ndarray, full_img: np.ndarray = None) -> int | None:
    """
    Use DeepFace to estimate age from a BGR face crop.
    If the first estimate is suspiciously low, re-runs on the full image
    and takes the minimum of both passes to safely catch children.
    Returns an integer age, or None if analysis fails.
    """
    try:
        result = DeepFace.analyze(
            face_bgr,
            actions=["age"],
            enforce_detection=False,  # face already cropped, skip re-detection
            silent=True
        )
        if isinstance(result, list):
            result = result[0]
        estimated = int(result["age"])
        print(f"🔍 First pass age estimate: {estimated}")

        # DeepFace inflates child ages — if estimate is in a suspicious range,
        # re-run on the full image WITH detection enabled for a second opinion
        if estimated < 25 and full_img is not None:
            try:
                result2 = DeepFace.analyze(
                    full_img,
                    actions=["age"],
                    enforce_detection=True,  # let DeepFace find the face itself
                    silent=True
                )
                if isinstance(result2, list):
                    result2 = result2[0]
                second_opinion = int(result2["age"])
                print(f"🔁 Second opinion age: {second_opinion} (first was {estimated})")
                # Take the lower of the two — safer for child rejection
                estimated = min(estimated, second_opinion)
            except Exception as e:
                print(f"⚠️ Second pass failed, using first estimate: {e}")

        return estimated

    except Exception as e:
        print(f"⚠️ DeepFace age estimation failed: {e}")
        return None


@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    print("📥 Received image:", file.filename)

    image_bytes = await file.read()
    print("🧠 Image bytes size:", len(image_bytes))

    np_img = np.frombuffer(image_bytes, np.uint8)
    img_color = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img_color is None:
        print("❌ OpenCV failed to decode image")
        return {
            "emotion": None,
            "confidence": None,
            "no_face": True,
            "wrong_age_group": False,
            "annotated_image": None,
            "message": "Could not decode image."
        }

    img_gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        img_gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    if len(faces) == 0:
        print("❌ No face detected")
        return {
            "emotion": None,
            "confidence": None,
            "no_face": True,
            "wrong_age_group": False,
            "annotated_image": None,
            "message": "No face detected in the image."
        }

    # Use the largest detected face
    x, y, w, h = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]

    # ── Age estimation ───────────────────────────────────────────────────────
    face_bgr = img_color[y:y+h, x:x+w]
    estimated_age = estimate_age(face_bgr, full_img=img_color)

    if estimated_age is None:
        # DeepFace failed — fall back to allowing the prediction rather than blocking
        print("⚠️ Age estimation unavailable, proceeding without age filter")
        age_group = "young_adult"
        estimated_age = "unknown"
    else:
        age_group = get_age_group(estimated_age)
        print(f"🧓 Estimated age: {estimated_age}  →  group: {age_group}")

    # ── Age group rejection ──────────────────────────────────────────────────
    if age_group != "young_adult":
        group_label = "a child" if age_group == "child" else "an older adult"
        message = (
            f"Age group not supported. The detected face appears to be {group_label} "
            f"(estimated age: {estimated_age}). "
            f"This tool is designed for young adults aged {YOUNG_ADULT_MIN}–{YOUNG_ADULT_MAX}."
        )
        print(f"🚫 {message}")

        # Red rejection box
        cv2.rectangle(img_color, (x, y), (x+w, y+h), (0, 0, 220), 2)
        cv2.putText(
            img_color,
            f"Age ~{estimated_age} - Not supported",
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (0, 0, 220),
            2
        )

        _, buffer = cv2.imencode(".jpg", img_color)
        annotated_b64 = base64.b64encode(buffer).decode("utf-8")

        return {
            "emotion": None,
            "confidence": None,
            "no_face": False,
            "wrong_age_group": True,
            "estimated_age": estimated_age,
            "age_group": age_group,
            "annotated_image": annotated_b64,
            "message": message
        }

    # ── Emotion detection (young adults only past this point) ────────────────
    face_gray = img_gray[y:y+h, x:x+w]
    face_resized = cv2.resize(face_gray, (48, 48))
    face_normalized = face_resized / 255.0
    face_input = face_normalized.reshape(1, 48, 48, 1)

    preds = model.predict(face_input)
    idx = int(np.argmax(preds))
    emotion = EMOTIONS[idx]
    confidence = round(float(np.max(preds)) * 100, 2)

    print(f"🎭 Emotion: {emotion}, Confidence: {confidence}%")

    # Blue success box with emotion + age label
    cv2.rectangle(img_color, (x, y), (x+w, y+h), (56, 189, 248), 2)
    cv2.putText(
        img_color,
        f"{emotion} ({confidence}%)",
        (x, y - 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (56, 189, 248),
        2
    )
    cv2.putText(
        img_color,
        f"Age ~{estimated_age}",
        (x, y - 5),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (56, 248, 130),
        2
    )

    _, buffer = cv2.imencode(".jpg", img_color)
    annotated_b64 = base64.b64encode(buffer).decode("utf-8")

    return {
        "emotion": emotion,
        "confidence": confidence,
        "no_face": False,
        "wrong_age_group": False,
        "estimated_age": estimated_age,
        "age_group": age_group,
        "annotated_image": annotated_b64,
        "message": "Success"
    }