import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function ElderViewScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Elders Section</Text>
        <Text style={styles.subtitle}>Complete the anxiety questionnaire to receive personalised activity recommendations.</Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Elders')}
        >
          <Text style={styles.buttonText}>Start Questionnaire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ActivityHistory')}
        >
          <Text style={[styles.buttonText, styles.outlineText]}>View History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#EAF4F4' },
  container:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:         { fontSize: 28, fontWeight: '800', color: '#333', marginBottom: 12 },
  subtitle:      { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  button: {
    backgroundColor: '#4C9F70',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  outlineButton:  { backgroundColor: '#fff', borderWidth: 2, borderColor: '#4C9F70' },
  buttonText:     { fontSize: 18, color: '#FFF', fontWeight: '700' },
  outlineText:    { color: '#4C9F70' },
});