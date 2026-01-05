import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { passQuestions } from "../data/passQuestions";
import { finalAnxietyPrediction } from "../api/api";

export default function QuestionnaireScreen({ navigation, route }) {
  const emotion = route?.params?.emotion ?? "neutral";

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (index > 0) setIndex(index - 1);
    else navigation.goBack();
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
    if (Object.keys(answers).length !== 31) {
      Alert.alert("Incomplete", "Please answer all questions.");
      return;
    }

    try {
      setLoading(true);
      const res = await finalAnxietyPrediction(answers, emotion);
      navigation.navigate("Result", res.data);
    } catch {
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
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.progress}>
          Question {index + 1} / 31
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((index + 1) / 31) * 100}%` },
          ]}
        />
      </View>

      {/* Question Card */}
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
                activeOpacity={0.85}
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

        {/* Scale Helper */}
        <Text style={styles.scaleHint}>
          0 = Not at all · 3 = Nearly every day
        </Text>
      </View>

      {/* Submit */}
      {index === 30 && (
        <TouchableOpacity
          style={styles.submit}
          onPress={submit}
          disabled={loading}
          activeOpacity={0.9}
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

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 22,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  back: {
    color: "#e339e9f6",
    fontSize: 15,
    fontWeight: "500",
  },
  progress: {
    color: "#6B7280",
    fontSize: 14,
  },

  /* Progress Bar */
  progressBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#e7a8e9f6",
  },

  /* Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
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
    backgroundColor: "#e339e9f6",
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

  /* Submit */
  submit: {
    marginTop: 28,
    backgroundColor: "#24b443de",
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


