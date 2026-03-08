import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      
      {/* ---------- TOP ---------- */}
      <View style={styles.topSection}>
        <Text style={styles.title}>AnxietySense</Text>
        <Text style={styles.tagline}>
          Emotional Well-Being Support During Pregnancy
        </Text>
      </View>

      {/* ---------- BOTTOM ---------- */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Voice")}
        >
          <Text style={styles.buttonText}>Begin Emotional Check-In</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          💗 This feature supports emotional awareness during pregnancy and does
          not replace medical or professional care.
        </Text>
      </View>

    </View>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    padding: 24,
    justifyContent: "space-between", // top & bottom spacing
    alignItems: "center", // center everything horizontally
  },

  /* Top */
  topSection: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: "#e339e9f6",
    fontWeight: "500",
    textAlign: "center",
  },

  /* Bottom */
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#e339e9f6",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 18,
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});


