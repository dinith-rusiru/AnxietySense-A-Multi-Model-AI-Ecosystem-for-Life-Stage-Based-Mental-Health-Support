import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';

const LEVEL_CONFIG = {
  HIGH    : { color: '#E74C3C', emoji: '🔴', label: 'HIGH ANXIETY'     },
  MODERATE: { color: '#F39C12', emoji: '🟡', label: 'MODERATE ANXIETY' },
  CALM    : { color: '#2ECC71', emoji: '🟢', label: 'CALM'             },
};

const DRAW_EMOTION_EMOJI  = { Angry: '😠', Fear: '😨', Happy: '😊', Sad: '😢' };
const DRAW_EMOTION_COLORS = { Angry: '#E74C3C', Fear: '#9B59B6', Happy: '#F39C12', Sad: '#3498DB' };

export default function DrawingResultScreen({ navigation, route }) {
  const {
    cameraResult,
    cameraImageUri,
    drawingImageUri,
    drawingModelResult,
    drawingMetrics,
  } = route.params;

  const drawScore = drawingModelResult?.anxiety_score ?? 0;
  const drawLevel = drawingModelResult?.anxiety_level ?? 'CALM';
  const lvlCfg    = LEVEL_CONFIG[drawLevel] || LEVEL_CONFIG.CALM;
  const pct       = Math.min(Math.round(drawScore), 100);

  // Animate progress bar
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, []);
  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  const allEmotions = drawingModelResult?.all_emotions ?? {};

  const goToFinal = () => {
    navigation.navigate('FinalResultScreen', {
      cameraResult,
      cameraImageUri,
      drawingImageUri,
      drawingModelResult,
      drawingMetrics,
    });
  };

  return (
    <ScrollView style={{ backgroundColor: '#1a1a2e' }} contentContainerStyle={styles.container}>

      {/* Header */}
      <Text style={styles.title}>🎨 Drawing Result</Text>
      <Text style={styles.subtitle}>Step 3 of 3 — Analysis complete</Text>

      {/* Drawing image */}
      {drawingImageUri && (
        <View style={styles.imageWrap}>
          <Image source={{ uri: drawingImageUri }} style={styles.drawImage} resizeMode="contain" />
        </View>
      )}

      {/* Score badge */}
      <View style={[styles.badge, { backgroundColor: lvlCfg.color }]}>
        <Text style={styles.badgeEmoji}>{lvlCfg.emoji}</Text>
        <Text style={styles.badgeSublabel}>DRAWING ANXIETY LEVEL</Text>
        <Text style={styles.badgeLevel}>{lvlCfg.label}</Text>
        <Text style={styles.badgeScore}>
          {drawScore}<Text style={styles.badgeScoreOf}> / 100</Text>
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>
        <Text style={styles.badgePct}>{pct}% anxiety indicated</Text>
      </View>

      {/* Detected emotion */}
      <View style={styles.emotionRow}>
        <Text style={styles.emotionLabel}>Detected Emotion</Text>
        <View style={[styles.emotionBadge, { backgroundColor: DRAW_EMOTION_COLORS[drawingModelResult?.emotion] || '#444' }]}>
          <Text style={styles.emotionText}>
            {DRAW_EMOTION_EMOJI[drawingModelResult?.emotion] || '🎨'} {drawingModelResult?.emotion || '—'}
          </Text>
        </View>
        <Text style={styles.confText}>{drawingModelResult?.confidence ?? 0}% confidence</Text>
      </View>

      {/* Emotion breakdown bars */}
      {Object.keys(allEmotions).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>EMOTION BREAKDOWN</Text>
          {Object.entries(allEmotions).map(([em, val]) => (
            <View key={em} style={styles.barRow}>
              <Text style={styles.barLabel}>{DRAW_EMOTION_EMOJI[em] || ''} {em}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${Math.min(val, 100)}%`, backgroundColor: DRAW_EMOTION_COLORS[em] || '#888' }]} />
              </View>
              <Text style={styles.barPct}>{val}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Drawing stats */}
      {drawingMetrics?.mode === 'draw' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DRAWING BEHAVIOUR</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{drawingMetrics.totalStrokes ?? 0}</Text>
              <Text style={styles.statLbl}>Strokes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{Object.keys(drawingMetrics.colorUsage ?? {}).length}</Text>
              <Text style={styles.statLbl}>Colors Used</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{drawingMetrics.pauses?.length ?? 0}</Text>
              <Text style={styles.statLbl}>Pauses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{Math.round((drawingMetrics.duration ?? 0) / 1000)}s</Text>
              <Text style={styles.statLbl}>Duration</Text>
            </View>
          </View>
        </View>
      )}

      {/* Note */}
      <Text style={styles.note}>
        This is the drawing score only. Tap below to see the full combined assessment with your face scan results.
      </Text>

      {/* CTA */}
      <TouchableOpacity style={styles.btnNext} onPress={goToFinal}>
        <Text style={styles.btnNextText}>📋 View Full Assessment →</Text>
        <Text style={styles.btnNextSub}>Combines face scan + drawing scores</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
        <Text style={styles.btnBackText}>← Redo Drawing</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container    : { alignItems: 'center', padding: 16, paddingBottom: 40 },
  title        : { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  subtitle     : { fontSize: 12, color: '#3498DB', fontWeight: 'bold', marginBottom: 14 },

  imageWrap    : { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#3498DB', marginBottom: 16, backgroundColor: '#fff' },
  drawImage    : { width: '100%', height: '100%' },

  badge        : { width: '100%', borderRadius: 20, padding: 22, alignItems: 'center', marginBottom: 16 },
  badgeEmoji   : { fontSize: 48, marginBottom: 4 },
  badgeSublabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, fontWeight: 'bold' },
  badgeLevel   : { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  badgeScore   : { fontSize: 52, fontWeight: '900', color: '#fff', marginTop: 2, lineHeight: 60 },
  badgeScoreOf : { fontSize: 18, fontWeight: '400', color: 'rgba(255,255,255,0.7)' },
  progressBg   : { width: '100%', height: 12, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 6, marginTop: 12, overflow: 'hidden' },
  progressFill : { height: '100%', backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 6 },
  badgePct     : { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 'bold', marginTop: 6 },

  emotionRow   : { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, backgroundColor: '#16213e', padding: 12, borderRadius: 12, width: '100%' },
  emotionLabel : { color: '#aaa', fontSize: 12, flex: 1 },
  emotionBadge : { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  emotionText  : { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  confText     : { color: '#888', fontSize: 11 },

  card         : { width: '100%', backgroundColor: '#16213e', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitle    : { fontSize: 10, color: '#aaa', marginBottom: 10, letterSpacing: 1.5, fontWeight: 'bold' },
  barRow       : { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  barLabel     : { width: 72, color: '#ddd', fontSize: 11 },
  barBg        : { flex: 1, height: 9, backgroundColor: '#0f3460', borderRadius: 5, overflow: 'hidden', marginHorizontal: 7 },
  barFill      : { height: '100%', borderRadius: 5 },
  barPct       : { width: 36, color: '#aaa', fontSize: 10, textAlign: 'right' },

  statsGrid    : { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem     : { flex: 1, minWidth: '40%', backgroundColor: '#0f3460', borderRadius: 10, padding: 12, alignItems: 'center' },
  statNum      : { fontSize: 24, fontWeight: '900', color: '#3498DB' },
  statLbl      : { fontSize: 11, color: '#aaa', marginTop: 2 },

  note         : { color: '#666', fontSize: 11, textAlign: 'center', marginBottom: 16, lineHeight: 17, paddingHorizontal: 8 },

  btnNext      : { width: '100%', backgroundColor: '#3498DB', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 10 },
  btnNextText  : { color: '#fff', fontSize: 17, fontWeight: '900' },
  btnNextSub   : { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4 },

  btnBack      : { paddingVertical: 10 },
  btnBackText  : { color: '#3498DB', fontSize: 13, fontWeight: 'bold' },
});4