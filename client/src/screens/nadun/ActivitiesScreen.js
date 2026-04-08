import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const anxietyActivities = {
  Normal: [
    "Daily physical exercise (e.g., jogging or cycling)",
    "Journaling positive experiences or gratitude",
    "Engaging in hobbies or creative outlets"
  ],
  Mild: [
    "Short meditation or mindfulness exercises",
    "Regular aerobic exercise",
    "Organize your daily routine"
  ],
  Moderate: [
    "Practice deep breathing exercises (4-7-8 or box breathing)",
    "Yoga or tai chi for relaxation",
    "Talk to supportive friends or family"
  ],
  Severe: [
    "Seek professional counseling or therapy",
    "Practice grounding or relaxation techniques",
    "Maintain a structured daily routine"
  ],
  "Extremely Severe": [
    "Immediate consultation with a mental health professional",
    "Engage in short mindfulness or grounding exercises",
    "Ensure close support from family or friends"
  ]
};

export default function ActivitiesScreen({ route, navigation }) {
  const { finalLevel } = route.params;

  const activities = anxietyActivities[finalLevel] || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>Recommended Activities</Text>
        <Text style={styles.levelLabel}>Your Anxiety Level</Text>
        <Text style={styles.level}>{finalLevel}</Text>
      </View>

      {/* Activity Cards */}
      <View style={styles.activitiesContainer}>
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={index}
            style={styles.activityCard}
            onPress={() =>
              navigation.navigate("ActivityDetail", { activityName: activity })
            }
          >
            <View style={styles.activityIcon}>
              <Text style={styles.iconText}>🧠</Text>
            </View>

            <Text style={styles.activityText}>{activity}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Result</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.replace("Chatbot")}
        >
          <Text style={styles.buttonText}>Chat with AI</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8fafc"
  },

  headerCard: {
    backgroundColor: "#2563eb",
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10
  },

  levelLabel: {
    fontSize: 15,
    color: "#e2e8f0"
  },

  level: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 5
  },

  activitiesContainer: {
    marginBottom: 25
  },

  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#e0ecff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15
  },

  iconText: {
    fontSize: 20
  },

  activityText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500"
  },

  buttonContainer: {
    alignItems: "center",
    marginTop: 10
  },

  homeButton: {
    backgroundColor: "#64748b",
    padding: 15,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    marginBottom: 12
  },

  backButton: {
    backgroundColor: "#f59e0b",
    padding: 15,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    marginBottom: 12
  },

  chatButton: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 12,
    width: "80%",
    alignItems: "center"
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16
  }

});