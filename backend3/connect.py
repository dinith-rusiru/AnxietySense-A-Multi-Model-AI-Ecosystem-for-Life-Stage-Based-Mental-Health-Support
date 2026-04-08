# # backend/connect.py

# from fastapi import FastAPI
# from main import app as dass_app
# from face import app as emotion_app

# app = FastAPI(title="AnxietySense Unified Backend")

# # Mount sub-apps
# app.mount("/dass21", dass_app)
# app.mount("/face", emotion_app)

# @app.get("/")
# def root():
#     return {"status": "AnxietySense backend running"}



# backend/connect.py



# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware  # <--- add this
# from main import app as dass_app
# from face import app as emotion_app
# from chatbot import app as chatbot_app  # <--- new

# app = FastAPI(title="AnxietySense Unified Backend")

# # -------- Add CORS middleware here --------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:8081", "http://localhost:3000", "*"],  # frontend origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Mount sub-apps
# app.mount("/dass21", dass_app)
# app.mount("/face", emotion_app)
# app.mount("/chatbot", chatbot_app)  # <--- new

# @app.get("/")
# def root():
#     return {"status": "AnxietySense backend running"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from main import app as dass_app
from face import app as emotion_app
from chatbot import app as chatbot_app  # <-- chatbot mounted

app = FastAPI(title="AnxietySense Unified Backend")

# CORS setup (allow React Native / Expo localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sub-apps
app.mount("/dass21", dass_app)
app.mount("/face", emotion_app)
app.mount("/", chatbot_app)  # <-- keep path same

@app.get("/")
def root():
    return {"status": "AnxietySense backend running"}