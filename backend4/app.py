
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from ultralytics import YOLO
import numpy as np
import cv2
import pandas as pd
import os
import datetime
import joblib
import random
from werkzeug.utils import secure_filename
from flask_cors import CORS

from testing import predict_age_from_image

app = Flask(__name__)

# -----------------------------
# LOAD MODELS & DATASETS
# -----------------------------
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"])
EMOTION_MODEL_PATH = "model.h5"
SONGS_CSV_PATH = "songs.csv"
ANXIETY_MODEL_PATH = "anxiety_model.pkl"

emotion_model = load_model(EMOTION_MODEL_PATH)
song_df = pd.read_csv(SONGS_CSV_PATH)
anxiety_model = joblib.load(ANXIETY_MODEL_PATH)

yolo_model = YOLO("best.pt")

print("All models loaded successfully!")


FACE_PROTO = "models/opencv_face_detector.pbtxt"
FACE_MODEL = "models/opencv_face_detector_uint8.pb"

AGE_PROTO = "models/age_deploy.prototxt"
AGE_MODEL = "models/age_net.caffemodel"

MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)

ageList = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']

ageRange = {
    '(0-2)': (0, 1),
    '(4-6)': (4, 6),
    '(8-12)': (8, 12),
    '(15-20)': (15, 20),
    '(25-32)': (25, 32),
    '(38-43)': (38, 43),
    '(48-53)': (48, 53),
    '(60-100)': (60, 72),
}

faceNet = cv2.dnn.readNet(FACE_MODEL, FACE_PROTO)
ageNet = cv2.dnn.readNet(AGE_MODEL, AGE_PROTO)


def detect_face_yolo(image_path):
    try:
        results = yolo_model(image_path, conf=0.3)
        boxes = results[0].boxes

        if boxes is None or len(boxes) == 0:
            return False, []

        face_boxes = []
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            face_boxes.append([int(x1), int(y1), int(x2), int(y2)])

        return True, face_boxes

    except Exception as e:
        print("YOLO error:", e)
        return False, []


def getFaceBox(net, frame, conf_threshold=0.7):
    frameOpencvDnn = frame.copy()
    frameHeight = frame.shape[0]
    frameWidth = frame.shape[1]

    blob = cv2.dnn.blobFromImage(
        frameOpencvDnn,
        1.0,
        (300, 300),
        [104, 117, 123],
        True,
        False
    )

    net.setInput(blob)
    detections = net.forward()

    bboxes = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > conf_threshold:
            x1 = int(detections[0, 0, i, 3] * frameWidth)
            y1 = int(detections[0, 0, i, 4] * frameHeight)
            x2 = int(detections[0, 0, i, 5] * frameWidth)
            y2 = int(detections[0, 0, i, 6] * frameHeight)
            bboxes.append([x1, y1, x2, y2])

    return bboxes

def detect_age_opencv(image_path: str):
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None

        bboxes = getFaceBox(faceNet, img, conf_threshold=0.7)
        if not bboxes:
            return None

        padding = 20
        x1, y1, x2, y2 = bboxes[0]

        face = img[
            max(0, y1 - padding): min(y2 + padding, img.shape[0] - 1),
            max(0, x1 - padding): min(x2 + padding, img.shape[1] - 1),
        ]

        blob = cv2.dnn.blobFromImage(
            face,
            1.0,
            (227, 227),
            MODEL_MEAN_VALUES,
            swapRB=False
        )

        ageNet.setInput(blob)
        agePreds = ageNet.forward()

        age_class = ageList[int(agePreds[0].argmax())]
        age_min, age_max = ageRange[age_class]
        return int(random.randint(age_min, age_max))

    except Exception as e:
        print("OpenCV age detection error:", e)
        return None


class_map = {
    0: "angry",
    1: "disgust",
    2: "fear",
    3: "happy",
    4: "neutral",
    5: "sad",
    6: "surprise",
}

def predict_emotion(face_img):
    img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (48, 48))
    img = img.astype("float32") / 255.0

    img = img.reshape(48, 48, 1)
    img = np.expand_dims(img, axis=0)

    pred = emotion_model.predict(img, verbose=0)
    pred_idx = int(np.argmax(pred))

    return class_map[pred_idx], float(np.max(pred))


