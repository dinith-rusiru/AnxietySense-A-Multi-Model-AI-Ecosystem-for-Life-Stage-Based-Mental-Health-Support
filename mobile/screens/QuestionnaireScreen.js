import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";

/* =======================
   QUESTIONS
   ======================= */
const QUESTIONS = [
  "I found it hard to feel motivated to do things I usually enjoy.",
  "I felt low or sad for most of the time.",
  "I felt that life had little meaning or purpose.",
  "I had difficulty feeling positive emotions.",
  "I felt tired or lacked energy even without much activity.",
  "I felt disappointed in myself or my achievements.",
  "I felt hopeless about my future.",
  "I experienced sudden feelings of fear without a clear reason.",
  "I felt physically tense, such as trembling or a racing heartbeat.",
  "I worried about situations where I might panic or lose control.",
  "I felt uneasy or nervous in ordinary situations.",
  "I noticed breathing difficulties when I felt anxious.",
  "I felt scared without knowing why.",
  "I felt close to panic or extreme nervousness.",
  "I found it hard to relax even during free time.",
  "I reacted strongly to small problems or interruptions.",
  "I felt mentally overloaded or pressured.",
  "I felt restless or unable to stay calm.",
  "I felt easily irritated or annoyed.",
  "I found it difficult to slow down my thoughts.",
  "I felt overwhelmed by daily responsibilities.",
];

const TOTAL = QUESTIONS.length;

export default function QuestionnaireScreen({ navigation }) {
  const [answers, setAnswers] = useState(Array(TOTAL).fill(null));
  const [current, setCurrent] = useState(0);

  const selectAnswer = (value) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);
  };

  const submit = async () => {
    if (answers.includes(null)) {
      Alert.alert("Incomplete", "Please answer all questions");
      return;
    }

    const payload = {};
    answers.forEach((v, i) => (payload[`Q${i + 1}`] = v));

    try {
      const response = await fetch("http://10.0.2.2:8000/dass21/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      navigation.navigate("Result", { result: data });
    } catch (error) {
      Alert.alert("Error", "Cannot connect to backend");
    }
  };

  const progress = ((current + 1) / TOTAL) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Question {current + 1}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.question}>{QUESTIONS[current]}</Text>

        {[0, 1, 2, 3].map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              styles.option,
              answers[current] === v && styles.selected,
            ]}
            onPress={() => selectAnswer(v)}
          >
            <Text
              style={[
                styles.optionText,
                answers[current] === v && { color: "#ffffff" },
              ]}
            >
              {["Never", "Sometimes", "Often", "Always"][v]} ({v})
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.nav}>
          <TouchableOpacity
            disabled={current === 0}
            style={[
              styles.navBtn,
              current === 0 && styles.disabled,
            ]}
            onPress={() => setCurrent(current - 1)}
          >
            <Text>Back</Text>
          </TouchableOpacity>

          {current === TOTAL - 1 ? (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submit}
            >
              <Text>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => setCurrent(current + 1)}
            >
              <Text>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* =======================
   STYLES
   ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 380,
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },

  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 14,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 4,
  },

  question: {
    fontSize: 16,
    textAlign: "left",
    lineHeight: 22,
    marginBottom: 24,
    color: "#1e293b",
  },

  option: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
    borderColor: "#cbd5e1",
  },

  selected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  optionText: {
    fontSize: 16,
    color: "#0f172a",
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  navBtn: {
    padding: 14,
  },

  submitBtn: {
    padding: 14,
    backgroundColor: "#93c5fd",
    borderRadius: 12,
  },

  disabled: {
    opacity: 0.4,
  },
});
