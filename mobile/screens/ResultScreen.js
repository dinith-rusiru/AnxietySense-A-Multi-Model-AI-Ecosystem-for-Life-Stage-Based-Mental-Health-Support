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


import { View, Text, StyleSheet } from "react-native";

export default function ResultScreen({ route }) {
  const { predicted_total_score, anxiety_level } = route.params;

  const explanation = {
    "Minimal Anxiety":
      "Your responses indicate low anxiety symptoms. You appear emotionally balanced.",
    "Mild Anxiety":
      "You show mild anxiety symptoms that may occur due to daily stress.",
    "Moderate Anxiety":
      "Your score suggests noticeable anxiety affecting daily activities.",
    "Severe Anxiety":
      "High anxiety symptoms detected. Professional support is recommended.",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Results</Text>

      <Text style={styles.score}>
        Total Score: {predicted_total_score}
      </Text>

      <Text style={styles.level}>{anxiety_level}</Text>

      <Text style={styles.explain}>
        {explanation[anxiety_level]}
      </Text>
    </View>
  );
}

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
    marginBottom: 20,
  },
  score: {
    fontSize: 22,
    marginBottom: 10,
  },
  level: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 20,
  },
  explain: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
});
