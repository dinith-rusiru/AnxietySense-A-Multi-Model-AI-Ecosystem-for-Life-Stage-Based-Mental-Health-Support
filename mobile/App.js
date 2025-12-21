// import React, { useState } from "react";
// import { View, Text, TextInput, Button, ScrollView, Alert } from "react-native";

// export default function App() {
//   const [answers, setAnswers] = useState(
//     Array.from({ length: 21 }, () => 0)
//   );
//   const [result, setResult] = useState(null);

//   const handleChange = (index, value) => {
//     const newAnswers = [...answers];
//     newAnswers[index] = Number(value);
//     setAnswers(newAnswers);
//   };

//   const submit = async () => {
//     const payload = {};
//     answers.forEach((v, i) => {
//       payload[`Q${i + 1}`] = v;
//     });

//     try {
//       const response = await fetch("http://10.0.2.2:8000/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       setResult(data);
//     } catch (error) {
//       Alert.alert("Error", "Cannot connect to backend");
//     }
//   };

//   return (
//     <ScrollView style={{ padding: 20 }}>
//       <Text style={{ fontSize: 22, fontWeight: "bold" }}>
//         DASS-21 Questionnaire
//       </Text>

//       {answers.map((value, index) => (
//         <View key={index} style={{ marginVertical: 8 }}>
//           <Text>Q{index + 1} (0–3)</Text>
//           <TextInput
//             keyboardType="numeric"
//             value={String(value)}
//             onChangeText={(text) => handleChange(index, text)}
//             style={{
//               borderWidth: 1,
//               padding: 8,
//               borderRadius: 5,
//             }}
//           />
//         </View>
//       ))}

//       <Button title="Predict Score" onPress={submit} />

//       {result && (
//         <View style={{ marginTop: 20 }}>
//           <Text style={{ fontSize: 18 }}>
//             Total Score: {result.Total_Final_Score}
//           </Text>
//           <Text style={{ fontSize: 18 }}>
//             Level: {result.Total_Level}
//           </Text>
//         </View>
//       )}
//     </ScrollView>
//   );
// }


import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";

const TOTAL_QUESTIONS = 21;

export default function App() {
  const [answers, setAnswers] = useState(
    Array.from({ length: TOTAL_QUESTIONS }, () => null)
  );
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);

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

  const progress = ((current + 1) / TOTAL_QUESTIONS) * 100;

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.resultTitle}>Assessment Result</Text>
        <Text style={styles.resultText}>
          Total Score: {result.Total_Final_Score}
        </Text>
        <Text style={styles.resultText}>
          Level: {result.Total_Level}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}

      <Text style={styles.appTitle}>
        Young Adult Anxiety Questionnaire
      </Text>
      <Text style={styles.progressText}>
        Swipe or tap Next/Back · choose 0–3
      </Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.progressPercent}>
        Progress: {Math.round(progress)}%
      </Text>

      {/* Question Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.questionTitle}>
            Question {current + 1}
          </Text>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {current + 1}/{TOTAL_QUESTIONS}
            </Text>
          </View>
        </View>

        <Text style={styles.chooseText}>Choose an answer:</Text>

        {[
          { label: "Never (0)", value: 0 },
          { label: "Sometimes (1)", value: 1 },
          { label: "Often (2)", value: 2 },
          { label: "Always (3)", value: 3 },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.option,
              answers[current] === item.value && styles.selected,
            ]}
            onPress={() => selectAnswer(item.value)}
          >
            <Text style={styles.optionText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.nav}>
        <TouchableOpacity
          disabled={current === 0}
          style={[
            styles.navButton,
            current === 0 && styles.disabled,
          ]}
          onPress={() => setCurrent(current - 1)}
        >
          <Text style={styles.navText}>Back</Text>
        </TouchableOpacity>

        {current === TOTAL_QUESTIONS - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={submit}>
            <Text style={styles.navText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setCurrent(current + 1)}
          >
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={styles.reset}
        onPress={() => {
          setAnswers(Array.from({ length: TOTAL_QUESTIONS }, () => null));
          setCurrent(0);
        }}
      >
        <Text style={styles.resetText}>Reset Answers</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#062e2a",
    padding: 20,
  },

  appTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#ecfeff",
  marginBottom: 6,
  },

  progressText: {
    color: "#9fffe0",
    marginBottom: 6,
    fontSize: 12,
  },
  progressPercent: {
    color: "#7dd3c7",
    marginBottom: 20,
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#134e4a",
    borderRadius: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 5,
  },

  card: {
    backgroundColor: "#0f3f3a",
    borderRadius: 16,
    padding: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  questionTitle: {
    fontSize: 20,
    color: "#ecfeff",
    fontWeight: "bold",
  },

  counter: {
    backgroundColor: "#134e4a",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  counterText: {
    color: "#a7f3d0",
    fontSize: 12,
  },

  chooseText: {
    color: "#a7f3d0",
    marginBottom: 14,
  },

  option: {
    backgroundColor: "#134e4a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  selected: {
    backgroundColor: "#22c55e",
  },

  optionText: {
    color: "#ecfeff",
    fontSize: 16,
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  navButton: {
    backgroundColor: "#134e4a",
    padding: 14,
    borderRadius: 14,
    width: "45%",
    alignItems: "center",
  },

  submitButton: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 14,
    width: "45%",
    alignItems: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  navText: {
    color: "#ecfeff",
    fontWeight: "bold",
  },

  reset: {
    marginTop: 16,
    alignItems: "center",
  },

  resetText: {
    color: "#7dd3c7",
    fontSize: 12,
  },

  resultTitle: {
    fontSize: 24,
    color: "#ecfeff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  resultText: {
    fontSize: 20,
    color: "#a7f3d0",
    textAlign: "center",
    marginBottom: 10,
  },
});
