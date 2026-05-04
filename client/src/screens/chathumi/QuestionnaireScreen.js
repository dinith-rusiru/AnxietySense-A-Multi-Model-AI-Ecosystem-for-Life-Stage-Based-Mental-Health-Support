import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { passQuestions } from "../../data/passQuestions";
import { finalAnxietyPrediction } from "../../../api/api";

export default function QuestionnaireScreen({ navigation, route }) {
  // const emotion = route?.params?.emotion ?? "neutral";
  // const voice_score = route?.params?.voice_score ?? null;
  const emotion = route?.params?.emotion || "neutral";
  const voice_score =
  route?.params?.voice_score !== undefined
    ? route.params.voice_score
    : null;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    navigation.navigate("Voice");
  };

  const selectScore = (score) => {
    setAnswers((prev) => ({
      ...prev,
      [`Q${index + 1}`]: score,
    }));

    if (index < passQuestions.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  const submit = async () => {
    if (Object.keys(answers).length !== passQuestions.length) {
      Alert.alert("Incomplete", "Please answer all questions.");
      return;
    }

    try {
      setLoading(true);

      const res = await finalAnxietyPrediction(
        answers,
        emotion,
        voice_score
      );

      navigation.navigate("Result", {
      ...res.data,
      voice_score: voice_score, // ✅ IMPORTANT FIX
      });
    } catch (e) {
      Alert.alert("Error", "Unable to calculate anxiety level.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.back}>← Voice</Text>
        </TouchableOpacity>

        <Text style={styles.progress}>
          Question {index + 1} / {passQuestions.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${
                ((index + 1) / passQuestions.length) * 100
              }%`,
            },
          ]}
        />
      </View>

      {/* Question */}
      <View style={styles.card}>
        <Text style={styles.question}>
          {passQuestions[index]}
        </Text>

        <View style={styles.options}>
          {[0, 1, 2, 3].map((v) => {
            const selected = answers[`Q${index + 1}`] === v;
            return (
              <TouchableOpacity
                key={v}
                style={[
                  styles.option,
                  selected && styles.selected,
                ]}
                onPress={() => selectScore(v)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.selectedText,
                  ]}
                >
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.scaleHint}>
          0 = Not at all · 3 = Nearly every day
        </Text>
      </View>

      {/* Submit */}
      {index === passQuestions.length - 1 && (
        <TouchableOpacity
          style={styles.submit}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              Submit Assessment
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 22,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  back: {
    color: "#6C63FF",
    fontSize: 15,
    fontWeight: "600",
  },
  progress: {
    color: "#6B7280",
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6C63FF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    elevation: 4,
  },
  question: {
    fontSize: 19,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 26,
    lineHeight: 28,
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    width: "22%",
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#6C63FF",
  },
  optionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  scaleHint: {
    textAlign: "center",
    marginTop: 18,
    color: "#6B7280",
    fontSize: 13,
  },
  submit: {
    marginTop: 28,
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});