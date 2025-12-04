import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AccessibleButton from '../components/AccessibleButton';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [lastAssessment, setLastAssessment] = useState('Mild');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('home.title')}</Text>

        {/* Progress Tracker Placeholder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('home.progress_tracker')}</Text>
          <Text style={styles.cardBody}>Your last assessment showed '{lastAssessment}' anxiety.</Text>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.buttonContainer}>
          <AccessibleButton
            title={t('home.take_assessment')}
            onPress={() => navigation.navigate('Assessment')}
          />
          <AccessibleButton
            title={t('home.view_history')}
            onPress={() => navigation.navigate('History')}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
          <AccessibleButton
            title={t('home.my_interventions')}
            onPress={() => navigation.navigate('Interventions')}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1C1C1E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 16,
    color: '#636366',
  },
  buttonContainer: {
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: '#E5E5EA',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

export default HomeScreen;
