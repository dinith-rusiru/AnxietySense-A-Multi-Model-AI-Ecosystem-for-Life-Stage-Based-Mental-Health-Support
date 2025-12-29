import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function InstructionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Before You Begin</Text>

      <Text style={styles.text}>
        • This questionnaire contains 31 questions{`\n`}
        • Each question should be answered from 0 to 3{`\n`}
        • Answer honestly based on how you felt recently{`\n`}
        • There are no right or wrong answers
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Questionnaire")}
      >
        <Text style={styles.buttonText}>Start Questionnaire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2C3E50",
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: "#444",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#27AE60",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
