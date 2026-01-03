// import React from "react";
// import { View, Text, Button, StyleSheet } from "react-native";

// export default function ResultScreen({ route, navigation }) {
//   const { score } = route.params;

//   const getLevel = (score) => {
//     if (score < 20) return "Low Anxiety 😊";
//     if (score < 40) return "Moderate Anxiety 😐";
//     return "High Anxiety 😟";
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Result</Text>

//       <Text style={styles.score}>Score: {score}</Text>
//       <Text style={styles.level}>{getLevel(score)}</Text>

//       <Button
//         title="Start Again"
//         onPress={() => navigation.navigate("Welcome")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
//   score: { fontSize: 22 },
//   level: { fontSize: 20, marginVertical: 20 },
// });


// import { View, Text, StyleSheet } from "react-native";

// export default function ResultScreen({ route }) {
//   const { predicted_total_score, anxiety_level } = route.params;

//   const explanation = {
//     "Minimal Anxiety":
//       "Your responses indicate low anxiety symptoms. You appear emotionally balanced.",
//     "Mild Anxiety":
//       "You show mild anxiety symptoms that may occur due to daily stress.",
//     "Moderate Anxiety":
//       "Your score suggests noticeable anxiety affecting daily activities.",
//     "Severe Anxiety":
//       "High anxiety symptoms detected. Professional support is recommended.",
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Results</Text>

//       <Text style={styles.score}>
//         Total Score: {predicted_total_score}
//       </Text>

//       <Text style={styles.level}>{anxiety_level}</Text>

//       <Text style={styles.explain}>
//         {explanation[anxiety_level]}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 30,
//     backgroundColor: "#F9FBFD",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   score: {
//     fontSize: 22,
//     marginBottom: 10,
//   },
//   level: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#E74C3C",
//     marginBottom: 20,
//   },
//   explain: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: "#555",
//   },
// });

// import { View, Text, StyleSheet } from "react-native";

// export default function ResultScreen({ route }) {
//   const {
//     questionnaire_score,
//     final_score,
//     anxiety_level,
//     emotion
//   } = route.params;

//   const explainEmotion = {
//     happy: "Your voice emotion indicates emotional stability, which reduced your anxiety score.",
//     sad: "Sadness detected in your voice slightly increased your anxiety score.",
//     fear: "Fear detected in your voice significantly increased your anxiety score.",
//     anger: "Anger detected in your voice increased emotional stress levels."
//   };

//   const explainLevel = {
//     "Minimal Anxiety":
//       "Your responses and voice emotion indicate strong emotional well-being.",
//     "Mild Anxiety":
//       "You show mild anxiety, commonly caused by temporary stressors.",
//     "Moderate Anxiety":
//       "Your anxiety may be affecting daily life. Awareness and coping strategies are recommended.",
//     "Severe Anxiety":
//       "High anxiety detected. Professional support is strongly recommended."
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Anxiety Analysis</Text>

//       <Text style={styles.score}>
//         Questionnaire Score: {questionnaire_score}
//       </Text>

//       <Text style={styles.score}>
//         Final Predicted Score: {final_score}
//       </Text>

//       <Text style={styles.level}>{anxiety_level}</Text>

//       <Text style={styles.explain}>
//         🧠 Voice Emotion Analysis:
//         {"\n"}{explainEmotion[emotion]}
//       </Text>

//       <Text style={styles.explain}>
//         📊 Overall Explanation:
//         {"\n"}{explainLevel[anxiety_level]}
//       </Text>
//     </View>
//   );
// }

import { View, Text, StyleSheet } from "react-native";

export default function ResultScreen({ route }) {
  const {
    questionnaire_score,
    final_score,
    anxiety_level,
    emotion,
  } = route.params;

  const explainEmotion = {
    happy:
      "Your voice emotion showed positivity and emotional stability, which reduced your overall anxiety score.",
    sad:
      "Sadness detected in your voice slightly increased your anxiety score.",
    fear:
      "Fear detected in your voice significantly increased emotional stress indicators.",
    anger:
      "Anger detected in your voice contributed to heightened emotional tension.",
    neutral:
      "Neutral voice emotion had no significant effect on your anxiety score.",
  };

  const explainLevel = {
    "Minimal Anxiety":
      "Your responses and voice emotion suggest strong emotional well-being.",
    "Mild Anxiety":
      "Mild anxiety detected, commonly associated with everyday stress.",
    "Moderate Anxiety":
      "Moderate anxiety detected. Monitoring and coping strategies are recommended.",
    "Severe Anxiety":
      "Severe anxiety detected. Professional mental health support is strongly recommended.",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Anxiety Analysis</Text>

      <Text style={styles.score}>
        Questionnaire Score: {questionnaire_score}
      </Text>

      <Text style={styles.score}>
        Final Predicted Score: {final_score}
      </Text>

      <Text style={styles.level}>{anxiety_level}</Text>

      <Text style={styles.explain}>
        🧠 Voice Emotion Insight:
        {"\n"}{explainEmotion[emotion]}
      </Text>

      <Text style={styles.explain}>
        📊 Overall Assessment:
        {"\n"}{explainLevel[anxiety_level]}
      </Text>
    </View>
  );
}

/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "#F9FBFD",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
  },
  score: {
    fontSize: 20,
    marginBottom: 10,
  },
  level: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 20,
  },
  explain: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
    marginBottom: 15,
  },
});
