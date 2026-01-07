from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image
import traceback
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = 'fer2013_model.h5'
SONGS_CSV_PATH = 'songs.csv'
model = None
songs_df = None

# Constants
IMAGE_WIDTH = 48
IMAGE_HEIGHT = 48
CLASS_NAMES = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

def load_model():
    global model
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully!")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
    except Exception as e:
        print(f"Error loading model: {e}")
        traceback.print_exc()
        model = None

def load_songs():
    global songs_df
    try:
        songs_df = pd.read_csv(SONGS_CSV_PATH)
        print(f"Songs database loaded: {len(songs_df)} songs")
        print(f"Columns in CSV: {songs_df.columns.tolist()}")
        print(f"Available moods in database: {songs_df['mood'].unique()}")
        # Convert mood column to lowercase for case-insensitive matching
        songs_df['mood'] = songs_df['mood'].str.lower()
        print(f"Sample data:\n{songs_df.head()}")
    except Exception as e:
        print(f"Warning: Could not load songs database: {e}")
        traceback.print_exc()
        songs_df = None

load_model()
load_songs()

def preprocess_image(image):
    """Preprocess image for model prediction"""
    try:
        print(f"Original image shape: {image.shape}")
        
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            if image.shape[2] == 4:  # RGBA
                image = cv2.cvtColor(image, cv2.COLOR_RGBA2GRAY)
            elif image.shape[2] == 3:  # RGB
                image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        print(f"After grayscale conversion: {image.shape}")
        
        # Resize to model input size
        image = cv2.resize(image, (IMAGE_WIDTH, IMAGE_HEIGHT))
        print(f"After resize: {image.shape}")
        
        # Normalize pixel values
        image = image.astype('float32') / 255.0
        
        # Reshape for model input (batch_size, height, width, channels)
        image = np.reshape(image, (1, IMAGE_WIDTH, IMAGE_HEIGHT, 1))
        print(f"Final shape: {image.shape}")
        
        return image
    except Exception as e:
        print(f"Error in preprocess_image: {e}")
        traceback.print_exc()
        raise

def decode_base64_image(base64_string):
    """Decode base64 image string to numpy array"""
    try:
        # Remove header if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        print(f"Base64 string length: {len(base64_string)}")
        
        # Decode base64
        img_data = base64.b64decode(base64_string)
        print(f"Decoded data length: {len(img_data)}")
        
        # Convert to PIL Image
        img = Image.open(BytesIO(img_data))
        print(f"PIL Image mode: {img.mode}, size: {img.size}")
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(img)
        print(f"Numpy array shape: {img_array.shape}, dtype: {img_array.dtype}")
        
        return img_array
    except Exception as e:
        print(f"Error in decode_base64_image: {e}")
        traceback.print_exc()
        raise

def get_teenage_year_range(current_year, age):
    """Calculate the teenage year range based on current age"""
    # Assuming teenage peak is around 15 years old
    # Calculate how many years ago the person was 15
    teenage_offset = age - 15
    teenage_year = current_year - teenage_offset
    
    # Create a range of ±5 years around their teenage period
    start_year = teenage_year - 5
    end_year = teenage_year + 5
    
    return start_year, end_year

