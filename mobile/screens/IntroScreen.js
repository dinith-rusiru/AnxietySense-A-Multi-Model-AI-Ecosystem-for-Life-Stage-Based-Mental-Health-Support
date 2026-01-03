import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function IntroScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Before You Start</Text>

      <Text style={styles.text}>
        • 21 short questions{"\n"}
        • Choose answers from 0 to 3{"\n"}
        • Answer honestly{"\n"}
        • Takes about 3 minutes{"\n"}
        • For self-awareness only
      </Text>

      <Text style={styles.note}>
        This is not a medical diagnosis.
      </Text>

      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Questionnaire")}
      > 
        <Text style={styles.buttonText}>Start Assessment</Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Face")}
      > 
        <Text style={styles.buttonText}>Start Assessment</Text>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 24,
    marginBottom: 30,
  },
  note: {
    fontSize: 13,
    color: "#64748b",
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
