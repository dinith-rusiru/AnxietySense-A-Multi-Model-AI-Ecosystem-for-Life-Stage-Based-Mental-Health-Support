import io, os
import numpy as np
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from dotenv import load_dotenv
from insightface.app import FaceAnalysis
import cloudinary
import cloudinary.uploader

# -----------------------
# Cloudinary Configuration
# -----------------------



load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME", "your_cloud_name"),
    api_key=os.getenv("CLOUD_API_KEY", "your_api_key"),
    api_secret=os.getenv("CLOUD_API_SECRET", "your_api_secret")
)

# -----------------------
# Setup FastAPI
# -----------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # sometimes browsers resolve here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------
# Load model and identities
# -----------------------
fa = FaceAnalysis(name='buffalo_l')
fa.prepare(ctx_id=0, det_size=(640, 640))

IDENTITIES_PATH = "identities.npz"
THRESH = 0.42

# Check if saved identities exist
if os.path.exists(IDENTITIES_PATH):
    id_data = np.load(IDENTITIES_PATH, allow_pickle=True)
    NAMES = list(id_data["names"])
    EMBS = list(id_data["embs"])
    URLS = list(id_data["urls"]) if "urls" in id_data.files else ["" for _ in NAMES]
else:
    NAMES, EMBS, URLS = [], [], []
    np.savez(IDENTITIES_PATH, names=np.array([]), embs=np.array([]), urls=np.array([]))


# -----------------------
# Helper functions
# -----------------------
def read_image(b):
    return np.array(Image.open(io.BytesIO(b)).convert("RGB"))


def save_embeddings():
    np.savez(
        IDENTITIES_PATH,
        names=np.array(NAMES),
        embs=np.stack(EMBS) if EMBS else np.array([]),
        urls=np.array(URLS)
    )


# -----------------------
# Recognize endpoint
# -----------------------
@app.post("/recognize")
async def recognize(image: UploadFile = File(...)):
    content = await image.read()
    img = read_image(content)
    faces = fa.get(img)
    if not faces:
        return {"found": False, "message": "No face detected"}

    face = faces[0]
    emb = face.embedding / np.linalg.norm(face.embedding)

    if len(EMBS) == 0:
        return {"found": False, "message": "No registered faces yet"}

    sims = np.array(EMBS) @ emb
    idx = int(np.argmax(sims))
    if sims[idx] >= THRESH:
        return {
            "found": True,
            "name": str(NAMES[idx]),
            "confidence": float(sims[idx]),
            "image_url": URLS[idx],
        }
    else:
        return {
            "found": False,
            "name": "Unknown",
            "confidence": float(sims[idx]),
        }


# -----------------------
# Register new person
# -----------------------
@app.post("/register")
async def register_person(name: str = Form(...), image: UploadFile = File(...)):
    # Read image into memory once
    content = await image.read()

    # Upload to Cloudinary from bytes
    try:
        upload_result = cloudinary.uploader.upload(io.BytesIO(content), folder="faceapp_users")
        img_url = upload_result["secure_url"]
    except Exception as e:
        return {"success": False, "message": f"Cloudinary upload failed: {e}"}

    # Process locally for embedding
    try:
        img = read_image(content)
        faces = fa.get(img)
        if not faces:
            return {"success": False, "message": "No face detected"}
        face = faces[0]
        emb = face.embedding / np.linalg.norm(face.embedding)
    except Exception as e:
        return {"success": False, "message": f"Image processing failed: {e}"}

    # Add or update person
    if name in NAMES:
        idx = NAMES.index(name)
        new_emb = (EMBS[idx] + emb) / 2
        new_emb /= np.linalg.norm(new_emb)
        EMBS[idx] = new_emb
        URLS[idx] = img_url
    else:
        NAMES.append(name)
        EMBS.append(emb)
        URLS.append(img_url)

    save_embeddings()
    return {"success": True, "message": f"Registered {name}", "image_url": img_url}

# -----------------------
# Get all registered users
# -----------------------
@app.get("/people")
def list_people():
    return {"people": [{"name": n, "image_url": u} for n, u in zip(NAMES, URLS)]}
