from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="DASS-21 ML API")

# Load trained model
model = joblib.load("model/random_forest_dass21_model.pkl")

# -------------------------------
# Input schema (21 questions)
# -------------------------------
class DASS21Input(BaseModel):
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


# -------------------------------
# Root endpoint (fix 404)
# -------------------------------
@app.get("/")
def home():
    return {"message": "DASS-21 ML API is running"}


# -------------------------------
# Prediction endpoint
# -------------------------------
@app.post("/predict")
def predict(data: DASS21Input):
    features = np.array([[ 
        data.Q1, data.Q2, data.Q3, data.Q4, data.Q5, data.Q6, data.Q7,
        data.Q8, data.Q9, data.Q10, data.Q11, data.Q12, data.Q13,
        data.Q14, data.Q15, data.Q16, data.Q17, data.Q18,
        data.Q19, data.Q20, data.Q21
    ]])

    predicted_score = int(model.predict(features)[0])

    # Level mapping
    if predicted_score <= 20:
        level = "Normal"
    elif predicted_score <= 40:
        level = "Mild"
    elif predicted_score <= 60:
        level = "Moderate"
    elif predicted_score <= 80:
        level = "Severe"
    else:
        level = "Extremely Severe"

    return {
        "Total_Final_Score": predicted_score,
        "Total_Level": level
    }



# from fastapi import FastAPI
# from pydantic import BaseModel
# import joblib
# import numpy as np

# app = FastAPI(title="DASS-21 ML API")

# # Load trained model
# model = joblib.load("model/random_forest_dass21_model.pkl")

# # -------- Request Schema --------
# class DASSInput(BaseModel):
#     Q1: int
#     Q2: int
#     Q3: int
#     Q4: int
#     Q5: int
#     Q6: int
#     Q7: int
#     Q8: int
#     Q9: int
#     Q10: int
#     Q11: int
#     Q12: int
#     Q13: int
#     Q14: int
#     Q15: int
#     Q16: int
#     Q17: int
#     Q18: int
#     Q19: int
#     Q20: int
#     Q21: int

# # -------- Helper --------
# def get_level(score):
#     if score <= 20:
#         return "Normal"
#     elif score <= 40:
#         return "Mild"
#     elif score <= 60:
#         return "Moderate"
#     elif score <= 80:
#         return "Severe"
#     else:
#         return "Extremely Severe"

# # -------- API Route --------
# @app.post("/predict")
# def predict(data: DASSInput):
#     values = np.array([list(data.dict().values())])
#     prediction = model.predict(values)[0]
#     level = get_level(prediction)

#     return {
#         "Total_Final_Score": int(prediction),
#         "Total_Level": level
#     }
