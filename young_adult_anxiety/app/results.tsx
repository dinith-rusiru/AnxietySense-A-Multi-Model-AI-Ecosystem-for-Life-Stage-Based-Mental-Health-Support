import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

const SUGGESTED_ACTIVITIES = {
  'Minimal anxiety': [
    { title: 'Mindful Walking', description: 'Pay attention to the sensation of walking.' },
    { title: 'Journaling', description: 'Write down your thoughts and feelings.' },
  ],
  'Mild anxiety': [
    { title: 'Mindful Breathing', description: 'A 5-minute guided breathing exercise to calm your mind.' },
    { title: 'Progressive Muscle Relaxation', description: 'Tense and then relax different muscle groups.' },
  ],
  'Moderate anxiety': [
    { title: 'Guided Meditation', description: 'Follow a guided meditation for anxiety.' },
    { title: 'Yoga', description: 'Practice gentle yoga to reduce stress.' },
  ],
  'Severe anxiety': [
    { title: 'Seek Professional Help', description: 'Consider talking to a therapist or counselor.' },
    { title: 'Grounding Techniques', description: 'Focus on your senses to ground yourself in the present moment.' },
  ],
};

const ResultsScreen = () => {
  const { score, level } = useLocalSearchParams<{ score: string; level: string }>();

  const getAnxietyColor = (level: string) => {
    switch (level) {
      case 'Minimal anxiety':
        return '#34C759'; // Green
      case 'Mild anxiety':
        return '#FF9500'; // Orange
      case 'Moderate anxiety':
        return '#FF3B30'; // Red
      case 'Severe anxiety':
        return '#8E8E93'; // Gray
      default:
        return '#8E8E93';
    }
  };

  const activities = SUGGESTED_ACTIVITIES[level] || [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Results' }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Your Results</Text>
        <View style={styles.resultCard}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Total Score</Text>
            <Text style={styles.resultValue}>{score}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Anxiety Level</Text>
            <Text style={[styles.resultValue, { color: getAnxietyColor(level) }]}>{level}</Text>
          </View>
        </View>
        <Text style={styles.subHeader}>Suggested Activities</Text>
        {activities.map((activity, index) => (
          <View key={index} style={styles.activityCard}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDesc}>{activity.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  scrollContainer: { padding: 24 },
  header: { fontSize: 34, fontWeight: 'bold', marginBottom: 24 },
  subHeader: { fontSize: 22, fontWeight: '600', marginTop: 32, marginBottom: 16 },
  resultCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-around' },
  resultItem: {
    alignItems: 'center',
  },
  resultLabel: { fontSize: 18, color: '#636366', marginBottom: 8 },
  resultValue: { fontSize: 28, fontWeight: 'bold' },
  activityCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16 },
  activityTitle: { fontSize: 18, fontWeight: '600' },
  activityDesc: { fontSize: 16, color: '#636366', marginTop: 4 },
});

export default ResultsScreen;
