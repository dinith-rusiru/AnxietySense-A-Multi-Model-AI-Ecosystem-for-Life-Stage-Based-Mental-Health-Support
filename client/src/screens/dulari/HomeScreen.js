import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  const categories = ["Child", "Young Elder", "Pregnant Woman", "Elders"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Category</Text>
      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => {
            if (cat === 'Elders') {
              navigation.navigate('ElderView');
            } else {
              navigation.navigate('Questionnaire', { category: cat });
            }
          }}
        >
          <Text style={styles.buttonText}>{cat}</Text>
        </TouchableOpacity>
      ))}
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
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
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


