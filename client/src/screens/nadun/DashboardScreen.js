
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const anxietyActivities = { /* same as before */ };

export default function DashboardScreen({ route, navigation }) {
  const { finalLevel, finalScore } = route.params || {};

  const [anxietyHistory, setAnxietyHistory] = useState([]);
  const [todaysActivities, setTodaysActivities] = useState([]);
  const weekNumber = 1;
  const streakDays = 3;

  useEffect(() => {
    const loadData = async () => {
      // Load last 5 anxiety records
      const history = JSON.parse(await AsyncStorage.getItem("anxietyHistory")) || [];
      setAnxietyHistory(history.slice(-5).reverse());

      // Load today's activities
      const todayKey = new Date().toISOString().slice(0,10);
      const activitiesToday = JSON.parse(await AsyncStorage.getItem(todayKey)) || [];
      setTodaysActivities(activitiesToday);
    };
    loadData();
  }, [finalLevel]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mental Health Dashboard</Text>

      {/* Current Anxiety Level */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Anxiety Level</Text>
        <Text style={styles.level}>{finalLevel}</Text>
        <Text style={styles.score}>Score: {finalScore?.toFixed(1)}</Text>
        <Text style={styles.meta}>
          Week {weekNumber}  |  🔥 {streakDays} Day Streak
        </Text>
      </View>

      {/* Anxiety Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Anxiety Progress (Last 5)</Text>
        {anxietyHistory.length === 0 ? (
          <Text>No records yet</Text>
        ) : (
          anxietyHistory.map((record, index) => (
            <Text key={index} style={styles.progress}>
              Record {index + 1}: {record.level} ({record.score.toFixed(1)})
            </Text>
          ))
        )}
      </View>

      {/* Today's Activities */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Completed Activities</Text>
        {todaysActivities.length === 0 ? (
          <Text>No activities done today</Text>
        ) : (
          todaysActivities.map((act, i) => <Text key={i} style={styles.activity}>✔ {act}</Text>)
        )}
        <Text style={styles.count}>
          Activities Completed Today: {todaysActivities.length}
        </Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Activities1", { finalLevel })}>
        <Text style={styles.buttonText}>Start Activities</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Result</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Face")}>
        <Text style={styles.buttonText}>Take New Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.home} onPress={() => navigation.popToTop()}>
        <Text style={styles.homeText}>Go Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Use your same styles from before

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 30,
    backgroundColor: "#f5f7fb",
    alignItems: "center"
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  level: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb"
  },

  score: {
    fontSize: 18,
    marginTop: 5
  },

  meta: {
    marginTop: 8,
    color: "#64748b"
  },

  progress: {
    fontSize: 16,
    marginBottom: 4
  },

  activity: {
    fontSize: 16,
    marginBottom: 6
  },

  count: {
    marginTop: 10,
    fontWeight: "bold"
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    width: "70%",
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  },

  home: {
    marginTop: 20
  },

  homeText: {
    color: "#2563eb",
    fontSize: 16
  },

  buttonText: { color: "#fff", fontWeight: "bold" },
  backButton: {
  backgroundColor: "#f59e0b",
  padding: 14,
  borderRadius: 12,
  marginTop: 10,
  width: "60%",
  alignItems: "center"
},

});