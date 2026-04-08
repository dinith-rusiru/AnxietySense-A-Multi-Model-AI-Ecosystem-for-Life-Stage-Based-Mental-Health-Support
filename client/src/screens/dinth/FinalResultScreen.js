import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { saveSession } from '../../storage/storage';

const LEVEL_CONFIG = {
  HIGH    : { color: '#E74C3C', emoji: '🔴', label: 'HIGH ANXIETY'     },
  MODERATE: { color: '#F39C12', emoji: '🟡', label: 'MODERATE ANXIETY' },
  CALM    : { color: '#2ECC71', emoji: '🟢', label: 'CALM'             },
};
const EMOTION_COLORS = {
  Natural: '#2ECC71', anger: '#E74C3C', fear: '#9B59B6', joy: '#F39C12', sadness: '#3498DB',
  Angry  : '#E74C3C', Fear : '#9B59B6', Happy: '#F39C12', Sad  : '#3498DB',
};
const DRAW_EMOTION_EMOJI = { Angry: '😠', Fear: '😨', Happy: '😊', Sad: '😢' };

export default function FinalResultScreen({ navigation, route }) {
  const { cameraResult, drawingModelResult, cameraImageUri, drawingImageUri, drawingMetrics } = route.params;

  // Combined score: face 60% + drawing model 40%
  const faceScore    = cameraResult.anxiety_score || 0;
  const drawScore    = drawingModelResult?.anxiety_score || 0;
  const combinedScore = Math.round(faceScore * 0.6 + drawScore * 0.4);
  const combinedLevel = combinedScore >= 60 ? 'HIGH' : combinedScore >= 35 ? 'MODERATE' : 'CALM';
  const combinedPct   = Math.round((combinedScore / 100) * 100);

  const camLvl  = LEVEL_CONFIG[cameraResult.anxiety_level]      || LEVEL_CONFIG.CALM;
  const drawLvl = LEVEL_CONFIG[drawingModelResult?.anxiety_level] || LEVEL_CONFIG.CALM;
  const combLvl = LEVEL_CONFIG[combinedLevel];

  // Save to storage
  useEffect(() => {
    saveSession({
      faceScore,
      drawScore,
      combinedScore,
      combinedLevel,
      faceEmotion   : cameraResult.emotion,
      drawEmotion   : drawingModelResult?.emotion,
      drawMode      : drawingMetrics?.mode || 'draw',
    });
  }, []);

  const needsActivity = combinedLevel === 'HIGH' || combinedLevel === 'MODERATE';

  const recommendations = combinedLevel === 'HIGH'
    ? ['Schedule follow-up within 1 week', 'Consider referral for formal anxiety assessment', 'Discuss findings with guardian immediately']
    : combinedLevel === 'MODERATE'
    ? ['Monitor closely over next 2–3 weeks', 'Consider structured play therapy', 'Encourage open conversation with the child']
    : ['Continue periodic monitoring', 'Encourage expressive drawing at home', 'Child appears in healthy emotional state'];

  return (
    <ScrollView style={{ backgroundColor: '#1a1a2e' }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 Full Assessment Report</Text>

      {/* ── Combined score badge ── */}
      <View style={[styles.bigBadge, { backgroundColor: combLvl.color }]}>
        <Text style={styles.bigEmoji}>{combLvl.emoji}</Text>
        <Text style={styles.bigSublabel}>COMBINED ANXIETY LEVEL</Text>
        <Text style={styles.bigLevel}>{combLvl.label}</Text>
        <Text style={styles.bigScore}>{combinedScore}<Text style={styles.bigScoreOf}> / 100</Text></Text>
        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${combinedPct}%` }]} />
        </View>
        <Text style={styles.bigPct}>{combinedPct}% anxiety level</Text>
        <Text style={styles.bigNote}>Face (60%) + Drawing (40%)</Text>
      </View>

      {/* ── Side by side scores ── */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreCard, { borderTopColor: camLvl.color }]}>
          <Text style={styles.scTitle}>📷 Face Scan</Text>
          <Text style={[styles.scNum, { color: camLvl.color }]}>{faceScore}</Text>
          <Text style={styles.scLevel}>{camLvl.emoji} {cameraResult.anxiety_level}</Text>
          <Text style={[styles.scEmotion, { color: EMOTION_COLORS[cameraResult.emotion] }]}>
            {cameraResult.emotion.toUpperCase()}
          </Text>
          <Text style={styles.scConf}>{cameraResult.confidence}% conf.</Text>
          <Text style={styles.scWeight}>Weight: 60%</Text>
        </View>

        <View style={styles.plusBox}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.eq}>=</Text>
        </View>

        <View style={[styles.scoreCard, { borderTopColor: drawLvl.color }]}>
          <Text style={styles.scTitle}>🎨 Drawing</Text>
          <Text style={[styles.scNum, { color: drawLvl.color }]}>{drawScore}</Text>
          <Text style={styles.scLevel}>{drawLvl.emoji} {drawingModelResult?.anxiety_level || '—'}</Text>
          <Text style={[styles.scEmotion, { color: EMOTION_COLORS[drawingModelResult?.emotion] || '#aaa' }]}>
            {DRAW_EMOTION_EMOJI[drawingModelResult?.emotion] || ''} {drawingModelResult?.emotion || '—'}
          </Text>
          <Text style={styles.scConf}>{drawingModelResult?.confidence || 0}% conf.</Text>
          <Text style={styles.scWeight}>Weight: 40%</Text>
        </View>
      </View>

      {/* ── Images ── */}
      <View style={styles.imagesRow}>
        {cameraImageUri && (
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>📷 Face</Text>
            <Image source={{ uri: cameraImageUri }} style={styles.image} />
          </View>
        )}
        {drawingImageUri && (
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>🎨 Drawing</Text>
            <Image source={{ uri: drawingImageUri }} style={styles.image} />
          </View>
        )}
      </View>

      {/* ── Drawing emotion breakdown ── */}
      {drawingModelResult?.all_emotions && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎨 DRAWING EMOTION ANALYSIS (AI MODEL)</Text>
          {Object.entries(drawingModelResult.all_emotions).map(([em, pct]) => (
            <View key={em} style={styles.barRow}>
              <Text style={styles.barLabel}>{DRAW_EMOTION_EMOJI[em] || ''} {em}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: EMOTION_COLORS[em] || '#888' }]} />
              </View>
              <Text style={styles.barPct}>{pct}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Face emotion breakdown ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📷 FACE EMOTION BREAKDOWN</Text>
        {Object.entries(cameraResult.all_emotions).map(([em, pct]) => (
          <View key={em} style={styles.barRow}>
            <Text style={styles.barLabel}>{em}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: EMOTION_COLORS[em] || '#888' }]} />
            </View>
            <Text style={styles.barPct}>{pct}%</Text>
          </View>
        ))}
      </View>

      {/* ── Recommendations ── */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: combLvl.color }]}>
        <Text style={styles.cardTitle}>💡 CLINICAL RECOMMENDATIONS</Text>
        {recommendations.map((r, i) => (
          <View key={i} style={styles.recRow}>
            <Text style={[styles.recArrow, { color: combLvl.color }]}>→</Text>
            <Text style={styles.recText}>{r}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        ⚠️ Research tool only. Not a standalone clinical diagnosis.
      </Text>

      {/* ── Buttons ── */}
      <View style={styles.btnCol}>
        {needsActivity && (
          <TouchableOpacity
            style={[styles.btnActivity, { backgroundColor: combLvl.color }]}
            onPress={() => navigation.navigate('ActivityScreen', { level: combinedLevel, combinedScore })}>
            <Text style={styles.btnActivityText}>
              {combinedLevel === 'HIGH' ? '🎮 Try Calming Activities →' : '🎯 Try Fun Activities →'}
            </Text>
            <Text style={styles.btnActivitySub}>Recommended for {combinedLevel.toLowerCase()} anxiety</Text>
          </TouchableOpacity>
        )}
        {!needsActivity && (
          <View style={[styles.calmBanner]}>
            <Text style={styles.calmText}>🌟 Great news! Child appears calm.</Text>
            <Text style={styles.calmSub}>No anxiety activities needed — but you can still explore fun games!</Text>
            <TouchableOpacity style={styles.btnGreen2}
              onPress={() => navigation.navigate('ActivityScreen', { level: 'CALM', combinedScore })}>
              <Text style={styles.btnText}>🎮 Explore Activities</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnBlue} onPress={() => navigation.navigate('WeeklyScreen')}>
            <Text style={styles.btnText}>📊 Weekly Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGray} onPress={() => navigation.navigate('ChildScreen')}>
            <Text style={styles.btnText}>🔄 New Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDark} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container   : { alignItems: 'center', padding: 16, paddingBottom: 40 },
  title       : { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 14 },

  bigBadge    : { width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  bigEmoji    : { fontSize: 52, marginBottom: 4 },
  bigSublabel : { fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, fontWeight: 'bold' },
  bigLevel    : { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  bigScore    : { fontSize: 56, fontWeight: '900', color: '#fff', marginTop: 2, lineHeight: 64 },
  bigScoreOf  : { fontSize: 20, fontWeight: '400', color: 'rgba(255,255,255,0.75)' },
  progressBg  : { width: '100%', height: 14, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 7, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 7 },
  bigPct      : { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 'bold', marginTop: 6 },
  bigNote     : { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },

  scoreRow    : { flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 14, gap: 6 },
  scoreCard   : { flex: 1, backgroundColor: '#16213e', borderRadius: 14, padding: 12, borderTopWidth: 4, alignItems: 'center' },
  plusBox     : { alignItems: 'center', gap: 4 },
  plus        : { color: '#555', fontSize: 20, fontWeight: 'bold' },
  eq          : { color: '#555', fontSize: 20, fontWeight: 'bold' },
  scTitle     : { color: '#aaa', fontSize: 10, marginBottom: 5, letterSpacing: 1 },
  scNum       : { fontSize: 30, fontWeight: '900' },
  scLevel     : { color: '#fff', fontSize: 12, marginTop: 2 },
  scEmotion   : { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  scConf      : { color: '#888', fontSize: 10 },
  scWeight    : { color: '#555', fontSize: 9, marginTop: 4, fontStyle: 'italic' },

  imagesRow   : { flexDirection: 'row', gap: 12, marginBottom: 14, width: '100%' },
  imageBox    : { flex: 1, alignItems: 'center' },
  imageLabel  : { color: '#aaa', fontSize: 11, marginBottom: 5 },
  image       : { width: '100%', height: 110, borderRadius: 12, borderWidth: 2, borderColor: '#3498DB' },

  card        : { width: '100%', backgroundColor: '#16213e', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitle   : { fontSize: 10, color: '#aaa', marginBottom: 10, letterSpacing: 1.2 },
  barRow      : { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  barLabel    : { width: 76, color: '#ddd', fontSize: 11 },
  barBg       : { flex: 1, height: 9, backgroundColor: '#0f3460', borderRadius: 5, overflow: 'hidden', marginHorizontal: 7 },
  barFill     : { height: '100%', borderRadius: 5 },
  barPct      : { width: 36, color: '#aaa', fontSize: 10, textAlign: 'right' },
  recRow      : { flexDirection: 'row', gap: 7, marginBottom: 7, alignItems: 'flex-start' },
  recArrow    : { fontWeight: '900', fontSize: 13 },
  recText     : { flex: 1, color: '#ddd', fontSize: 12, lineHeight: 19 },
  disclaimer  : { color: '#555', fontSize: 10, textAlign: 'center', marginBottom: 16, lineHeight: 15 },

  btnCol      : { width: '100%', gap: 12 },
  btnActivity : { width: '100%', borderRadius: 16, padding: 18, alignItems: 'center' },
  btnActivityText:{ color: '#fff', fontSize: 18, fontWeight: '900' },
  btnActivitySub : { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  calmBanner  : { width: '100%', backgroundColor: '#0d3b1e', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: '#2ECC71' },
  calmText    : { color: '#2ECC71', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  calmSub     : { color: '#aaa', fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  btnGreen2   : { backgroundColor: '#2ECC71', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  btnRow      : { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  btnBlue     : { backgroundColor: '#3498DB', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 11 },
  btnGray     : { backgroundColor: '#555', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 11 },
  btnDark     : { backgroundColor: '#2a2a3e', paddingVertical: 11, paddingHorizontal: 18, borderRadius: 11 },
  btnText     : { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
