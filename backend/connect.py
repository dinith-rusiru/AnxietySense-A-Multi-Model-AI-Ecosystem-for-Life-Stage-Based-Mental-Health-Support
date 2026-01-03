# backend/connect.py

from fastapi import FastAPI
from main import app as dass_app
from face import app as emotion_app

app = FastAPI(title="AnxietySense Unified Backend")

# Mount sub-apps
app.mount("/dass21", dass_app)
app.mount("/face", emotion_app)

@app.get("/")
def root():
    return {"status": "AnxietySense backend running"}
