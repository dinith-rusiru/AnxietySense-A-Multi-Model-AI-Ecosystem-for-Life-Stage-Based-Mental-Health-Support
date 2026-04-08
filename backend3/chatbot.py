from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import joblib
import json
from fastapi.middleware.cors import CORSMiddleware
import warnings
import google.generativeai as genai

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
    classifier = joblib.load(r'D:\projects\New folder (3)\test\backend3\model\chatbot model\emotion_model_chatbot.pkl')
    vectorizer = joblib.load(r'D:\projects\New folder (3)\test\backend3\model\chatbot model\vectorizer.pkl')

    with open(r'D:\projects\New folder (3)\test\backend3\model\chatbot model\emotions_mapping.json', 'r') as f:
        emotions_mapping = json.load(f)

except Exception as e:
    print("Error loading models:", e)
    classifier = None
    vectorizer = None
    emotions_mapping = {0: 'Sadness', 1: 'Joy', 2: 'Love', 3: 'Anger', 4: 'Fear', 5: 'Surprise'}

# Initialize Gemini API
genai.configure(api_key="AIzaSyBZ6uihel7GFKhUHlrn2TRTcAA8UVxGXys")

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


CRISIS_KEYWORDS = [
    "die", "kill myself", "meaningless", "end it all",
    "suicide", "don't want to live", "worthless"
]


def detect_crisis(text: str) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)


def generate_response(emotion: str, user_text: str, is_crisis: bool, facial: str, history: list) -> str:

    if is_crisis:
        return (
            "I'm deeply concerned about what you're sharing. Please know that you are not alone. "
            "Please consider reaching out to a trusted person or a crisis helpline immediately."
        )

    if gemini_model:

        system_prompt = (
            "You are a kind, empathetic AI Mental Health Support Chatbot. "
            f"The detected emotion from text is {emotion}. "
            f"The facial emotion is {facial}. "
            "Give a supportive response in 2-3 short sentences."
        )

        chat_context = ""
        for msg in history[-5:]:
            role = "User" if msg.role == "user" else "Chatbot"
            chat_context += f"{role}: {msg.content}\n"

        prompt = f"{system_prompt}\n\n{chat_context}\nUser: {user_text}\nChatbot:"

        try:
            gemini_response = gemini_model.generate_content(prompt)
            return gemini_response.text.strip()
        except Exception as e:
            print("Gemini API Error:", e)

    # Fallback rule-based responses
    text_lower = user_text.lower()

    if emotion == 'Sadness' or 'sad' in text_lower:
        return "I'm here for you. Feeling sad can be difficult. Do you want to share what is bothering you?"

    elif emotion == 'Anger' or 'angry' in text_lower:
        return "I understand you're feeling frustrated. Taking a few deep breaths can sometimes help."

    elif emotion == 'Fear' or 'anxious' in text_lower:
        return "It sounds like you're feeling anxious. Would you like to try a simple grounding exercise?"

    elif emotion in ['Joy', 'Surprise']:
        return "It's nice to hear some positive emotions. How can I support you today?"

    elif facial and facial.lower() in ['sad', 'angry', 'fear']:
        return f"It seems like you might be feeling {facial}. I'm here to listen."

    return "Tell me more about how you're feeling today."


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):

    if not classifier or not vectorizer:
        raise HTTPException(status_code=500, detail="Model initialization failed.")

    is_crisis = detect_crisis(request.user_message)

    try:
        features = vectorizer.transform([request.user_message])
        prediction = classifier.predict(features)[0]
        detected_emotion = emotions_mapping.get(str(prediction), str(prediction))
    except Exception as e:
        print("Prediction error:", e)
        detected_emotion = "Neutral"

    response_text = generate_response(
        detected_emotion,
        request.user_message,
        is_crisis,
        request.facial_emotion,
        request.history
    )

    return ChatResponse(
        chatbot_response=response_text,
        detected_emotion=detected_emotion,
        is_crisis=is_crisis
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}