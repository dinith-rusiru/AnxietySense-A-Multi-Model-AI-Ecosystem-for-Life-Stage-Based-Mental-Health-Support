import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, SafeAreaView
} from 'react-native';

const COLORS = {
  Natural: '#2ECC71',
  anger  : '#E74C3C',
  fear   : '#9B59B6',
  joy    : '#F39C12',
  sadness: '#3498DB',
};

const LEVEL_CONFIG = {
  HIGH    : { color: '#E74C3C', emoji: '🔴', label: 'HIGH ANXIETY'     },
  MODERATE: { color: '#F39C12', emoji: '🟡', label: 'MODERATE ANXIETY' },
  CALM    : { color: '#2ECC71', emoji: '🟢', label: 'CALM'             },
};

const RECOMMENDATIONS = {
  HIGH    : '⚠️ Child shows signs of high anxiety. Please consult a specialist immediately and provide a calm safe environment.',
  MODERATE: '⚡ Child shows moderate anxiety. Monitor closely, provide reassurance and try calming activities.',
  CALM    : '✅ Child appears calm and comfortable. Keep up the positive environment!',
};

export default function ResultScreen({ navigation, route }) {
  const { result, imageUri } = route.params;
  const levelCfg = LEVEL_CONFIG[result.anxiety_level] || LEVEL_CONFIG.CALM;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>📊 Analysis Result</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}

        <View style={[styles.badge, { backgroundColor: levelCfg.color }]}>
          <Text style={styles.badgeEmoji}>{levelCfg.emoji}</Text>
          <Text style={styles.badgeLabel}>{levelCfg.label}</Text>
          <Text style={styles.badgeScore}>
            Anxiety Score: {result.anxiety_score} / 100
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>DETECTED EMOTION</Text>
          <Text style={[styles.emotion,
            { color: COLORS[result.emotion] || '#fff' }]}>
            {result.emotion.toUpperCase()}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {result.confidence}%
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>EMOTION BREAKDOWN</Text>
          {Object.entries(result.all_emotions).map(([emotion, pct]) => (
            <View key={emotion} style={styles.barRow}>
              <Text style={styles.barLabel}>{emotion}</Text>
              <View style={styles.barBg}>
                <View style={[
                  styles.barFill,
                  {
                    width          : `${Math.min(pct, 100)}%`,
                    backgroundColor: COLORS[emotion] || '#888',
                  }
                ]} />
              </View>
              <Text style={styles.barPct}>{pct}%</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.recCard,
          { borderLeftColor: levelCfg.color }]}>
          <Text style={styles.cardTitle}>RECOMMENDATION</Text>
          <Text style={styles.recText}>
            {RECOMMENDATIONS[result.anxiety_level]}
          </Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.btnBlue}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnText}>📸 Scan Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnGray}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe     : { flex: 1, backgroundColor: '#1a1a2e' },
  container: {
    alignItems  : 'center',
    padding     : 20,
    paddingBottom: 40,
  },
  title: {
    fontSize    : 24,
    fontWeight  : 'bold',
    color       : '#fff',
    marginBottom: 16,
  },
  image: {
    width       : 150,
    height      : 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth : 3,
    borderColor : '#3498DB',
  },
  badge: {
    width        : '100%',
    borderRadius : 16,
    padding      : 20,
    alignItems   : 'center',
    marginBottom : 16,
    elevation    : 4,
  },
  badgeEmoji: { fontSize: 44, marginBottom: 6 },
  badgeLabel: {
    fontSize  : 22,
    fontWeight: 'bold',
    color     : '#fff',
  },
  badgeScore: {
    fontSize : 15,
    color    : 'rgba(255,255,255,0.88)',
    marginTop: 4,
  },
  card: {
    width          : '100%',
    backgroundColor: '#16213e',
    borderRadius   : 14,
    padding        : 16,
    marginBottom   : 14,
  },
  recCard: { borderLeftWidth: 4 },
  cardTitle: {
    fontSize     : 11,
    color        : '#aaa',
    marginBottom : 10,
    letterSpacing: 1.2,
  },
  emotion: {
    fontSize  : 34,
    fontWeight: 'bold',
    textAlign : 'center',
  },
  confidence: {
    color    : '#aaa',
    textAlign: 'center',
    marginTop: 4,
    fontSize : 13,
  },
  barRow: {
    flexDirection: 'row',
    alignItems   : 'center',
    marginBottom : 10,
  },
  barLabel: {
    width  : 68,
    color  : '#fff',
    fontSize: 13,
  },
  barBg: {
    flex           : 1,
    height         : 14,
    backgroundColor: '#0f3460',
    borderRadius   : 7,
    overflow       : 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height      : '100%',
    borderRadius: 7,
  },
  barPct: {
    width    : 38,
    color    : '#aaa',
    fontSize : 12,
    textAlign: 'right',
  },
  recText: {
    color     : '#ddd',
    fontSize  : 14,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap          : 12,
    marginTop    : 8,
  },
  btnBlue: {
    backgroundColor  : '#3498DB',
    paddingVertical  : 13,
    paddingHorizontal: 26,
    borderRadius     : 12,
  },
  btnGray: {
    backgroundColor  : '#444',
    paddingVertical  : 13,
    paddingHorizontal: 26,
    borderRadius     : 12,
  },
  btnText: {
    color     : '#fff',
    fontWeight: 'bold',
    fontSize  : 15,
  },
});