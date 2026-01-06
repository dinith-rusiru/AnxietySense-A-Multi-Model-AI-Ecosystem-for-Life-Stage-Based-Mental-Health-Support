from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import pandas as pd
import os
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# -----------------------------
# CONFIGURATION
# -----------------------------
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MODEL_PATH = "model.h5"
CSV_PATH = "songs.csv"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# -----------------------------
# LOAD MODEL & DATASET
# -----------------------------
try:
    model = load_model(MODEL_PATH)
    song_df = pd.read_csv(CSV_PATH)
    print("✓ Model and CSV loaded successfully!")
except Exception as e:
    print(f"Error loading model or CSV: {e}")
    exit(1)

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

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_image(image_path):
    """Predict emotion from image"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")
        
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.resize(img, (48, 48))
        img = img.astype("float") / 255.0
        img = img.reshape(48, 48, 1)
        img = np.expand_dims(img, axis=0)

        pred = model.predict(img, verbose=0)
        pred_idx = np.argmax(pred)
        pred_label = class_map[pred_idx]
        pred_prob = float(np.max(pred))
        
        return pred_label, pred_prob, pred.tolist()[0]
    except Exception as e:
        raise Exception(f"Prediction error: {str(e)}")

def get_teenage_year_range(current_year, age):
    """Calculate teenage year range based on current age"""
    teenage_offset = age - 15  # Center around age 15
    teenage_year = current_year - teenage_offset
    return teenage_year - 5, teenage_year + 5

def get_song_recommendations(df, mood, start_year, end_year, limit=10):
    """Get song recommendations based on mood and year range"""
    results = df[
        (df["mood"].str.lower() == mood.lower()) &
        (df["year"].between(start_year, end_year))
    ]
    
    if len(results) > limit:
        results = results.sample(n=limit)
    
    return results

# -----------------------------
# ROUTES
# -----------------------------
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "service": "Mood Detection & Song Recommendation API",
        "version": "1.0",
        "endpoints": {
            "/predict": "POST - Upload image for mood detection",
            "/health": "GET - Check service health"
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "songs_loaded": len(song_df) > 0,
        "total_songs": len(song_df)
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed: jpg, jpeg, png"}), 400
        
        # Get parameters
        age = int(request.form.get("age", 25))
        current_year = int(request.form.get("current_year", 2025))
        song_limit = int(request.form.get("limit", 10))
        
        # Validate age
        if age < 10 or age > 100:
            return jsonify({"error": "Age must be between 10 and 100"}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        # Predict mood
        mood, confidence, all_predictions = predict_image(temp_path)
        
        # Calculate teenage year range
        start_year, end_year = get_teenage_year_range(current_year, age)
        
        # Get song recommendations
        results = get_song_recommendations(song_df, mood, start_year, end_year, song_limit)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        # Prepare emotion probabilities
        emotion_probs = {
            class_map[i]: round(all_predictions[i] * 100, 2) 
            for i in range(len(all_predictions))
        }
        
        return jsonify({
            "success": True,
            "mood": mood,
            "confidence": round(confidence * 100, 2),
            "all_emotions": emotion_probs,
            "age": age,
            "teenage_year_range": {
                "start": start_year,
                "end": end_year
            },
            "recommended_songs": results.to_dict(orient="records"),
            "total_recommendations": len(results)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/moods', methods=['GET'])
def get_moods():
    """Get all available mood categories"""
    return jsonify({
        "moods": list(class_map.values())
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get dataset statistics"""
    mood_counts = song_df['mood'].value_counts().to_dict()
    year_range = {
        "min": int(song_df['year'].min()),
        "max": int(song_df['year'].max())
    }
    
    return jsonify({
        "total_songs": len(song_df),
        "mood_distribution": mood_counts,
        "year_range": year_range
    })

# -----------------------------
# ERROR HANDLERS
# -----------------------------
@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("🎵 Mood Detection & Song Recommendation API")
    print("=" * 50)
    print(f"Model: {MODEL_PATH}")
    print(f"Songs Database: {CSV_PATH}")
    print(f"Total Songs: {len(song_df)}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)