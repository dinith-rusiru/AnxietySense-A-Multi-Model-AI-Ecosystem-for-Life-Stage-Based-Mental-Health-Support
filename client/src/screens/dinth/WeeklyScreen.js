import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getWeeklyData, getSessions, getActivities } from '../../storage/storage';

function MiniBar({ value, maxVal, color, label, height = 120 }) {
  const pct  = maxVal > 0 ? (value / maxVal) : 0;
  const barH = Math.max(4, pct * height);
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 4 }}>
      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
        {value != null ? value : '—'}
      </Text>
      <View style={{ width: '100%', height, justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ width: '60%', height: barH, backgroundColor: value != null ? color : '#2a2a4e', borderRadius: 4 }} />
      </View>
      <Text style={{ color: '#666', fontSize: 10 }}>{label}</Text>
    </View>
  );
}

export default function WeeklyScreen({ navigation }) {
  const [weekData,   setWeekData]   = useState([]);
  const [sessions,   setSessions]   = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([getWeeklyData(), getSessions(), getActivities()])
      .then(([wd, s, a]) => {
        setWeekData(wd); setSessions(s); setActivities(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgAnxiety = sessions.length
    ? Math.round(sessions.slice(0, 7).reduce((s, x) => s + (x.combinedScore || 0), 0) / Math.min(sessions.length, 7))
    : null;

  const avgActivity = activities.length
    ? Math.round(activities.slice(0, 7).reduce((s, a) => s + (a.score || 0), 0) / Math.min(activities.length, 7))
    : null;

  const trend = weekData.length >= 2
    ? weekData.filter(d => d.avgAnxiety != null).slice(-3)
    : [];
  const trendDir = trend.length >= 2
    ? (trend[trend.length-1].avgAnxiety < trend[0].avgAnxiety ? 'improving' : 'rising')
    : 'stable';

  const levelCounts = sessions.reduce((acc, s) => {
    acc[s.combinedLevel] = (acc[s.combinedLevel] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#aaa', fontSize: 16 }}>Loading...</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📊 Weekly Mental Health</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySub}>Complete an assessment to see your weekly report</Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('ChildScreen')}>
            <Text style={styles.startBtnTxt}>Start Assessment →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ── Summary cards ── */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderTopColor: '#3498DB' }]}>
              <Text style={styles.sumIcon}>🧠</Text>
              <Text style={styles.sumNum}>{avgAnxiety ?? '—'}</Text>
              <Text style={styles.sumLabel}>Avg Anxiety</Text>
              <Text style={styles.sumSub}>this week</Text>
            </View>
            <View style={[styles.summaryCard, { borderTopColor: '#2ECC71' }]}>
              <Text style={styles.sumIcon}>🎮</Text>
              <Text style={styles.sumNum}>{avgActivity ?? '—'}</Text>
              <Text style={styles.sumLabel}>Activity Score</Text>
              <Text style={styles.sumSub}>this week</Text>
            </View>
            <View style={[styles.summaryCard, { borderTopColor: '#F39C12' }]}>
              <Text style={styles.sumIcon}>📋</Text>
              <Text style={styles.sumNum}>{sessions.length}</Text>
              <Text style={styles.sumLabel}>Sessions</Text>
              <Text style={styles.sumSub}>total</Text>
            </View>
          </View>

          {/* ── Trend ── */}
          <View style={[styles.trendCard, { borderLeftColor: trendDir === 'improving' ? '#2ECC71' : trendDir === 'rising' ? '#E74C3C' : '#F39C12' }]}>
            <Text style={styles.trendIcon}>
              {trendDir === 'improving' ? '📉' : trendDir === 'rising' ? '📈' : '➡️'}
            </Text>
            <View>
              <Text style={styles.trendTitle}>
                Anxiety is {trendDir === 'improving' ? 'improving 🎉' : trendDir === 'rising' ? 'rising ⚠️' : 'stable'}
              </Text>
              <Text style={styles.trendSub}>Based on last 3 assessments</Text>
            </View>
          </View>

          {/* ── Anxiety chart ── */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📉 Daily Anxiety Scores</Text>
            <View style={styles.barsRow}>
              {weekData.map((d, i) => (
                <MiniBar key={i} value={d.avgAnxiety} maxVal={100} color='#3498DB' label={d.label} height={100} />
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.dot, { backgroundColor: '#3498DB' }]} />
              <Text style={styles.legendTxt}>Anxiety score (0–100)</Text>
            </View>
          </View>

          {/* ── Activity chart ── */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>🎮 Daily Activity Scores</Text>
            <View style={styles.barsRow}>
              {weekData.map((d, i) => (
                <MiniBar key={i} value={d.activityScore} maxVal={100} color='#2ECC71' label={d.label} height={100} />
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.dot, { backgroundColor: '#2ECC71' }]} />
              <Text style={styles.legendTxt}>Activity score (0–100)</Text>
            </View>
          </View>

          {/* ── Level breakdown ── */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 Anxiety Level Breakdown</Text>
            {[
              { key: 'HIGH',     label: 'High',     color: '#E74C3C', emoji: '🔴' },
              { key: 'MODERATE', label: 'Moderate', color: '#F39C12', emoji: '🟡' },
              { key: 'CALM',     label: 'Calm',     color: '#2ECC71', emoji: '🟢' },
            ].map(lvl => {
              const count = levelCounts[lvl.key] || 0;
              const pct   = sessions.length ? Math.round((count / sessions.length) * 100) : 0;
              return (
                <View key={lvl.key} style={styles.levelRow}>
                  <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
                  <Text style={styles.levelLabel}>{lvl.label}</Text>
                  <View style={styles.levelBarBg}>
                    <View style={[styles.levelBarFill, { width: `${pct}%`, backgroundColor: lvl.color }]} />
                  </View>
                  <Text style={[styles.levelCount, { color: lvl.color }]}>{count}</Text>
                </View>
              );
            })}
          </View>

          {/* ── Recent sessions ── */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📋 Recent Sessions</Text>
            {sessions.slice(0, 5).map((s, i) => {
              const LEVEL_COLOR = { HIGH: '#E74C3C', MODERATE: '#F39C12', CALM: '#2ECC71' };
              const lc = LEVEL_COLOR[s.combinedLevel] || '#aaa';
              return (
                <View key={i} style={styles.sessionRow}>
                  <View style={[styles.sessionDot, { backgroundColor: lc }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionDate}>{new Date(s.date).toLocaleDateString()} · {s.faceEmotion} face · {s.drawEmotion} drawing</Text>
                  </View>
                  <View style={[styles.sessionBadge, { backgroundColor: lc + '33', borderColor: lc }]}>
                    <Text style={[styles.sessionBadgeTxt, { color: lc }]}>{s.combinedScore}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container   : { padding: 16, paddingBottom: 40 },
  backBtn     : { padding: 6, marginBottom: 4 },
  backText    : { color: '#3498DB', fontSize: 14, fontWeight: 'bold' },
  title       : { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 16 },
  emptyCard   : { alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle  : { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptySub    : { color: '#aaa', fontSize: 13, textAlign: 'center' },
  startBtn    : { backgroundColor: '#3498DB', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 8 },
  startBtnTxt : { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  summaryRow  : { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard : { flex: 1, backgroundColor: '#16213e', borderRadius: 12, padding: 12, borderTopWidth: 3, alignItems: 'center' },
  sumIcon     : { fontSize: 22 },
  sumNum      : { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 4 },
  sumLabel    : { color: '#ddd', fontSize: 11, fontWeight: '700', marginTop: 2 },
  sumSub      : { color: '#666', fontSize: 10 },

  trendCard   : { backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4 },
  trendIcon   : { fontSize: 28 },
  trendTitle  : { color: '#fff', fontSize: 15, fontWeight: '800' },
  trendSub    : { color: '#aaa', fontSize: 11, marginTop: 2 },

  chartCard   : { backgroundColor: '#16213e', borderRadius: 14, padding: 16, marginBottom: 14 },
  chartTitle  : { color: '#aaa', fontSize: 11, letterSpacing: 1, marginBottom: 14 },
  barsRow     : { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  chartLegend : { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  dot         : { width: 10, height: 10, borderRadius: 5 },
  legendTxt   : { color: '#666', fontSize: 11 },

  levelRow    : { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  levelEmoji  : { fontSize: 16, width: 20 },
  levelLabel  : { color: '#ddd', fontSize: 12, width: 58 },
  levelBarBg  : { flex: 1, height: 10, backgroundColor: '#0f3460', borderRadius: 5, overflow: 'hidden' },
  levelBarFill: { height: '100%', borderRadius: 5 },
  levelCount  : { fontWeight: '900', fontSize: 14, width: 22, textAlign: 'right' },

  sessionRow  : { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sessionDot  : { width: 10, height: 10, borderRadius: 5 },
  sessionDate : { color: '#aaa', fontSize: 11 },
  sessionBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sessionBadgeTxt:{ fontWeight: '900', fontSize: 12 },
});
