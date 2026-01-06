import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ElderViewScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Elders')}
      >
        <Text style={styles.buttonText}>Elders Questionnaire</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.buttonText}>Camera</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4F4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#4C9F70',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
});
