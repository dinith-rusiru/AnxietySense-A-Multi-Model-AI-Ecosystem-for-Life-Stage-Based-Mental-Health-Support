import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const ResultsScreen = () => {
  // This would come from state or props
  const [anxietyLevel, setAnxietyLevel] = useState('Mild'); 

  const getAnxietyColor = (level: string) => {
    switch (level) {
      case 'Minimal':
        return '#34C759'; // Green
      case 'Mild':
        return '#FF9500'; // Orange
      case 'Moderate':
        return '#FF3B30'; // Red
      case 'Severe':
        return '#8E8E93'; // Gray
      default:
        return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Your Results</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Anxiety Level</Text>
          <Text style={[styles.resultValue, { color: getAnxietyColor(anxietyLevel) }]}>{anxietyLevel}</Text>
        </View>
        <Text style={styles.subHeader}>Suggested Activities</Text>
        {/* Map over suggested activities here */}
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Mindful Breathing</Text>
          <Text style={styles.activityDesc}>A 5-minute guided breathing exercise to calm your mind.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: { padding: 24 },
  header: { fontSize: 34, fontWeight: 'bold', marginBottom: 24 },
  subHeader: { fontSize: 22, fontWeight: '600', marginTop: 32, marginBottom: 16 },
  resultCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center' },
  resultLabel: { fontSize: 18, color: '#636366', marginBottom: 8 },
  resultValue: { fontSize: 28, fontWeight: 'bold' },
  activityCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16 },
  activityTitle: { fontSize: 18, fontWeight: '600' },
  activityDesc: { fontSize: 16, color: '#636366', marginTop: 4 },
});

export default ResultsScreen;
