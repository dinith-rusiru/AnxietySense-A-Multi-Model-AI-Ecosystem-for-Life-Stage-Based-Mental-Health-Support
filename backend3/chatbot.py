

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import joblib
import json
from fastapi.middleware.cors import CORSMiddleware
import warnings

warnings.filterwarnings('ignore')

app = FastAPI(title="Mood-Aware AI Mental Health Support Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved ML model and vectorizer
try:
    classifier = joblib.load(r'C:\Users\LENOVO LOQ\Desktop\test\backend3\model\chatbot model\emotion_model_chatbot.pkl')
    vectorizer = joblib.load(r'C:\Users\LENOVO LOQ\Desktop\test\backend3\model\chatbot model\vectorizer.pkl')
    with open(r'C:\Users\LENOVO LOQ\Desktop\test\backend3\model\chatbot model\emotions_mapping.json', 'r') as f:
        emotions_mapping = json.load(f)
except Exception as e:
    print("Error loading models:", e)
    classifier = None
    vectorizer = None
    emotions_mapping = {0: 'Sadness', 1: 'Joy', 2: 'Love', 3: 'Anger', 4: 'Fear', 5: 'Surprise'}

import google.generativeai as genai

# Initialize Gemini API
genai.configure(api_key="AIzaSyA_yNwBvvkm7gUflDxxMTqoQWo9PsVbNs0")
try:
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print("Failed to initialize Gemini model:", e)
    gemini_model = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_message: str
    history: Optional[List[Message]] = []
    facial_emotion: Optional[str] = None
    dass21_score: Optional[int] = None

class ChatResponse(BaseModel):
    chatbot_response: str
    detected_emotion: str
    is_crisis: bool

CRISIS_KEYWORDS = ["die", "kill myself", "meaningless", "end it all", "suicide", "don't want to live", "worthless"]

def detect_crisis(text: str) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)

def generate_response(emotion: str, user_text: str, is_crisis: bool, facial: str, history: list) -> str:
    if is_crisis:
        return ("I'm deeply concerned about what you're sharing. Please know that you are not alone, "
                "and there is help available right now. Please consider reaching out to a crisis helpline "
                "or emergency services in your area immediately. You can dial 988 in the US/Canada or 112 in Europe.")

    if gemini_model:
        system_prompt = (
            "You are a kind, empathetic, and professional AI Mental Health Support Chatbot. "
            "Your goal is to provide supportive, helpful, and calming responses. "
            "You just detected that the user's text emotion is: " + emotion + ". "
            + (f"You also know their facial emotion prediction is: {facial}. " if facial else "") +
            "If they are stressed or angry, suggest a very brief grounding technique or breathing exercise. "
            "Keep your response concise, conversational, and limited to 2-3 short sentences. Do not prescribe medication."
        )

        chat_context = ""
        for msg in history[-5:]:  # Keep last 5 messages for context
            role = "User" if msg.role == "user" else "Chatbot"
            chat_context += f"{role}: {msg.content}\n"

        prompt = f"{system_prompt}\n\nRecent context:\n{chat_context}\nUser: {user_text}\nChatbot:"

        try:
            gemini_response = gemini_model.generate_content(prompt)
            return gemini_response.text.strip()
        except Exception as e:
            print("Gemini API Error:", e)
            pass

    # Fallback rule-based response generation
    text_lower = user_text.lower()
    if emotion == 'Sadness' or 'lonely' in text_lower or 'sad' in text_lower:
        return "I'm here for you. Feeling sad or lonely can be really tough. Do you want to talk about what's bothering you or try a quick breathing exercise?"
    elif emotion == 'Anger' or 'angry' in text_lower:
        return "I hear your frustration. It's okay to feel angry. When you're ready, taking some deep breaths or trying a grounding technique might help. Would you like to try one?"
    elif emotion == 'Fear' or 'anxious' in text_lower or 'stressed' in text_lower:
        return "I understand you're feeling anxious or stressed. This is completely normal. Would you like to try the 5-4-3-2-1 grounding technique together?"
    elif emotion in ['Joy', 'Surprise']:
        return "It sounds like you're experiencing some positive emotions! I'm glad to hear that. How else can I support your mental wellness today?"
    elif facial and facial.lower() in ['sad', 'angry', 'fear']:
        return f"Even though you might be trying to stay positive, it looks like you're feeling {facial}. I'm here if you want to talk about it."
    else:
        return "I hear you. Tell me more about how you're feeling today. How has your mood been lately?"

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not classifier or not vectorizer:
        raise HTTPException(status_code=500, detail="Model initialization failed.")

    # 1. Crisis Detection
    is_crisis = detect_crisis(request.user_message)

    # 2. Text Emotion Analysis
    try:
        features = vectorizer.transform([request.user_message])
        prediction = classifier.predict(features)[0]
        detected_emotion = emotions_mapping.get(str(prediction), str(prediction))
    except Exception as e:
        print("Prediction error:", e)
        detected_emotion = "Neutral"

    # 3 & 4. Context Engine and Response Generator
    response_text = generate_response(detected_emotion, request.user_message, is_crisis, request.facial_emotion, request.history)

    return ChatResponse(
        chatbot_response=response_text,
        detected_emotion=detected_emotion,
        is_crisis=is_crisis
    )

@app.get("/health")
def health_check():
    return {"status": "ok"}