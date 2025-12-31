// import React from "react";
// import { View, Text, Button, StyleSheet } from "react-native";

// export default function WelcomeScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>AnxietySense</Text>
//       <Text style={styles.subtitle}>
//         Answer a few questions to assess your anxiety level
//       </Text>

//       <Button
//         title="Let's Go 🚀"
//         onPress={() => navigation.navigate("Questions")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 30,
//     textAlign: "center",
//   },
// });


import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AnxietySense</Text>
      <Text style={styles.subtitle}>
        Understand your anxiety level using AI-powered assessment
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Voice")}
      >
        <Text style={styles.buttonText}>Let’s Go</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F7FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
