import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Platform } from 'react-native';

const DUMMY_INTERVENTIONS = [
  { id: '1', title: 'Deep Breathing', description: 'Practice deep, slow breaths for 5 minutes.' },
  { id: '2', title: 'Mindful Observation', description: 'Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.' },
  { id: '3', title: 'Go for a Walk', description: 'A short, 15-minute walk can help clear your head.' },
  { id: '4', title: 'Journal Your Thoughts', description: 'Write down what’s on your mind to process your feelings.' },
];

const InterventionsScreen = () => {
  const renderItem = ({ item }: { item: typeof DUMMY_INTERVENTIONS[0] }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Suggested Interventions</Text>
        <FlatList
          data={DUMMY_INTERVENTIONS}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: { flex: 1, padding: 24 },
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
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    color: '#636366',
  },
});

export default InterventionsScreen;

