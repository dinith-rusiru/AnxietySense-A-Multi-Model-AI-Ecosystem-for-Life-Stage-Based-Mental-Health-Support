import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AccessibleButton from '../components/AccessibleButton';

// Assuming navigation prop is passed from React Navigation
const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [hasConsented, setHasConsented] = useState(false);

  const handleContinue = () => {
    if (hasConsented) {
      // Navigate to the Home Dashboard
      navigation.replace('Home');
    } else {
      // Optionally show an alert
      Alert.alert('Please agree to the data usage policy to continue.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('onboarding.title')}</Text>
        <Text style={styles.bodyText}>{t('onboarding.explanation')}</Text>
        <View style={styles.dataUsageBox}>
          <Text style={styles.dataUsageTitle}>{t('profile.privacy')}</Text>
          <Text style={styles.bodyText}>{t('onboarding.data_usage')}</Text>
        </View>

        <View style={styles.consentContainer}>
          <BouncyCheckbox
            size={25}
            fillColor="#007AFF"
            unFillColor="#FFFFFF"
            text={t('onboarding.consent_label')}
            iconStyle={{ borderColor: '#007AFF' }}
            innerIconStyle={{ borderWidth: 2 }}
            textStyle={{ textDecorationLine: "none", fontSize: 16 }}
            onPress={(isChecked: boolean) => setHasConsented(isChecked)}
            // Accessibility for the checkbox
            accessibilityLabel={t('onboarding.consent_label')}
          />
        </View>
        
        <AccessibleButton
          title={t('onboarding.continue_button')}
          onPress={handleContinue}
          disabled={!hasConsented}
          style={!hasConsented ? styles.disabledButton : {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' }, // Mood-neutral
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 16,
    color: '#3C3C43',
  },
  dataUsageBox: {
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  dataUsageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
});

export default OnboardingScreen;