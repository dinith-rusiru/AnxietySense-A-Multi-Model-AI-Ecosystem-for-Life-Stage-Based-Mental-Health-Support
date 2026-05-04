import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActivitiesForLevel, filterRecentActivities } from './activityMapping';

const ML_API_URL = 'http://127.0.0.1:5000/predict-anxiety';
const BACKEND_URL = 'http://192.168.1.235:3001';

/**
 * Call ML endpoint to predict anxiety level.
 * @param {object} payload - Questionnaire answers { q1, q2, ..., q10 }
 * @returns {object} { ml_prediction, total_score, manual_result, answers }
 */
export async function predictAnxiety(payload) {
  try {
    const response = await axios.post(ML_API_URL, payload, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.warn('ML prediction error:', error.message);
    throw new Error('Could not reach the prediction server. Please try again.');
  }
}

/**
 * Get mock prediction for testing.
 * @param {string} level - One of: Minimal, Mild, Moderate, Severe
 * @returns {object} mock prediction result
 */
export function getMockPrediction(level) {
  const scores = { Minimal: 4, Mild: 8, Moderate: 14, Severe: 22 };
  return {
    ml_prediction: level,
    total_score: scores[level] || 4,
    manual_result: level,
    answers: [0, 1, 2, 0, 1, 0, 1, 2, 0, 1],
  };
}

/**
 * Mark an activity as complete.
 * @param {string} activityName
 * @param {string} anxietyLevel
 */
export async function completeActivity(activityName, anxietyLevel) {
  const completedAt = new Date().toISOString();
  const record = {
    activity_name: activityName,
    anxiety_level: anxietyLevel,
    completed_at: completedAt,
  };

  // Save locally
  try {
    const existing = await AsyncStorage.getItem('activity_history');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(record);
    await AsyncStorage.setItem('activity_history', JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save locally:', e.message);
  }

  // Save to backend
  try {
    await axios.post(`${BACKEND_URL}/activities/complete`, record, { timeout: 10000 });
  } catch (e) {
    console.warn('Failed to save to backend:', e.message);
  }

  return record;
}

/**
 * Get activity history from backend, falling back to local storage.
 * @returns {Array} history records
 */
export async function getActivityHistory() {
  try {
    const response = await axios.get(`${BACKEND_URL}/activities/history`, { timeout: 10000 });
    return response.data;
  } catch (e) {
    console.warn('Backend history fetch failed, using local:', e.message);
    try {
      const existing = await AsyncStorage.getItem('activity_history');
      return existing ? JSON.parse(existing) : [];
    } catch (localErr) {
      return [];
    }
  }
}

/**
 * Get recommended activities for the given anxiety level, with smart filtering.
 * @param {string} anxietyLevel
 * @returns {Array} recommended activities (recently completed moved to bottom)
 */
export async function getRecommendedActivities(anxietyLevel) {
  const activities = getActivitiesForLevel(anxietyLevel);
  let history = [];
  try {
    history = await getActivityHistory();
  } catch (e) {
    // proceed without history
  }
  return filterRecentActivities(activities, history);
}
