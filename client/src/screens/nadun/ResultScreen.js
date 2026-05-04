
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getAnxietyLevelFromScore = (score) => {
  if (score <= 20) return "Normal";
  if (score <= 40) return "Mild";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "Severe";
  return "Extremely Severe";
};

const combineScores = (emotionScore, questionnaireScore = null) => {
  if (emotionScore === null) {
    return { finalScore: null, finalLevel: null };
  }

//   let finalScore;
//   if (questionnaireScore !== null) {
//     const normalizedQ = (questionnaireScore / 63) * 100;
//     finalScore = 0.6 * normalizedQ + 0.4 * emotionScore;
//   } else {
//     finalScore = emotionScore;
//   }

//   return { finalScore, finalLevel: getAnxietyLevelFromScore(finalScore) };
// };




// Calculate the final anxiety score
let finalScore;

// Check if the questionnaire score is available
if (questionnaireScore !== null) {

  // Convert the questionnaire score (max 63) into a percentage (0–100)
  const normalizedQ = (questionnaireScore / 63) * 100;

  // Combine scores using weighted average
  // 60% weight for questionnaire score
  // 40% weight for emotion detection score
  finalScore = 0.6 * normalizedQ + 0.4 * emotionScore;

} else {

  // If questionnaire score is not available,
  // use only the emotion detection score
  finalScore = emotionScore;
}

// Return the final anxiety score and the anxiety level
// getAnxietyLevelFromScore() converts the score into levels
// such as Normal, Mild, Moderate, Severe, etc.
  return { finalScore, finalLevel: getAnxietyLevelFromScore(finalScore) };
};










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

export default function ResultScreen({ route, navigation }) {
  const { emotionScore, questionnaireScore } = route.params;

  const { finalScore, finalLevel } = combineScores(emotionScore, questionnaireScore);

  // Save anxiety result to AsyncStorage
  useEffect(() => {
    const saveResult = async () => {
      if (!finalLevel) return;
      try {
        const history = JSON.parse(await AsyncStorage.getItem("anxietyHistory")) || [];
        const newRecord = {
          level: finalLevel,
          score: finalScore,
          date: new Date().toISOString()
        };
        await AsyncStorage.setItem("anxietyHistory", JSON.stringify([...history, newRecord]));
      } catch (e) {
        console.log("Error saving anxiety history", e);
      }
    };
    saveResult();
  }, [finalLevel]);

  if (emotionScore === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Result</Text>
        <Text style={styles.note}>No face emotion detected.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Questionnaire")}
        >
          <Text style={styles.buttonText}>Take Questionnaire</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Text style={styles.link}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Result</Text>
      <Text style={styles.score}>Emotion Score: {emotionScore}</Text>
      {questionnaireScore !== null && (
        <Text style={styles.score}>Questionnaire Score: {questionnaireScore}</Text>
      )}
      <Text style={styles.level}>Final Level: {finalLevel}</Text>
      <Text style={styles.score}>Final Score: {finalScore.toFixed(1)}</Text>
      <Text style={styles.note}>This result is for self-awareness only.</Text>

      <Text style={[styles.title, { fontSize: 20, marginTop: 20 }]}>Suggested Activities</Text>
      {anxietyActivities[finalLevel].map((activity, index) => (
        <Text key={index} style={styles.activity}>• {activity}</Text>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Face")}
      >
        <Text style={styles.buttonText}>Retake</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Activities1", { finalLevel })}
      >
        <Text style={styles.buttonText}>View Activities</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Chatbot")}
      >
        <Text style={styles.buttonText}>Chatbot</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Dashboard1", { finalLevel, finalScore })}
      >
        <Text style={styles.buttonText}>Go To Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.popToTop()}>
        <Text style={styles.link}>Go Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 30, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  score: { fontSize: 22, marginBottom: 10 },
  level: { fontSize: 20, color: "#2563eb", marginBottom: 20 },
  note: { fontSize: 15, color: "#64748b", marginBottom: 20, textAlign: "center" },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 12, marginTop: 20, marginBottom: 14, width: "60%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: "#2563eb", fontSize: 16 },
  activity: { fontSize: 16, marginBottom: 8, textAlign: "left", width: "100%" }
});