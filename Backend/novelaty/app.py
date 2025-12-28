from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import pandas as pd
import os

app = Flask(__name__)

# -----------------------------
# LOAD MODEL & DATASET
# -----------------------------
MODEL_PATH = "model.h5"
CSV_PATH = "songs.csv"

model = load_model(MODEL_PATH)
song_df = pd.read_csv(CSV_PATH)

print("Model loaded & CSV loaded successfully!")

# -----------------------------
# CLASS MAP
# -----------------------------
class_map = {
    0: 'angry',
    1: 'disgust',
    2: 'fear',
    3: 'happy',
    4: 'neutral',
    5: 'sad',
    6: 'surprise'
}


def predict_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (48, 48))
    img = img.astype("float") / 255.0

    img = img.reshape(48, 48, 1)
    img = np.expand_dims(img, axis=0)

    pred = model.predict(img, verbose=0)
    pred_idx = np.argmax(pred)
    pred_label = class_map[pred_idx]
    pred_prob = float(np.max(pred))
    
    return pred_label, pred_prob


def get_teenage_year_range(current_year, age):
    teenage_offset = age - 25
    teenage_year = current_year - teenage_offset
    return teenage_year - 5, teenage_year + 5

def get_song_recommendations(df, mood, start_year, end_year):
    results = df[
        (df["mood"].str.lower() == mood.lower()) &
        (df["year"].between(start_year, end_year))
    ]
    return results

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    age = int(request.form.get("age", 25))
    current_year = int(request.form.get("current_year", 2025))

    temp_path = "temp_img.jpg"
    file.save(temp_path)
    mood, confidence = predict_image(temp_path)

    start_year, end_year = get_teenage_year_range(current_year, age)

    results = get_song_recommendations(song_df, mood, start_year, end_year)

    os.remove(temp_path)

    return jsonify({
        "mood": mood,
        "confidence": confidence,
        "teenage_year_range": f"{start_year}-{end_year}",
        "recommended_songs": results.to_dict(orient="records")
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
