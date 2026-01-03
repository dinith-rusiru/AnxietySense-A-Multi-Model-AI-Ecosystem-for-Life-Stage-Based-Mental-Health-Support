import { View, Text, StyleSheet } from "react-native";

export default function ResultScreen({ route }) {
  const { questionnaire_score, final_score, anxiety_level, emotion } = route.params;

  const emotionExplain = {
    happy: "Positive emotional tone reduced anxiety.",
    sad: "Sadness slightly increased anxiety.",
    fear: "Fear strongly increased anxiety.",
    anger: "Anger increased emotional stress.",
    neutral: "Neutral emotion had no impact.",
  };

  const levelExplain = {
    "Minimal Anxiety": "You show strong emotional well-being.",
    "Mild Anxiety": "Mild anxiety due to everyday stress.",
    "Moderate Anxiety": "Anxiety affects daily functioning.",
    "Severe Anxiety": "Professional support is recommended.",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anxiety Analysis</Text>

      <Text>Questionnaire Score: {questionnaire_score}</Text>
      <Text>Final Score: {final_score}</Text>

      <Text style={styles.level}>{anxiety_level}</Text>

      <Text style={styles.explain}>
        🧠 Voice Emotion: {emotion}
        {"\n"}{emotionExplain[emotion]}
      </Text>

      <Text style={styles.explain}>
        📊 Overall:
        {"\n"}{levelExplain[anxiety_level]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  level: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  explain: { marginTop: 15, lineHeight: 22 },
});
