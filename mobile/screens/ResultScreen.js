import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;

  // Suggested activities based on anxiety level
  const anxietyActivities = {
    Normal: [
      "Daily physical exercise (e.g., jogging or cycling)",
      "Journaling positive experiences or gratitude",
      "Engaging in hobbies or creative outlets"
    ],
    Mild: [
      "Short meditation or mindfulness exercises",
      "Regular aerobic exercise",
      "Organize your daily routine"
    ],
    Moderate: [
      "Practice deep breathing exercises (4-7-8 or box breathing)",
      "Yoga or tai chi for relaxation",
      "Talk to supportive friends or family"
    ],
    Severe: [
      "Seek professional counseling or therapy",
      "Practice grounding or relaxation techniques",
      "Maintain a structured daily routine"
    ],
    "Extremely Severe": [
      "Immediate consultation with a mental health professional",
      "Engage in short mindfulness or grounding exercises",
      "Ensure close support from family or friends"
    ]
  };

  // Determine activities to show
  const activities = anxietyActivities[result.Total_Level] || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Result</Text>

      <Text style={styles.score}>Score: {result.Total_Final_Score}</Text>

      <Text style={styles.level}>Level: {result.Total_Level}</Text>

      <Text style={styles.note}>This result is for self-awareness only.</Text>

      <Text style={styles.activityTitle}>Recommended Activities:</Text>
      {activities.map((item, index) => (
        <Text key={index} style={styles.activityItem}>
          • {item}
        </Text>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Questionnaire")}
      >
        <Text style={styles.buttonText}>Retake</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.popToTop()}>
        <Text style={styles.link}>Go Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff"
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  score: { fontSize: 22, marginBottom: 10 },
  level: { fontSize: 20, color: "#2563eb", marginBottom: 20 },
  note: { fontSize: 13, color: "#64748b", marginBottom: 20, textAlign: "center" },
  activityTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  activityItem: { fontSize: 15, color: "#1e293b", marginBottom: 6 },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 14,
    width: "60%",
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#2563eb", fontSize: 16 }
});