def get_song_recommendations(mood, age, current_year=None, limit=10):
    """Get song recommendations based on mood and age"""
    if songs_df is None:
        print("ERROR: songs_df is None!")
        return [], None, None
    
    if current_year is None:
        current_year = datetime.now().year
    
    try:
        # Calculate teenage year range
        start_year, end_year = get_teenage_year_range(current_year, age)
        print(f"Looking for '{mood}' songs from {start_year} to {end_year}")
        
        # Convert mood to lowercase for matching
        mood_lower = mood.lower()
        print(f"Mood (lowercase): '{mood_lower}'")
        
        # Show available moods in database
        print(f"Available moods: {songs_df['mood'].unique()}")
        
        # Filter songs by mood and year range
        filtered_songs = songs_df[
            (songs_df['mood'] == mood_lower) &
            (songs_df['year'].between(start_year, end_year))
        ]
        
        print(f"Found {len(filtered_songs)} songs matching criteria")
        
        # If no songs found in teenage years, expand search to all years
        if filtered_songs.empty:
            print(f"No songs found in teenage years, expanding search to all years...")
            filtered_songs = songs_df[songs_df['mood'] == mood_lower]
            print(f"Found {len(filtered_songs)} songs with '{mood}' mood (all years)")
            
            # If still empty, try to find any songs
            if filtered_songs.empty:
                print(f"Still no songs found! Checking database structure...")
                print(f"Total songs in database: {len(songs_df)}")
                print(f"Sample of songs_df:\n{songs_df.head()}")
        
        # Shuffle and limit results
        if not filtered_songs.empty:
            filtered_songs = filtered_songs.sample(n=min(limit, len(filtered_songs)))
            print(f"Returning {len(filtered_songs)} songs")
        
        # Convert to list of dictionaries
        recommendations = filtered_songs.to_dict('records')
        
        return recommendations, start_year, end_year
    except Exception as e:
        print(f"Error getting song recommendations: {e}")
        traceback.print_exc()
        return [], None, None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Please check if fer2013_model.h5 exists in the project directory.'}), 500
    
    try:
        data = request.get_json()
        print(f"\n{'='*60}")
        print(f"NEW PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"Received request data keys: {data.keys() if data else 'None'}")
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided in request'}), 400
        
        # Get age from request (optional)
        age = data.get('age', None)
        print(f"Age provided: {age}")
        
        # Decode image
        print("\n[1] Decoding base64 image...")
        image = decode_base64_image(data['image'])
        
        # Preprocess image
        print("\n[2] Preprocessing image...")
        processed_image = preprocess_image(image)
        
        # Make prediction
        print("\n[3] Making prediction...")
        predictions = model.predict(processed_image, verbose=0)
        print(f"Prediction shape: {predictions.shape}")
        print(f"Predictions: {predictions[0]}")
        
        # Get prediction probabilities
        probabilities = predictions[0]
        
        # Get predicted class
        predicted_class_idx = np.argmax(probabilities)
        predicted_emotion = CLASS_NAMES[predicted_class_idx]
        confidence = float(probabilities[predicted_class_idx])
        
        print(f"\n[4] PREDICTED EMOTION: {predicted_emotion.upper()} (confidence: {confidence:.2%})")
        
        # Create response with all emotions and their probabilities
        emotion_scores = {}
        for i, emotion in enumerate(CLASS_NAMES):
            emotion_scores[emotion] = float(probabilities[i])
        
        response = {
            'predicted_emotion': predicted_emotion,
            'confidence': confidence,
            'all_emotions': emotion_scores
        }
        
        # Add song recommendations if age is provided
        if age is not None:
            print(f"\n[5] Getting song recommendations...")
            print(f"    - Emotion: {predicted_emotion}")
            print(f"    - Age: {age}")
            print(f"    - Songs DB loaded: {songs_df is not None}")
            
            if songs_df is not None:
                recommendations, start_year, end_year = get_song_recommendations(
                    predicted_emotion, 
                    age
                )
                response['song_recommendations'] = recommendations
                response['teenage_year_range'] = {
                    'start': start_year,
                    'end': end_year
                }
                print(f"\n[6] SONG RECOMMENDATIONS: {len(recommendations)} songs found")
                if recommendations:
                    print(f"    First song: {recommendations[0]}")
            else:
                print(f"\n[!] ERROR: Songs database not loaded!")
        else:
            print(f"\n[!] No age provided - skipping song recommendations")
        
        print(f"\n{'='*60}")
        print(f"REQUEST COMPLETED SUCCESSFULLY")
        print(f"{'='*60}\n")
        
        return jsonify(response)
    
    except Exception as e:
        error_msg = str(e)
        print(f"\n{'='*60}")
        print(f"ERROR IN PREDICT ENDPOINT")
        print(f"{'='*60}")
        print(f"Error message: {error_msg}")
        traceback.print_exc()
        print(f"{'='*60}\n")
        return jsonify({'error': f'Prediction error: {error_msg}'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    health_data = {
        'status': 'healthy',
        'model_loaded': model is not None,
        'songs_loaded': songs_df is not None,
        'total_songs': len(songs_df) if songs_df is not None else 0,
        'model_path': MODEL_PATH,
        'expected_input_shape': f"({IMAGE_WIDTH}, {IMAGE_HEIGHT}, 1)",
        'class_names': CLASS_NAMES
    }
    
    if songs_df is not None:
        health_data['available_moods'] = songs_df['mood'].unique().tolist()
        health_data['csv_columns'] = songs_df.columns.tolist()
    
    return jsonify(health_data)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("STARTING EMOTION RECOGNITION & MUSIC RECOMMENDATION SERVER")
    print("="*60)
    print(f"Model loaded: {model is not None}")
    print(f"Songs database loaded: {songs_df is not None}")
    if songs_df is not None:
        print(f"Total songs: {len(songs_df)}")
        print(f"CSV columns: {songs_df.columns.tolist()}")
        print(f"Available moods: {songs_df['mood'].unique()}")
    print(f"Expected image size: {IMAGE_WIDTH}x{IMAGE_HEIGHT}")
    print(f"Number of classes: {len(CLASS_NAMES)}")
    print(f"Classes: {CLASS_NAMES}")
    print("="*60)
    print(f"Server running at: http://localhost:5000")
    print(f"Health check at: http://localhost:5000/api/health")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)