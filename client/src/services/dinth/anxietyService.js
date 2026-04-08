import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000'
    : 'http://127.0.0.1:8000';

const API = axios.create({ baseURL: BASE_URL, timeout: 60000 });

// ── Face prediction (multipart) ───────────────────────────────
export const predictAnxiety = async (base64DataUrl) => {
  const res   = await fetch(base64DataUrl);
  const blob  = await res.blob();
  const form  = new FormData();
  form.append('file', blob, 'face.jpg');
  const r = await API.post('/dinth/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
};

// ── Drawing prediction (send canvas image to drawing model) ───
export const predictDrawing = async (base64DataUrl) => {
  const res  = await fetch(base64DataUrl);
  const blob = await res.blob();
  const form = new FormData();
  form.append('file', blob, 'drawing.png');
  const r = await API.post('/dinth/predict-drawing', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
};

// ── Drawing analysis (behavioral metrics) ────────────────────
export const analyzeDrawing = async (metrics, cameraScore) => {
  const r = await API.post('/dinth/analyze-drawing', {
    metrics,
    camera_score: cameraScore,
  });
  return r.data;
};

// ── Health check ──────────────────────────────────────────────
export const healthCheck = () => API.get('/health');

export default API;
