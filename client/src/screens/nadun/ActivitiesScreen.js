// // ActivitiesScreen.js
// import React from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

// // Suggested activities based on anxiety level
// const anxietyActivities = {
//   Normal: [
//     "Daily physical exercise (e.g., jogging or cycling)",
//     "Journaling positive experiences or gratitude",
//     "Engaging in hobbies or creative outlets"
//   ],
//   Mild: [
//     "Short meditation or mindfulness exercises",
//     "Regular aerobic exercise",
//     "Organize your daily routine"
//   ],
//   Moderate: [
//     "Practice deep breathing exercises (4-7-8 or box breathing)",
//     "Yoga or tai chi for relaxation",
//     "Talk to supportive friends or family"
//   ],
//   Severe: [
//     "Seek professional counseling or therapy",
//     "Practice grounding or relaxation techniques",
//     "Maintain a structured daily routine"
//   ],
//   "Extremely Severe": [
//     "Immediate consultation with a mental health professional",
//     "Engage in short mindfulness or grounding exercises",
//     "Ensure close support from family or friends"
//   ]
// };

// export default function ActivitiesScreen({ route, navigation }) {
//   const { finalLevel } = route.params;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Suggested Activities</Text>
//       <Text style={styles.level}>Your Anxiety Level: {finalLevel}</Text>

//       {anxietyActivities[finalLevel].map((activity, index) => (
//         <Text key={index} style={styles.activity}>
//           • {activity}
//         </Text>
//       ))}

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => navigation.popToTop()}
//       >
//         <Text style={styles.buttonText}>Go Home</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 30,
//     backgroundColor: "#fff"
//   },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
//   level: { fontSize: 20, color: "#2563eb", marginBottom: 20 },
//   activity: { fontSize: 16, marginBottom: 10, textAlign: "left", width: "100%" },
//   button: {
//     backgroundColor: "#2563eb",
//     padding: 14,
//     borderRadius: 12,
//     marginTop: 20,
//     width: "60%",
//     alignItems: "center"
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" }
// });


// ActivitiesScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

// Suggested activities based on anxiety level
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

  // Get activities for the user’s anxiety level
  const activities = anxietyActivities[finalLevel] || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Suggested Activities</Text>
      <Text style={styles.level}>Your Anxiety Level: {finalLevel}</Text>

      {activities.map((activity, index) => (
        <TouchableOpacity
          key={index}
          style={styles.activityButton}
          onPress={() =>
            navigation.navigate("ActivityDetail1", { activityName: activity })
          }
        >
          <Text style={styles.activityText}>{activity}</Text>
        </TouchableOpacity>
      ))}

        <TouchableOpacity
        style={styles.button}
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
          style={styles.button}
          onPress={() => navigation.replace("Chatbot")}
        >
                <Text style={styles.buttonText}>Chatbot</Text>
              </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  level: { fontSize: 20, color: "#2563eb", marginBottom: 20 },
  activityButton: {
    backgroundColor: "#2563eb",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center"
  },
  activityText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  button: {
    backgroundColor: "#64748b",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    width: "60%",
    alignItems: "center"
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