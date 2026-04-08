import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SESSIONS  : 'dinth_sessions',
  ACTIVITIES: 'dinth_activities',
};

// ── Save a new assessment session ────────────────────────────
export async function saveSession(session) {
  try {
    const raw      = await AsyncStorage.getItem(KEYS.SESSIONS);
    const sessions = raw ? JSON.parse(raw) : [];
    sessions.unshift({ ...session, id: Date.now(), date: new Date().toISOString() });
    // Keep last 30 sessions
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions.slice(0, 30)));
  } catch (e) {
    console.warn('saveSession error:', e);
  }
}

// ── Get all sessions ──────────────────────────────────────────
export async function getSessions() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Save activity completion ──────────────────────────────────
export async function saveActivity(activity) {
  try {
    const raw        = await AsyncStorage.getItem(KEYS.ACTIVITIES);
    const activities = raw ? JSON.parse(raw) : [];
    activities.unshift({ ...activity, id: Date.now(), date: new Date().toISOString() });
    await AsyncStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 100)));
  } catch (e) {
    console.warn('saveActivity error:', e);
  }
}

// ── Get activities ────────────────────────────────────────────
export async function getActivities() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Get last 7 days of sessions for weekly chart ─────────────
export async function getWeeklyData() {
  try {
    const sessions   = await getSessions();
    const activities = await getActivities();
    const days       = [];

    for (let i = 6; i >= 0; i--) {
      const d     = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);

      const daySessions = sessions.filter(s => s.date?.slice(0, 10) === dateStr);
      const dayActivities = activities.filter(a => a.date?.slice(0, 10) === dateStr);

      const avgAnxiety = daySessions.length
        ? Math.round(daySessions.reduce((s, x) => s + (x.combinedScore || 0), 0) / daySessions.length)
        : null;

      const activityScore = dayActivities.length
        ? Math.round(dayActivities.reduce((s, a) => s + (a.score || 0), 0) / dayActivities.length)
        : null;

      days.push({ label, dateStr, avgAnxiety, activityScore, sessionCount: daySessions.length, activityCount: dayActivities.length });
    }
    return days;
  } catch { return []; }
}

// ── Clear all data ────────────────────────────────────────────
export async function clearAll() {
  await AsyncStorage.multiRemove([KEYS.SESSIONS, KEYS.ACTIVITIES]);
}
