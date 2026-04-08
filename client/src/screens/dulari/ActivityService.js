/**
 * ActivityService.js
 *
 * All data operations:
 *   - Tries FastAPI backend (port 3001) first
 *   - Falls back to AsyncStorage if backend unreachable
 *
 * Change BACKEND_URL to your machine's LAN IP when testing on a real device.
 * e.g.  'http://192.168.1.100:3001'
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActivitiesForLevel, filterRecentActivities } from './activityMapping';

// ─── CHANGE THIS to your computer's local IP when on a real device ───────────
export const BACKEND_URL = 'http://10.0.2.2:3001'; // Android emulator default
// export const BACKEND_URL = 'http://192.168.1.100:3001'; // real device example
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVITY_HISTORY_KEY     = 'activity_history';
const ANXIETY_LEVEL_KEY        = 'elders_anxiety_level';
const ANXIETY_SCORE_KEY        = 'elders_total_score';
const QUESTIONNAIRE_DATE_KEY   = 'elders_questionnaire_last_filled';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark an activity as complete.
 * Saves to backend AND AsyncStorage (offline-safe).
 */
export async function completeActivity(activityName, anxietyLevel) {
  const completedAt = new Date().toISOString();
  const record = { activity_name: activityName, anxiety_level: anxietyLevel, completed_at: completedAt };

  // Always save locally first
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('[ActivityService] Local save failed:', e.message);
  }

  // Try backend (non-blocking — failure is silent)
  try {
    await fetchJSON('/activities/complete', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  } catch (e) {
    console.warn('[ActivityService] Backend save failed (offline?):', e.message);
  }

  return record;
}

/**
 * Get activity history.
 * Tries backend first, falls back to AsyncStorage.
 */
export async function getActivityHistory() {
  try {
    const data = await fetchJSON('/activities/history');
    // Sync latest backend data into local cache
    await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('[ActivityService] Backend history fetch failed, using local:', e.message);
    try {
      const raw = await AsyncStorage.getItem(ACTIVITY_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Save questionnaire result to backend + cache anxiety level locally.
 */
export async function saveQuestionnaireResult({ answers, total_score, manual_result, ml_prediction }) {
  // Cache locally for navigation decisions
  try {
    await AsyncStorage.setItem(QUESTIONNAIRE_DATE_KEY, new Date().toISOString());
    await AsyncStorage.setItem(ANXIETY_LEVEL_KEY, ml_prediction || 'Minimal');
    await AsyncStorage.setItem(ANXIETY_SCORE_KEY, String(total_score));
  } catch (e) {
    console.warn('[ActivityService] Local cache save failed:', e.message);
  }

  // Send to backend
  try {
    await fetchJSON('/save-result', {
      method: 'POST',
      body: JSON.stringify({ answers, total_score, manual_result, ml_prediction }),
    });
  } catch (e) {
    console.warn('[ActivityService] Backend result save failed (offline?):', e.message);
  }
}

/**
 * Check if there is a recent activity (within last 7 days).
 * Returns { hasRecent, anxietyLevel, totalScore } from local cache.
 */
export async function checkRecentActivity() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const now = new Date();
    const hasRecent = history.some((r) => {
      const diff = (now - new Date(r.completed_at)) / (1000 * 60 * 60 * 24);
      return diff < 7;
    });
    const anxietyLevel = (await AsyncStorage.getItem(ANXIETY_LEVEL_KEY)) || 'Minimal';
    const totalScore   = parseInt((await AsyncStorage.getItem(ANXIETY_SCORE_KEY)) || '0', 10);
    return { hasRecent, anxietyLevel, totalScore };
  } catch (e) {
    return { hasRecent: false, anxietyLevel: 'Minimal', totalScore: 0 };
  }
}

/**
 * Get recommended activities for the given anxiety level,
 * with recently completed ones moved to the bottom.
 */
export async function getRecommendedActivities(anxietyLevel) {
  const activities = getActivitiesForLevel(anxietyLevel);
  let history = [];
  try {
    history = await getActivityHistory();
  } catch { /* proceed without history */ }
  return filterRecentActivities(activities, history);
}