def get_teenage_year_range(current_year: int, age: int):
    teenage_offset = age - 25
    teenage_year = current_year - teenage_offset
    return teenage_year - 5, teenage_year + 5

def get_song_recommendations(df: pd.DataFrame, mood: str, start_year: int, end_year: int):
    results = df[
        (df["mood"].astype(str).str.lower() == mood.lower())
        & (df["year"].between(start_year, end_year))
    ]
    return results


anxiety_labels = ["Minimal", "Mild", "Moderate", "Severe"]

def manual_anxiety_score(answers):
    total = sum(answers)
    if total <= 9:
        result = "Minimal"
    elif total <= 14:
        result = "Mild"
    elif total <= 21:
        result = "Moderate"
    else:
        result = "Severe"
    return total, result

def parse_anxiety_answers(data):
    answers = []
    for i in range(1, 11):
        key = f"q{i}"
        if key not in data:
            raise KeyError(f"Missing field: {key}")
        answers.append(int(data[key]))
    return answers


@app.route("/")
def home():
    return "API Running with YOLO Face Detection 🚀"

@app.route("/predict-emotion-songs", methods=["POST"])
def predict_emotion_songs():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    if "age" not in request.form:
        return jsonify({"error": "Missing age"}), 400

    try:
        manual_age = int(request.form["age"])
    except:
        return jsonify({"error": "Invalid age"}), 400

    file = request.files["image"]
    filename = secure_filename(file.filename)
    temp_path = os.path.join("uploads", filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(temp_path)
    temp_crop_path = None

    try:
        # 🔥 STEP 1: YOLO FACE CHECK
        face_found, face_boxes = detect_face_yolo(temp_path)

        if not face_found:
            return jsonify({"error": "No face detected"}), 400

        # 🔥 STEP 2: CROP FACE
        img = cv2.imread(temp_path)
        x1, y1, x2, y2 = face_boxes[0]
        face_crop = img[y1:y2, x1:x2]

        # 🔥 STEP 3: EMOTION
        mood, confidence = predict_emotion(face_crop)

        # 🔥 STEP 4: AGE (send cropped face to AI helper)
        try:
            # write the face crop to a temporary file for Gemini
            crop_filename = f"crop_{filename}"
            temp_crop_path = os.path.join("uploads", crop_filename)
            cv2.imwrite(temp_crop_path, face_crop)
            print(f"app.py: Crop written to {temp_crop_path}")
        except Exception as e:
            print(f"app.py: Failed to write crop: {e}")
            temp_crop_path = None

        crop_or_full = temp_crop_path or temp_path
        print(f"app.py: Calling predict_age_from_image with: {crop_or_full}")
        predicted_age, is_ai_predicted, ai_raw_output = predict_age_from_image(crop_or_full)

        if predicted_age is None:
            predicted_age = detect_age_opencv(temp_path)
            is_ai_predicted = 0
            ai_raw_output = ai_raw_output or None

        # 🔥 STEP 5: SONGS
        current_year = datetime.datetime.now().year
        start_year, end_year = get_teenage_year_range(current_year, manual_age)
        results = get_song_recommendations(song_df, mood, start_year, end_year)

        return jsonify({
            "face_detected": True,
            "boxes": face_boxes,
            "age_used": manual_age,
            "predicted_age": predicted_age,
            "is_ai_predicted": is_ai_predicted,
            "ai_raw_output": ai_raw_output,
            "mood": mood,
            "confidence": confidence,
            "teenage_year_range": f"{start_year}-{end_year}",
            "recommended_songs": results.to_dict(orient="records"),
        })

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if temp_crop_path and os.path.exists(temp_crop_path):
            os.remove(temp_crop_path)

@app.route("/predict-anxiety", methods=["POST"])
def predict_anxiety():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Expected JSON body"}), 400

    try:
        answers = parse_anxiety_answers(data)
        features = np.array([answers])

        ml_prediction = int(anxiety_model.predict(features)[0])
        ml_result = (
            anxiety_labels[ml_prediction]
            if 0 <= ml_prediction < len(anxiety_labels)
            else str(ml_prediction)
        )

        total_score, manual_result = manual_anxiety_score(answers)

        return jsonify({
            "answers": answers,
            "total_score": total_score,
            "manual_result": manual_result,
            "ml_prediction": ml_result,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
