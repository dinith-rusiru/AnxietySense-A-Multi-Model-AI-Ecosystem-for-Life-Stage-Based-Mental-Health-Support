import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getActivityHistory } from './ActivityService';

const LEVEL_COLORS = {
  Minimal:  { bg: '#E8F5E9', text: '#4C9F70' },
  Mild:     { bg: '#FFF3E0', text: '#FB8C00' },
  Moderate: { bg: '#FFEBEE', text: '#EF5350' },
  Severe:   { bg: '#FCE4EC', text: '#B71C1C' },
};

export default function ActivityHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reload every time the screen is focused
  useFocusEffect(
    useCallback(() => { loadHistory(); }, []),
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getActivityHistory();
      setHistory(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load activity history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const renderItem = ({ item }) => {
    const colors = LEVEL_COLORS[item.anxiety_level] || LEVEL_COLORS.Minimal;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.activityName} numberOfLines={1}>{item.activity_name}</Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.levelText, { color: colors.text }]}>{item.anxiety_level}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.dateText}>{formatDate(item.completed_at)}</Text>
          <Text style={styles.timeText}>{formatTime(item.completed_at)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4C9F70" />
        <Text style={styles.loadingText}>Loading history…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity History</Text>

      {history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No activities completed yet.</Text>
          <Text style={styles.emptySubtext}>Complete an activity to see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.activity_name}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => navigation.navigate('Elders', { fromTestButton: true })}
        >
          <Text style={styles.testButtonText}>📝 Take Questionnaire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#EAF4F4' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF4F4' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  title: {
    fontSize: 24, fontWeight: '700', color: '#333',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  levelBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  levelText:    { fontSize: 12, fontWeight: '700' },
  dateText:     { fontSize: 13, color: '#888' },
  timeText:     { fontSize: 13, color: '#888' },
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#aaa', marginTop: 8 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#EAF4F4',
  },
  testButton: {
    backgroundColor: '#007AFF', padding: 15, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  testButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});