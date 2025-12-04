import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AccessibleButton from '../components/AccessibleButton';
import { Stack, router } from 'expo-router';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: 'en' | 'si' | 'ta') => {
    i18n.changeLanguage(lang);
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete Data",
      t('profile.delete_data_confirm'),
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Data Deletion Initiated") }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Profile', headerLeft: () => <AccessibleButton title="Back" onPress={() => router.back()} /> }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>{t('profile.language')}</Text>
          <View style={styles.langContainer}>
            <AccessibleButton title="English" onPress={() => changeLanguage('en')} style={styles.langButton} textStyle={styles.langButtonText} />
            <AccessibleButton title="සිංහල" onPress={() => changeLanguage('si')} style={styles.langButton} textStyle={styles.langButtonText} />
            <AccessibleButton title="தமிழ்" onPress={() => changeLanguage('ta')} style={styles.langButton} textStyle={styles.langButtonText} />
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>{t('profile.privacy')}</Text>
          <AccessibleButton
            title={t('profile.delete_data_button')}
            onPress={handleDeleteData}
            style={styles.deleteButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 32 },
  settingGroup: { marginBottom: 24 },
  settingLabel: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  langContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  langButton: { flex: 1, marginHorizontal: 4, backgroundColor: '#E5E5EA' },
  langButtonText: { color: '#007AFF', fontWeight: '500' },
  deleteButton: { backgroundColor: '#FF3B30' }, // Destructive action color
});

export default ProfileScreen;
