#  AnxietySense: A Multi-Model AI Ecosystem for Life-Stage-Based Mental Health Support
**Group ID:** - 25-26J-376

**Project Type:** Final Year Research Project  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)  
**Degree Program:** BSc (Hons) in Information Technology  
**Year:** 2025 – 2026


---

##  Overview

**AnxietySense** is an AI-powered mental health support ecosystem designed to detect, analyze, and manage anxiety across different life stages using a **multi-modal approach**.

The system integrates **validated psychological questionnaires, facial emotion recognition, voice-based emotion analysis, and intelligent intervention strategies** to provide early anxiety detection, accurate risk stratification, and personalized mental health support while maintaining ethical AI and privacy standards.

The platform focuses on **adolescents, young adults, pregnant women, and elderly individuals**, addressing the limitations of traditional anxiety assessment methods that rely solely on self-reported data.

---

##  Key Features

- Multi-modal anxiety detection using questionnaires, facial emotions, and voice analysis  
- Life-stage-specific anxiety analysis models  
- Privacy-preserving on-device processing  
- Anxiety risk classification (Low / Mild / Moderate / High)  
- Personalized interventions and coping strategies  
- Gamified and user-friendly interfaces   

---

##  System Components

AnxietySense consists of **four tightly integrated research components**, each addressing a specific life stage or analytical function.

---

### 1️. Questionnaire-Based Anxiety Assessment Module

This module uses **clinically validated anxiety questionnaires** to establish a psychological baseline for users.

**Key Features**
- SCARED questionnaire for adolescents    
- Adaptive, life-stage-based user interfaces
- Allow facial emotion capture for expression recognition during assessments.
- Predictions classify adolescents into Low, Moderate, or High anxiety risk categories.
- Based on risk classification, the system recommends adaptive interventions 

---

### 2️. Facial Emotion Recognition Module

This component analyzes **real-time facial expressions** during assessments to capture non-verbal emotional indicators related to anxiety.

**Key Features**
- CNN-based facial emotion recognition  
- Detection of emotions such as fear, sadness, stress, and neutrality  
- Emotion confidence scoring  
- On-device processing to ensure privacy
- Emotion-driven adaptive user interface

---

### 3️. Voice-Based Anxiety & Emotion Analysis Module

This module processes voice recordings to identify **anxiety-related vocal patterns**.

**Key Features**
- Feature extraction (MFCC, pitch, energy)  
- Stress and emotion detection from speech  
- Noise-robust preprocessing  
- Analysing the anxiety level using PASS standard questionnaire
- Provide instant emotional feedback
- Combines voice-based emotion results with PASS questionnaire scores
- Produces a final anxiety prediction level with improved accuracy

---

### 4️. Intelligent Risk Analysis & Intervention Module

This component combines outputs from questionnaires, facial emotion analysis to provide a **holistic anxiety evaluation** and targeted interventions.

**Key Features**
- Multi-modal data fusion  
- Four-level anxiety risk stratification  
- Personalized coping strategies  
- Music therapy recommendations  
- Professional referral triggers for high-risk cases  

---



## System Architecture Diagram

<img width="809" height="575" alt="image" src="https://github.com/user-attachments/assets/c935b6cd-7d5a-482c-9b61-cd018a314f28" />



##  How the System Works

1. User selects their life stage  
2. Questionnaire-based assessment is completed  
3. Facial emotion or voice data is captured during assessment    
4. Multi-modal AI engine evaluates anxiety levels  
5. Risk category is assigned  
6. Personalized feedback and interventions are delivered  

---

##  Technology Stack

**Frontend**
- React / React Native  

**Backend**
- Python (Flask / FastAPI)  
- Node.js  

**AI / Machine Learning**
- TensorFlow / TensorFlow Lite  
- Convolutional Neural Networks (CNN)  
- Speech signal processing techniques
- Transfer learning(mobilenet) 

---

### Installation


**Clone the Repository**
```bash
git clone <repository-url>
cd AnxietySense-A-Multi-Model-AI-Ecosystem-for-Life-Stage-Based-Mental-Health-Support
```
**Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**Install Frontend Dependencies**
```bash
cd mobile
npm install
```

### Configuration

**Backend Setup**
###### Create Environment File
Create a .env file in the backend directory:
```bash
MODEL_PATH=backend/voice_api/model/emotion_model.keras
ENCODER_PATH=backend/voice_api/model/label_encoder.pkl
PASS_MODEL_PATH=backend/pass_api/model/pass_model.pkl

CORS_ORIGINS=http://localhost:8000
```

```
**Frontend Setup**
###### Create Environment File
Create a .env file in the frontend directory:
```bash
EXPO_PUBLIC_API_URL=http://localhost:8001/api
```
---

## Running the Application
**Start the Backend Server**
```
cd backend
uvicorn main:app --reload
- Backend runs at: http://localhost:8001
```
---
**Start the Frontend Development Server**
```
cd mobile
npx expo start
- Frontend runs at: http://localhost:8000
```
---


##  Testing & Evaluation

- Questionnaire scoring accuracy  
- Facial emotion recognition accuracy (≥ 85%)  
- Voice emotion classification performance  
- Multi-modal fusion reliability  
- System response time (< 5 seconds)  
- Usability and user engagement testing  

---

## Known Limitations

- Facial emotion recognition depends on lighting and camera quality  
- Voice analysis is sensitive to background noise  
- Questionnaire accuracy depends on user honesty  
- Large-scale clinical validation is required before deployment  

---

##  Future Enhancements

- Federated learning for privacy-preserving model improvement  
- Multi-language expansion  
- Clinical dashboards for mental health professionals  
- Long-term anxiety trend prediction and monitoring  

---

##  Contributors

- **Rusiru K.K.D** – IT22145284  
  *child Anxiety Detection*

- **Karunarathna K.M.N.D** – IT22099686  
  *Young Adult Anxiety Management* 

- **Navodya P.K.C** – IT22217868  
  *Pregnancy-Specific Anxiety Detection*    

- **Nisansala D.V.D** – IT22121110  
  *adult Anxiety Management*  

---


