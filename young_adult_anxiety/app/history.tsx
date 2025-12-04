import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import AccessibleButton from '../components/AccessibleButton';

const DUMMY_HISTORY = [
  { id: '1', date: '2023-10-26', score: 12, level: 'Moderate' },
  { id: '2', date: '2023-10-19', score: 8, level: 'Mild' },
  { id: '3', date: '2023-10-12', score: 3, level: 'Minimal' },
  { id: '4', date: '2023-10-05', score: 15, level: 'Severe' },
];

const HistoryScreen = () => {
  const renderItem = ({ item }: { item: typeof DUMMY_HISTORY[0] }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemDate}>{item.date}</Text>
      <Text style={styles.itemLevel}>Anxiety Level: {item.level} (Score: {item.score})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'History' }} />
        <Text style={styles.title}>Assessment History</Text>
        <FlatList
          data={DUMMY_HISTORY}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F5F7' },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 24 },
  listContent: {
    paddingBottom: 24,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
      }
    }),
  },
  itemDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemLevel: {
    fontSize: 16,
    color: '#636366',
  },
});

export default HistoryScreen;
