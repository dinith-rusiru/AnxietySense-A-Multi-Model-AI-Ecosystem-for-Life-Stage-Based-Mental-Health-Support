import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Result</Text>

      <Text style={styles.score}>
        Score: {result.Total_Final_Score}
      </Text>

      <Text style={styles.level}>
        Level: {result.Total_Level}
      </Text>

      <Text style={styles.note}>
        This result is for self-awareness only.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Questionnaire")}
      >
        <Text style={styles.buttonText}>Retake</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.popToTop()}>
        <Text style={styles.link}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  score: { fontSize: 22, marginBottom: 10 },
  level: { fontSize: 20, color: "#2563eb", marginBottom: 20 },
  note: { fontSize: 13, color: "#64748b", marginBottom: 30 },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#2563eb" },
});
