import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

const GAS_HISTORY_KEY = 'elders_gas_history';
const ACTIVITY_HISTORY_KEY = 'activity_history';

function formatSavedAt(isoString) {
  if (!isoString) return 'Unknown time';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString();
}

function buildTrendData(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  return [...history].reverse().map((item, idx) => ({
    idx,
    score: Number(item.total_score),
    savedAt: item.saved_at || null,
  })).filter((x) => Number.isFinite(x.score));
}

function getScoreBand(score) {
  if (!Number.isFinite(score)) {
    return { label: 'No data', color: '#9AA8A2', index: -1 };
  }
  if (score <= 9) {
    return { label: 'Low', color: '#3FAE74', index: 0 };
  }
  if (score <= 19) {
    return { label: 'Medium', color: '#E9A63B', index: 1 };
  }
  return { label: 'High', color: '#D95A4E', index: 2 };
}

function RiskGauge({ score }) {
  const band = getScoreBand(score);
  const maxScore = 30;
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(maxScore, score)) : 0;
  const markerLeft = `${(safeScore / maxScore) * 100}%`;

  return (
    <View style={styles.gaugeWrap}>
      <View style={styles.gaugeBar}>
        <View style={[styles.gaugeSegment, { backgroundColor: '#3FAE74' }]} />
        <View style={[styles.gaugeSegment, { backgroundColor: '#E9A63B' }]} />
        <View style={[styles.gaugeSegment, { backgroundColor: '#D95A4E' }]} />
        {Number.isFinite(score) ? <View style={[styles.gaugeMarker, { left: markerLeft }]} /> : null}
      </View>
      <View style={styles.gaugeLabels}>
        <Text style={styles.gaugeLabel}>Low</Text>
        <Text style={styles.gaugeLabel}>Medium</Text>
        <Text style={styles.gaugeLabel}>High</Text>
      </View>
      <View style={[styles.bandBadge, { backgroundColor: band.color }]}>
        <Text style={styles.bandBadgeText}>{band.label}</Text>
      </View>
    </View>
  );
}

