import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert } from "react-native";

export default function App() {
  const [answers, setAnswers] = useState(
    Array.from({ length: 21 }, () => 0)
  );
  const [result, setResult] = useState(null);

  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = Number(value);
    setAnswers(newAnswers);
  };

  const submit = async () => {
    const payload = {};
    answers.forEach((v, i) => {
      payload[`Q${i + 1}`] = v;
    });

    try {
      const response = await fetch("http://10.0.2.2:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      Alert.alert("Error", "Cannot connect to backend");
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        DASS-21 Questionnaire
      </Text>

      {answers.map((value, index) => (
        <View key={index} style={{ marginVertical: 8 }}>
          <Text>Q{index + 1} (0–3)</Text>
          <TextInput
            keyboardType="numeric"
            value={String(value)}
            onChangeText={(text) => handleChange(index, text)}
            style={{
              borderWidth: 1,
              padding: 8,
              borderRadius: 5,
            }}
          />
        </View>
      ))}

      <Button title="Predict Score" onPress={submit} />

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18 }}>
            Total Score: {result.Total_Final_Score}
          </Text>
          <Text style={{ fontSize: 18 }}>
            Level: {result.Total_Level}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
