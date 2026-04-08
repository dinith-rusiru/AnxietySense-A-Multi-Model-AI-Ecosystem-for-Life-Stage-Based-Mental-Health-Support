import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';

const CATEGORIES = [ 'Elders'];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.appName}>AnxieApp</Text>
        <Text style={styles.subtitle}>Select your category to begin</Text>

        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => {
              if (cat === 'Elders') {
                navigation.navigate('ElderView');
              } else {
                navigation.navigate('Questionnaireee', { category: cat });
              }
            }}
          >
            <Text style={styles.buttonText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#EAF4F4' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  appName:   { fontSize: 36, fontWeight: '800', color: '#4C9F70', marginBottom: 8 },
  subtitle:  { fontSize: 16, color: '#666', marginBottom: 40 },
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
  buttonText: { fontSize: 18, color: '#FFF', fontWeight: '700' },
});