function ProgressChart({ history }) {
  const trendData = buildTrendData(history);

  if (trendData.length < 2) {
    return (
      <View style={styles.emptyChartWrap}>
        <Text style={styles.emptyChartText}>Insufficient data for graph. At least 2 questionnaire results are needed.</Text>
      </View>
    );
  }

  const chartWidth = 320;
  const chartHeight = 190;
  const left = 34;
  const right = 12;
  const top = 16;
  const bottom = 28;
  const innerW = chartWidth - left - right;
  const innerH = chartHeight - top - bottom;

  const maxScore = Math.max(...trendData.map((p) => p.score), 1);
  const minScore = Math.min(...trendData.map((p) => p.score), 0);
  const range = Math.max(maxScore - minScore, 1);

  const xFor = (index) => {
    if (trendData.length === 1) return left;
    return left + (index / (trendData.length - 1)) * innerW;
  };

  const yFor = (score) => top + ((maxScore - score) / range) * innerH;

  const points = trendData.map((p) => `${xFor(p.idx)},${yFor(p.score)}`).join(' ');
  const areaPath = `${points} ${xFor(trendData.length - 1)},${top + innerH} ${xFor(0)},${top + innerH}`;

  const yTicks = [0, 0.5, 1].map((ratio) => {
    const val = Math.round(maxScore - ratio * range);
    return {
      value: val,
      y: yFor(val),
    };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScrollWrap}>
      <Svg width={chartWidth} height={chartHeight}>
        <Rect x={0} y={0} width={chartWidth} height={chartHeight} rx={10} fill="#F7FCFA" />

        {yTicks.map((tick, i) => (
          <React.Fragment key={`tick-${i}`}>
            <Path d={`M${left},${tick.y} L${chartWidth - right},${tick.y}`} stroke="#D7E7E1" strokeWidth={1} />
            <SvgText x={4} y={tick.y + 4} fontSize="10" fill="#4A6B5F">{tick.value}</SvgText>
          </React.Fragment>
        ))}

        <Path d={`M${left},${top} L${left},${top + innerH} L${chartWidth - right},${top + innerH}`} stroke="#8FB3A5" strokeWidth={1.5} fill="none" />
        <Path d={`M${xFor(0)},${top + innerH} L${areaPath} Z`} fill="rgba(76,159,112,0.15)" stroke="none" />
        <Path d={`M${points}`} stroke="#2F8F61" strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />

        {trendData.map((p, i) => (
          <React.Fragment key={`point-${i}`}>
            <Circle cx={xFor(p.idx)} cy={yFor(p.score)} r={4.5} fill="#2F8F61" />
            <Circle cx={xFor(p.idx)} cy={yFor(p.score)} r={2} fill="#FFFFFF" />
            <SvgText x={xFor(p.idx) - 6} y={yFor(p.score) - 9} fontSize="9" fill="#1F3B33">{p.score}</SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </ScrollView>
  );
}

function buildSummary(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      currentScore: null,
      previousScore: null,
      trend: '→',
      trendText: 'No trend yet',
      explanation: 'No saved GAS result on this phone yet.',
      action: 'Take the questionnaire once to start tracking.',
    };
  }

  const current = history[0];
  const previous = history[1] || null;

  if (!previous) {
    return {
      currentScore: current.total_score,
      previousScore: null,
      trend: '→',
      trendText: 'Need one more result',
      explanation: `Current GAS is ${current.total_score}.`,
      action: 'Retake later to generate a trend.',
    };
  }

  const diff = current.total_score - previous.total_score;
  const trend = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

  let explanation = '';
  let action = '';

  if (diff > 0) {
    explanation = `Score increased by ${diff} from your previous result.`;
    action = 'Use a calming activity now and recheck soon.';
  } else if (diff < 0) {
    explanation = `Score improved by ${Math.abs(diff)} from your previous result.`;
    action = 'Keep your routine and continue tracking.';
  } else {
    explanation = `Your score is unchanged from the previous result.`;
    action = 'Continue your plan and check again after a few days.';
  }

  return {
    currentScore: current.total_score,
    previousScore: previous.total_score,
    trend,
    trendText:
      diff > 0 ? `Up by ${diff}` :
      diff < 0 ? `Down by ${Math.abs(diff)}` :
      'No change',
    explanation,
    action,
  };
}

export default function ElderViewScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadHistory = async () => {
        setLoading(true);
        try {
          const [gasRaw, activitiesRaw] = await Promise.all([
            AsyncStorage.getItem(GAS_HISTORY_KEY),
            AsyncStorage.getItem(ACTIVITY_HISTORY_KEY),
          ]);

          const parsed = gasRaw ? JSON.parse(gasRaw) : [];
          const parsedActivities = activitiesRaw ? JSON.parse(activitiesRaw) : [];

          if (active) {
            setHistory(Array.isArray(parsed) ? parsed : []);
            setRecentActivities(Array.isArray(parsedActivities) ? parsedActivities.slice(0, 8) : []);
          }
        } catch (e) {
          if (active) {
            setHistory([]);
            setRecentActivities([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadHistory();
      return () => {
        active = false;
      };
    }, []),
  );

  const summary = buildSummary(history);
  const latestFive = history.slice(0, 5);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Text style={styles.title}>Progressive Dashboard</Text> */}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#4C9F70" />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dashboard Summary</Text>

              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Current</Text>
                  <Text style={styles.metricValue}>{summary.currentScore !== null ? summary.currentScore : '-'}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Previous</Text>
                  <Text style={styles.metricValue}>{summary.previousScore !== null ? summary.previousScore : '-'}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Trend</Text>
                  <Text style={styles.metricValue}>{summary.trend}</Text>
                  <Text style={styles.metricSub}>{summary.trendText}</Text>
                </View>
              </View>

              <RiskGauge score={summary.currentScore} />

              <View style={styles.infoChip}>
                <Text style={styles.infoChipTitle}>What this means</Text>
                <Text style={styles.infoChipText}>{summary.explanation}</Text>
              </View>

              <View style={[styles.infoChip, styles.actionChip]}>
                <Text style={styles.infoChipTitle}>Next step</Text>
                <Text style={styles.infoChipText}>{summary.action}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>GAS Trend Graph</Text>
              <Text style={styles.smallHint}>Based only on your saved history.</Text>
              <ProgressChart history={history} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent History</Text>
              {latestFive.length === 0 ? (
                <Text style={styles.sectionText}>Insufficient data. No saved GAS entries found on this phone.</Text>
              ) : (
                latestFive.map((item, index) => (
                  <View key={`${item.saved_at || 'unknown'}-${index}`} style={styles.historyRow}>
                    <View style={styles.historyDot} />
                    <View style={styles.historyTextWrap}>
                      <Text style={styles.historyMain}>GAS {item.total_score ?? 'N/A'}{item.ml_prediction ? ` • ${item.ml_prediction}` : ''}</Text>
                      <Text style={styles.historySub}>{formatSavedAt(item.saved_at)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recently Did Activities</Text>
              {recentActivities.length === 0 ? (
                <Text style={styles.sectionText}>No activity found yet.</Text>
              ) : (
                recentActivities.map((item, index) => (
                  <View key={`${item.completed_at || 'unknown'}-${item.activity_name || index}`} style={styles.activityRow}>
                    <View style={styles.activityBullet} />
                    <View style={styles.historyTextWrap}>
                      <Text style={styles.historyMain}>{item.activity_name || 'Activity'}</Text>
                      <Text style={styles.historySub}>
                        {item.anxiety_level ? `${item.anxiety_level} • ` : ''}{formatSavedAt(item.completed_at)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      <View style={styles.dockWrap}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Elders')}
        >
          <Text style={styles.buttonText}>Elders Questionnaire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EAF4F4',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#EAF4F4',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f3b33',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#36574b',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  chartScrollWrap: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  emptyChartWrap: {
    marginTop: 10,
    backgroundColor: '#F0F8F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E7E1',
    padding: 12,
  },
  emptyChartText: {
    color: '#355348',
    fontSize: 13,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f3b33',
    marginBottom: 10,
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F4FAF7',
    borderWidth: 1,
    borderColor: '#D7E7E1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#4D6E62',
    marginBottom: 6,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#15352C',
  },
  metricSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#4D6E62',
    fontWeight: '600',
  },
  gaugeWrap: {
    marginTop: 2,
    marginBottom: 10,
  },
  gaugeBar: {
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  gaugeSegment: {
    flex: 1,
  },
  gaugeMarker: {
    position: 'absolute',
    top: -4,
    marginLeft: -5,
    width: 10,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#173B31',
    borderWidth: 2,
    borderColor: '#fff',
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gaugeLabel: {
    fontSize: 12,
    color: '#4D6E62',
    fontWeight: '600',
  },
  bandBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  bandBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoChip: {
    backgroundColor: '#EFF7F3',
    borderWidth: 1,
    borderColor: '#D7E7E1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  actionChip: {
    backgroundColor: '#EAF5FF',
    borderColor: '#CFE4F8',
  },
  infoChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f3b33',
    marginBottom: 4,
  },
  infoChipText: {
    fontSize: 16,
    color: '#355348',
    lineHeight: 22,
    fontWeight: '500',
  },
  smallHint: {
    fontSize: 13,
    color: '#4D6E62',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4C9F70',
    marginTop: 6,
    marginRight: 10,
  },
  activityBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F8F61',
    marginTop: 6,
    marginRight: 10,
  },
  historyTextWrap: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e4efeb',
    paddingBottom: 10,
  },
  historyMain: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3b33',
  },
  historySub: {
    fontSize: 13,
    color: '#56796c',
    marginTop: 2,
  },
  bottomSpacer: {
    height: 8,
  },
  dockWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  button: {
    backgroundColor: '#4C9F70',
    padding: 15,
    marginVertical: 0,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
});
