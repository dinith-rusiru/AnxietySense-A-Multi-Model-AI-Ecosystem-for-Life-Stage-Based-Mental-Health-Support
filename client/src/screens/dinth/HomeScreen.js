import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getSessions } from '../../storage/storage';

export default function HomeScreen({ navigation }) {
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    getSessions().then(s => s.length && setLastSession(s[0]));
  }, []);

  const LEVEL_COLOR = { HIGH: '#E74C3C', MODERATE: '#F39C12', CALM: '#2ECC71' };

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.container}>
      <Text style={styles.logo}>🧠</Text>
      <Text style={styles.title}>MindCare Kids</Text>
      <Text style={styles.sub}>Child Anxiety Assessment</Text>

      {lastSession && (
        <View style={[styles.lastCard, { borderColor: LEVEL_COLOR[lastSession.combinedLevel] || '#555' }]}>
          <Text style={styles.lastTitle}>Last Assessment</Text>
          <Text style={[styles.lastLevel, { color: LEVEL_COLOR[lastSession.combinedLevel] }]}>
            {lastSession.combinedLevel}
          </Text>
          <Text style={styles.lastDate}>
            {new Date(lastSession.date).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.btnGrid}>
        <TouchableOpacity style={[styles.card, { borderTopColor: '#3498DB' }]}
          onPress={() => navigation.navigate('ChildScreen')}>
          <Text style={styles.cardIcon}>📷</Text>
          <Text style={styles.cardTitle}>New Assessment</Text>
          <Text style={styles.cardSub}>Face scan + Drawing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderTopColor: '#2ECC71' }]}
          onPress={() => navigation.navigate('ActivityScreen', { level: 'MODERATE' })}>
          <Text style={styles.cardIcon}>🎮</Text>
          <Text style={styles.cardTitle}>Activities</Text>
          <Text style={styles.cardSub}>Games & exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderTopColor: '#9B59B6' }]}
          onPress={() => navigation.navigate('WeeklyScreen')}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardTitle}>Weekly Report</Text>
          <Text style={styles.cardSub}>Progress & trends</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        ⚠️ Research tool only · Not a clinical diagnosis
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg         : { flex: 1, backgroundColor: '#1a1a2e' },
  container  : { alignItems: 'center', padding: 24, paddingBottom: 40 },
  logo       : { fontSize: 72, marginTop: 32 },
  title      : { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 8 },
  sub        : { fontSize: 14, color: '#3498DB', fontWeight: 'bold', marginBottom: 28 },
  lastCard   : { width: '100%', backgroundColor: '#16213e', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 2, alignItems: 'center' },
  lastTitle  : { color: '#aaa', fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  lastLevel  : { fontSize: 22, fontWeight: '900' },
  lastDate   : { color: '#666', fontSize: 12, marginTop: 2 },
  btnGrid    : { width: '100%', gap: 14 },
  card       : { width: '100%', backgroundColor: '#16213e', borderRadius: 16, padding: 20, borderTopWidth: 4, flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardIcon   : { fontSize: 36 },
  cardTitle  : { fontSize: 17, fontWeight: '900', color: '#fff' },
  cardSub    : { fontSize: 12, color: '#aaa', marginTop: 2 },
  disclaimer : { color: '#444', fontSize: 11, marginTop: 32, textAlign: 'center' },
});
