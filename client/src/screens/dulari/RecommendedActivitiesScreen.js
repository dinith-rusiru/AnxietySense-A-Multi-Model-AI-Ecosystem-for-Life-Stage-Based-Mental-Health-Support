import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getRecommendedActivities } from './ActivityService';

export default function RecommendedActivitiesScreen({ route, navigation }) {
  const { anxietyLevel, totalScore, predictedSongs } = route.params || {};
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const list = await getRecommendedActivities(anxietyLevel || 'Minimal');
      // Add predicted songs as an activity for all levels
      let songActivity = null;
      if (predictedSongs && predictedSongs.length > 0) {
        songActivity = {
          id: 'predicted_songs',
          name: 'Predicted Songs',
          type: 'songs',
          description: 'Listen to songs recommended for you based on your photo.',
          duration: 'Varies',
          icon: '🎵',
          songs: predictedSongs,
        };
      }
      setActivities(songActivity ? [songActivity, ...list] : list);
    } catch (e) {
      Alert.alert('Error', 'Failed to load activities.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (activity) => {
    navigation.navigate('ActivityPlayer', {
      activity,
      anxietyLevel: anxietyLevel || 'Minimal',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4C9F70" />
        <Text style={styles.loadingText}>Loading activities…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommended Activities</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{anxietyLevel || 'Minimal'}</Text>
          {totalScore !== undefined && (
            <Text style={styles.scoreText}>Score: {totalScore}</Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.card}
            onPress={() => handleStart(activity)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{activity.icon}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{activity.name}</Text>
                <Text style={styles.cardDuration}>{activity.duration}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{activity.description}</Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => handleStart(activity)}
            >
              <Text style={styles.startBtnText}>Start Activity</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('ActivityHistory')}
        >
          <Text style={styles.historyBtnText}>View Activity History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4F4' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF4F4' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#333' },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4C9F70',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scoreText: { fontSize: 14, color: '#666' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { fontSize: 32, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#333' },
  cardDuration: { fontSize: 13, color: '#888', marginTop: 2 },
  cardDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  startBtn: {
    backgroundColor: '#4C9F70',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#EAF4F4',
  },
  historyBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4C9F70',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  historyBtnText: { color: '#4C9F70', fontWeight: '600', fontSize: 15 },
});
