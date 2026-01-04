# backend/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="DASS-21 ML API")

# Load trained model
model = joblib.load("model/random_forest_dass21_model.pkl")

# -------- Request Schema --------
class DASSInput(BaseModel):
    Q1: int
    Q2: int
    Q3: int
    Q4: int
    Q5: int
    Q6: int
    Q7: int
    Q8: int
    Q9: int
    Q10: int
    Q11: int
    Q12: int
    Q13: int
    Q14: int
    Q15: int
    Q16: int
    Q17: int
    Q18: int
    Q19: int
    Q20: int
    Q21: int

# -------- Helper --------
def get_level(score):
    if score <= 9:
        return "Normal"
    elif score <= 18:
        return "Mild"
    elif score <= 27:
        return "Moderate"
    elif score <= 36:
        return "Severe"
    else:
        return "Extremely Severe"

# -------- API Route --------
@app.post("/predict")
def predict(data: DASSInput):
    values = np.array([list(data.dict().values())])
    prediction = model.predict(values)[0]
    level = get_level(prediction)

    return {
        "Total_Final_Score": int(prediction),
        "Total_Level": level
    }
