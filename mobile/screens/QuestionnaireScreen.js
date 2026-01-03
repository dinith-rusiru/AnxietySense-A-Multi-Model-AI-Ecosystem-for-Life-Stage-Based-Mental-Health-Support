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
  const emotion = route?.params?.emotion ?? "neutral"; // ✅ SAFE DEFAULT

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

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
      Alert.alert("Incomplete", "Please answer all 31 questions");
      return;
    }

    try {
      setLoading(true);

      const response = await finalAnxietyPrediction(answers, emotion);

      navigation.navigate("Result", {
        questionnaire_score: response.data.questionnaire_score,
        final_score: response.data.final_score,
        anxiety_level: response.data.anxiety_level,
        emotion: response.data.emotion,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to get anxiety prediction");
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {index + 1} / 31
      </Text>

      <Text style={styles.question}>
        {passQuestions[index]}
      </Text>

      <View style={styles.options}>
        {[0, 1, 2, 3].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.option,
              answers[`Q${index + 1}`] === value && styles.selectedOption,
            ]}
            onPress={() => selectScore(value)}
          >
            <Text style={styles.optionText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {index === passQuestions.length - 1 && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Questionnaire</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  progress: {
    fontSize: 14,
    color: "#999",
    marginBottom: 10,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    color: "#2C3E50",
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  option: {
    backgroundColor: "#EAF2F8",
    padding: 20,
    borderRadius: 12,
    width: "22%",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#5DADE2",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  submitButton: {
    backgroundColor: "#2ECC71",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
