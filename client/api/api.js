// import axios from "axios";
// import { Platform } from "react-native";

// /* ===============================
//    BASE URL (AUTO DETECT)
// ================================ */
// const BASE_URL =
//   Platform.OS === "web"
//     ? "http://localhost:8000"
//     : "http://10.0.2.2:8000";

// /* ===============================
//    AXIOS INSTANCE
// ================================ */
// const API = axios.create({
//   baseURL: BASE_URL,
//   timeout: 60000,
// });

// /* ===============================
//    🎤 VOICE ANALYSIS
// ================================ */
// export const analyzeVoice = async (audioUri) => {
//   const formData = new FormData();
//   const ext = audioUri.split(".").pop().toLowerCase();

//   formData.append("file", {
//     uri: audioUri,
//     name: `voice.${ext}`,
//     type: `audio/${ext}`,
//   });

//   return API.post("/voice/analyze", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// /* ===============================
//    🧠 FINAL ANXIETY PREDICTION
// ================================ */
// export const finalAnxietyPrediction = (answers, emotion) => {
//   return API.post("/anxiety/final", {
//     answers,
//     emotion,
//   });
// };

// export default API;

// import axios from "axios";
// import { Platform } from "react-native";

// const BASE_URL =
//   Platform.OS === "web"
//     ? "http://localhost:8000"
//     : "http://10.0.2.2:8000";

// const API = axios.create({
//   baseURL: BASE_URL,
//   timeout: 60000,
// });

// export const analyzeVoice = async (audioUri) => {
//   const formData = new FormData();
//   const ext = audioUri.split(".").pop().toLowerCase();

//   formData.append("file", {
//     uri: audioUri,
//     name: `voice.${ext}`,
//     type: `audio/${ext}`,
//   });

//   return API.post("/voice/analyze", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

// export const finalAnxietyPrediction = (answers, emotion, voice_score) => {
//   return API.post("/anxiety/final", {
//     answers,
//     emotion,
//     voice_score,
//   });
// };

// export default API;


// export const analyzeVoice = async (audioUri) => {
//   const formData = new FormData();

//   // 🔥 WEB handling (VERY IMPORTANT)
//   if (Platform.OS === "web") {
//     const response = await fetch(audioUri);
//     const blob = await response.blob();

//     formData.append("file", blob, "voice.webm");
//   } else {
//     const ext = audioUri.split(".").pop().toLowerCase();

//     formData.append("file", {
//       uri: audioUri,
//       name: `voice.${ext}`,
//       type: `audio/${ext}`,
//     });
//   }

//   return API.post("/voice/analyze", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

import axios from "axios";
import { Platform } from "react-native";

/* ===============================
   🌐 BASE URL (AUTO DETECT)
=============================== */
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://10.0.2.2:8000";

/* ===============================
   🚀 AXIOS INSTANCE
=============================== */
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

/* ===============================
   🎤 VOICE ANALYSIS (RECORD OR UPLOAD)
=============================== */
export const analyzeVoice = async (audioUri) => {
  try {
    const formData = new FormData();

    // safer extension detection
    const extMatch = audioUri.match(/\.(\w+)(\?|$)/);
    const ext = extMatch ? extMatch[1] : "wav";

    // ⚠️ CRITICAL FIX FOR WEB + MOBILE
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
   🧠 FINAL ANXIETY PREDICTION
=============================== */
export const finalAnxietyPrediction = (
  answers,
  emotion,
  voice_score
) => {
  return API.post("/anxiety/final", {
    answers,
    emotion,
    voice_score,
  });
};

/* ===============================
   📊 OPTIONAL: HEALTH CHECK (useful for debugging)
=============================== */
export const healthCheck = () => {
  return API.get("/health");
};

export default API;