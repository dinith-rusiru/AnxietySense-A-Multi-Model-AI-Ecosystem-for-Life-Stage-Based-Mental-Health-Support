// // import React, { useState } from "react";
// // import { View, Text, TextInput, Button, StyleSheet } from "react-native";
// // import { predictScore } from "../api/api";

// // const TOTAL_QUESTIONS = 34;

// // export default function QuestionScreen({ navigation }) {
// //   const [current, setCurrent] = useState(1);
// //   const [answers, setAnswers] = useState({});
// //   const [loading, setLoading] = useState(false);

// //   const handleNext = () => {
// //     if (current < TOTAL_QUESTIONS) {
// //       setCurrent(current + 1);
// //     } else {
// //       submit();
// //     }
// //   };

// //   const submit = async () => {
// //     setLoading(true);

// //     let features = {};
// //     for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
// //       features[`Q${i}`] = answers[`Q${i}`] || 0;
// //     }

// //     try {
// //       const response = await predictScore(features);
// //       navigation.navigate("Result", {
// //         score: response.data.predicted_total_score,
// //       });
// //     } catch (err) {
// //       alert("Prediction failed");
// //     }

// //     setLoading(false);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.counter}>
// //         Question {current} / {TOTAL_QUESTIONS}
// //       </Text>

// //       <Text style={styles.question}>
// //         How do you rate question {current}?
// //       </Text>

// //       <TextInput
// //         style={styles.input}
// //         keyboardType="numeric"
// //         placeholder="0 - 5"
// //         onChangeText={(value) =>
// //           setAnswers({ ...answers, [`Q${current}`]: Number(value) })
// //         }
// //       />

// //       <Button
// //         title={current === TOTAL_QUESTIONS ? "Submit" : "Next"}
// //         onPress={handleNext}
// //         disabled={loading}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: "center", padding: 20 },
// //   counter: { textAlign: "center", marginBottom: 10 },
// //   question: { fontSize: 18, marginBottom: 20, textAlign: "center" },
// //   input: {
// //     borderWidth: 1,
// //     padding: 10,
// //     marginBottom: 20,
// //     borderRadius: 5,
// //   },
// // });

// import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// import { useState } from "react";
// import { passQuestions } from "../data/passQuestions";
// import { predictScore } from "../api/api";

// export default function QuestionnaireScreen({ navigation }) {
//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState({});

//   const selectScore = (score) => {
//     setAnswers({ ...answers, [`Q${index + 1}`]: score });

//     if (index < passQuestions.length - 1) {
//       setIndex(index + 1);
//     } else {
//       submit();
//     }
//   };

//   const submit = async () => {
//     if (Object.keys(answers).length < 31) {
//       Alert.alert("Please answer all questions");
//       return;
//     }

//     const response = await predictScore(answers);
//     navigation.navigate("Result", response.data);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.progress}>
//         Question {index + 1} / 31
//       </Text>

//       <Text style={styles.question}>{passQuestions[index]}</Text>

//       <View style={styles.options}>
//         {[0, 1, 2, 3].map((value) => (
//           <TouchableOpacity
//             key={value}
//             style={styles.option}
//             onPress={() => selectScore(value)}
//           >
//             <Text style={styles.optionText}>{value}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 25,
//     justifyContent: "center",
//   },
//   progress: {
//     fontSize: 14,
//     color: "#999",
//     marginBottom: 10,
//   },
//   question: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 30,
//     color: "#2C3E50",
//   },
//   options: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   option: {
//     backgroundColor: "#EAF2F8",
//     padding: 20,
//     borderRadius: 10,
//     width: "22%",
//     alignItems: "center",
//   },
//   optionText: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });


// import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// import { useState } from "react";
// import { passQuestions } from "../data/passQuestions";
// import { predictScore } from "../api/api";

// export default function QuestionnaireScreen({ navigation }) {
//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState({});

//   const selectScore = async (score) => {
//     const updatedAnswers = {
//       ...answers,
//       [`Q${index + 1}`]: score,
//     };

//     setAnswers(updatedAnswers);

//     if (index < passQuestions.length - 1) {
//       setIndex(index + 1);
//     } else {
//       submit(updatedAnswers);
//     }
//   };

//   const submit = async (finalAnswers) => {
//     if (Object.keys(finalAnswers).length !== 31) {
//       Alert.alert("Please answer all questions");
//       return;
//     }

//     try {
//       const response = await predictScore(finalAnswers);
//       navigation.navigate("Result", response.data);
//     } catch (error) {
//       Alert.alert("Error", "Failed to get prediction");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.progress}>
//         Question {index + 1} / 31
//       </Text>

//       <Text style={styles.question}>
//         {passQuestions[index]}
//       </Text>

//       <View style={styles.options}>
//         {[0, 1, 2, 3].map((value) => (
//           <TouchableOpacity
//             key={value}
//             style={styles.option}
//             onPress={() => selectScore(value)}
//           >
//             <Text style={styles.optionText}>{value}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 25,
//     justifyContent: "center",
//   },
//   progress: {
//     fontSize: 14,
//     color: "#999",
//     marginBottom: 10,
//   },
//   question: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 30,
//     color: "#2C3E50",
//   },
//   options: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   option: {
//     backgroundColor: "#EAF2F8",
//     padding: 20,
//     borderRadius: 10,
//     width: "22%",
//     alignItems: "center",
//   },
//   optionText: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });


import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { passQuestions } from "../data/passQuestions";
import { predictScore } from "../api/api";

export default function QuestionnaireScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // Handle score selection
  // -------------------------------
  const selectScore = (score) => {
    const updatedAnswers = {
      ...answers,
      [`Q${index + 1}`]: score,
    };

    setAnswers(updatedAnswers);

    // Move to next question ONLY (no auto-submit)
    if (index < passQuestions.length - 1) {
      setIndex(index + 1);
    }
  };

  // -------------------------------
  // Submit after all 31 questions
  // -------------------------------
  const submit = async () => {
    if (Object.keys(answers).length !== 31) {
      Alert.alert("Incomplete", "Please answer all 31 questions");
      return;
    }

    try {
      setLoading(true);
      const response = await predictScore(answers);
      setLoading(false);

      navigation.navigate("Result", response.data);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to get prediction");
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <Text style={styles.progress}>
        Question {index + 1} / 31
      </Text>

      {/* Question */}
      <Text style={styles.question}>
        {passQuestions[index]}
      </Text>

      {/* Options */}
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

      {/* Submit button (ONLY after last question) */}
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
