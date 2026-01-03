import axios from "axios";
import { Platform } from "react-native";

/* ===============================
   BASE URL (AUTO DETECT)
================================ */
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://10.0.2.2:8000";

/* ===============================
   AXIOS INSTANCE
================================ */
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

/* ===============================
   🎤 VOICE ANALYSIS
================================ */
export const analyzeVoice = async (audioUri) => {
  const formData = new FormData();
  const ext = audioUri.split(".").pop().toLowerCase();

  formData.append("file", {
    uri: audioUri,
    name: `voice.${ext}`,
    type: `audio/${ext}`,
  });

  return API.post("/voice/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ===============================
   🧠 FINAL ANXIETY PREDICTION
================================ */
export const finalAnxietyPrediction = (answers, emotion) => {
  return API.post("/anxiety/final", {
    answers,
    emotion,
  });
};

export default API;
