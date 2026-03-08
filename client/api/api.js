import axios from "axios";
import { Platform } from "react-native";

/* ===============================
   BASE URL (AUTO DETECT)
=============================== */
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://127.0.0.1:8000";

/* ===============================
   AXIOS INSTANCE
=============================== */
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

/* ===============================
   VOICE ANALYSIS
=============================== */
export const analyzeVoice = async (audioUri) => {
  try {
    const formData = new FormData();

    const extMatch = audioUri.match(/\.(\w+)(\?|$)/);
    const ext = extMatch ? extMatch[1] : "wav";

    if (Platform.OS === "web") {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append("file", blob, `voice.${ext}`);
    } else {
      formData.append("file", {
        uri: audioUri,
        name: `voice.${ext}`,
        type: `audio/${ext}`,
      });
    }

    return API.post("/voice/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.log("analyzeVoice error:", error?.response?.data || error.message);
    throw error;
  }
};

/* ===============================
   FINAL ANXIETY PREDICTION
=============================== */
export const finalAnxietyPrediction = (answers, emotion, voice_score) => {
  return API.post("/anxiety/final", {
    answers,
    emotion,
    voice_score,
  });
};

/* ===============================
   HEALTH CHECK
=============================== */
export const healthCheck = () => {
  return API.get("/health");
};

export default API;