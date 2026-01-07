import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function ResultScreen({ route, navigation }) {
  const {
    questionnaire_score,
    final_score,
    anxiety_level,
    emotion,
  } = route.params;

  const usedVoice = emotion && emotion !== "neutral";

  /* =======================
     Explainable AI Text
  ======================== */
  const explanations = {
    "Minimal Anxiety":
      "Your responses suggest good emotional balance. You are managing everyday stress well.",
    "Mild Anxiety":
      "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
    "Moderate Anxiety":
      "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
    "Severe Anxiety":
      "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
  };

  const emotionImpact = {
    happy:
      "Positive emotional tones in your voice slightly reduced your overall anxiety score.",
    sad:
      "Emotional heaviness detected in your voice contributed to increased anxiety indicators.",
    fear:
      "Fear-related vocal patterns significantly influenced your anxiety score.",
    anger:
      "Tension detected in your voice increased emotional stress indicators.",
    neutral:
      "Voice data did not significantly influence the final result.",
  };

  const activities = {
    "Minimal Anxiety": [
      "Gratitude journaling",
      "Slow breathing (5 minutes)",
    ],
    "Mild Anxiety": [
      "Guided breathing exercises",
      "Light stretching or walking",
    ],
    "Moderate Anxiety": [
      "Short guided meditation",
      "Consistent sleep routine",
    ],
    "Severe Anxiety": [
      "Speak with a mental health professional",
      "Grounding exercises (5-4-3-2-1)",
    ],
  };

  /* =======================
     Dynamic Anxiety Colors
  ======================== */
  const levelColors = {
    "Minimal Anxiety": "#D1FAE5",
    "Mild Anxiety": "#FEF3C7",
    "Moderate Anxiety": "#FFEDD5",
    "Severe Anxiety": "#FEE2E2",
  };

  const levelTextColors = {
    "Minimal Anxiety": "#065F46",
    "Mild Anxiety": "#92400E",
    "Moderate Anxiety": "#9A3412",
    "Severe Anxiety": "#991B1B",
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Anxiety Assessment</Text>

      {/* Scores */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Questionnaire Score</Text>
          <Text style={styles.value}>{questionnaire_score}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Detected Emotion</Text>
          <Text style={styles.valueSmall}>{emotion}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Final Predicted Score</Text>
          <Text style={styles.value}>{final_score}</Text>
        </View>
      </View>

      {/* Anxiety Level */}
      <View
        style={[
          styles.levelCard,
          { backgroundColor: levelColors[anxiety_level] },
        ]}
      >
        <Text
          style={[
            styles.levelText,
            { color: levelTextColors[anxiety_level] },
          ]}
        >
          {anxiety_level}
        </Text>
      </View>

      {/* Explainable AI */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          How this result was determined
        </Text>
        <Text style={styles.text}>
          {explanations[anxiety_level]}
        </Text>

        {usedVoice && (
          <Text style={styles.text}>
            🎤 Voice Analysis: {emotionImpact[emotion]}
          </Text>
        )}
      </View>

      {/* Activities */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Suggested Activities
        </Text>

        {activities[anxiety_level].map((item, index) => (
          <Text key={index} style={styles.list}>
            • {item}
          </Text>
        ))}

        <TouchableOpacity style={styles.activityBtn}>
          <Text style={styles.activityText}>
            View Activities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Home */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate("Welcome")}
      >
        <Text style={styles.homeText}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    padding: 22,
    backgroundColor: "#F4F7FB",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1F2937",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
  },

  row: {
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
  },

  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  valueSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },

  levelCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
  },

  levelText: {
    fontSize: 20,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },

  text: {
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
    marginBottom: 8,
  },

  list: {
    fontSize: 14,
    color: "#374151",
    marginVertical: 3,
  },

  activityBtn: {
    marginTop: 12,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  activityText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  homeBtn: {
    marginTop: 18,
    backgroundColor: "#9CA3AF",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  homeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});


