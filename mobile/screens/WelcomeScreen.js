import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anxiety Sense</Text>

      <Text style={styles.subtitle}>
        Young Adult Mental Health Assessment
      </Text>

      <Text style={styles.age}>Age Group: 18 – 30 Years</Text>

      <Text style={styles.description}>
        This self-assessment helps young adults understand anxiety-related
        emotional patterns.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Intro")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#2563eb",
    marginBottom: 14,
  },
  age: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
