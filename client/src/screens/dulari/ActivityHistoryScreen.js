import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getActivityHistory } from './ActivityService';

export default function ActivityHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

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

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.activityName}>{item.activity_name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{item.anxiety_level}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.dateText}>
          {formatDate(item.completed_at)}
        </Text>
        <Text style={styles.timeText}>
          {formatTime(item.completed_at)}
        </Text>
      </View>
    </View>
  );

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
          <Text style={styles.emptyText}>No activities completed yet.</Text>
          <Text style={styles.emptySubtext}>
            Complete an activity to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.activity_name}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={[styles.testButton, { marginTop: 16 }]}
          onPress={() => navigation.navigate('Elders', { fromTestButton: true })}
        >
          <Text style={styles.testButtonText}>Test Anxiety / Questionnaire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    testButton: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    testButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  container: { flex: 1, backgroundColor: '#EAF4F4' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF4F4' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  levelBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: { fontSize: 12, fontWeight: '600', color: '#4C9F70' },
  dateText: { fontSize: 13, color: '#888' },
  timeText: { fontSize: 13, color: '#888' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#aaa', marginTop: 8 },
});
