import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import { predictScore } from "../api/api";

export default function PredictionScreen() {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setInputs({ ...inputs, [key]: Number(value) });
  };

  const submit = async () => {
    try {
      // Fill missing features with 0
      let features = {};
      for (let i = 1; i <= 34; i++) {
        const key = `Q${i}`;
        features[key] = inputs[key] || 0;
      }

      const response = await predictScore(features);
      setResult(response.data.predicted_total_score);
      setError(null);
    } catch (err) {
      setError(err.response?.data || "Error occurred");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AnxietySense Predictor</Text>

      {Array.from({ length: 34 }, (_, i) => (
        <View key={i} style={styles.inputContainer}>
          <Text>Q{i + 1}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0 - 5"
            onChangeText={(value) => handleChange(`Q${i + 1}`, value)}
          />
        </View>
      ))}

      <Button title="Predict Anxiety Score" onPress={submit} />

      {result !== null && (
        <Text style={styles.result}>
          Predicted Score: {result}
        </Text>
      )}

      {error && (
        <Text style={styles.error}>
          {JSON.stringify(error)}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
  },
  result: {
    marginTop: 20,
    fontSize: 20,
    color: "green",
    textAlign: "center",
  },
  error: {
    marginTop: 20,
    color: "red",
  },
});
