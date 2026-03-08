// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";

// export default function ResultScreen({ route, navigation }) {
//   const {
//     questionnaire_score,
//     final_score,
//     anxiety_level,
//     emotion,
//   } = route.params;

//   const usedVoice = emotion && emotion !== "neutral";

//   /* =======================
//      Explainable AI Text
//   ======================== */
//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const emotionImpact = {
//     happy:
//       "Positive emotional tones in your voice slightly reduced your overall anxiety score.",
//     sad:
//       "Emotional heaviness detected in your voice contributed to increased anxiety indicators.",
//     fear:
//       "Fear-related vocal patterns significantly influenced your anxiety score.",
//     anger:
//       "Tension detected in your voice increased emotional stress indicators.",
//     neutral:
//       "Voice data did not significantly influence the final result.",
//   };

//   const activities = {
//     "Minimal Anxiety": [
//       "Gratitude journaling",
//       "Slow breathing (5 minutes)",
//     ],
//     "Mild Anxiety": [
//       "Guided breathing exercises",
//       "Light stretching or walking",
//     ],
//     "Moderate Anxiety": [
//       "Short guided meditation",
//       "Consistent sleep routine",
//     ],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   /* =======================
//      Dynamic Anxiety Colors
//   ======================== */
//   const levelColors = {
//     "Minimal Anxiety": "#D1FAE5",
//     "Mild Anxiety": "#FEF3C7",
//     "Moderate Anxiety": "#FFEDD5",
//     "Severe Anxiety": "#FEE2E2",
//   };

//   const levelTextColors = {
//     "Minimal Anxiety": "#065F46",
//     "Mild Anxiety": "#92400E",
//     "Moderate Anxiety": "#9A3412",
//     "Severe Anxiety": "#991B1B",
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       {/* Scores */}
//       <View style={styles.card}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Questionnaire Score</Text>
//           <Text style={styles.value}>{questionnaire_score}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Detected Emotion</Text>
//           <Text style={styles.valueSmall}>{emotion}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Final Predicted Score</Text>
//           <Text style={styles.value}>{final_score}</Text>
//         </View>
//       </View>

//       {/* Anxiety Level */}
//       <View
//         style={[
//           styles.levelCard,
//           { backgroundColor: levelColors[anxiety_level] },
//         ]}
//       >
//         <Text
//           style={[
//             styles.levelText,
//             { color: levelTextColors[anxiety_level] },
//           ]}
//         >
//           {anxiety_level}
//         </Text>
//       </View>

//       {/* Explainable AI */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>
//           How this result was determined
//         </Text>
//         <Text style={styles.text}>
//           {explanations[anxiety_level]}
//         </Text>

//         {usedVoice && (
//           <Text style={styles.text}>
//             🎤 Voice Analysis: {emotionImpact[emotion]}
//           </Text>
//         )}
//       </View>

//       {/* Activities */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>
//           Suggested Activities
//         </Text>

//         {activities[anxiety_level].map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         <TouchableOpacity style={styles.activityBtn}>
//           <Text style={styles.activityText}>
//             View Activities
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Home */}
//       <TouchableOpacity
//         style={styles.homeBtn}
//         onPress={() => navigation.navigate("Welcome")}
//       >
//         <Text style={styles.homeText}>
//           Back to Home
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// /* =======================
//    STYLES
// ======================= */
// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     backgroundColor: "#F4F7FB",
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 16,
//     color: "#1F2937",
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//     elevation: 3,
//   },

//   row: {
//     marginBottom: 10,
//   },

//   label: {
//     fontSize: 13,
//     color: "#6B7280",
//   },

//   value: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#111827",
//   },

//   valueSmall: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//     textTransform: "capitalize",
//   },

//   levelCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     alignItems: "center",
//   },

//   levelText: {
//     fontSize: 20,
//     fontWeight: "700",
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#1F2937",
//   },

//   text: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: "#374151",
//     marginBottom: 8,
//   },

//   list: {
//     fontSize: 14,
//     color: "#374151",
//     marginVertical: 3,
//   },

//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   activityText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },

//   homeBtn: {
//     marginTop: 18,
//     backgroundColor: "#9CA3AF",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   homeText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "500",
//   },
// });


// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// export default function ResultScreen({ route, navigation }) {
//   const {
//     final_score,
//     anxiety_level,
//     questionnaire_score,
//     mode,
//     emotion,
//   } = route.params || {};

//   const questionnaireScore = questionnaire_score ?? "N/A";

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Result</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>Mode</Text>
//         <Text style={styles.value}>{mode}</Text>

//         <Text style={styles.label}>Emotion</Text>
//         <Text style={styles.value}>{emotion}</Text>

//         <Text style={styles.label}>Questionnaire Score</Text>
//         <Text style={styles.value}>{questionnaireScore}</Text>

//         <Text style={styles.label}>Final Score</Text>
//         <Text style={styles.value}>{final_score}</Text>

//         <Text style={styles.label}>Anxiety Level</Text>
//         <Text style={styles.level}>{anxiety_level}</Text>
//       </View>

//       <TouchableOpacity
//         style={styles.nextBtn}
//         onPress={() => navigation.navigate("Voice")}
//       >
//         <Text style={styles.btnText}>Check Again</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6FB",
//     justifyContent: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 12,
//   },
//   label: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 10,
//   },
//   value: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   level: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#6C63FF",
//     marginTop: 5,
//   },
//   nextBtn: {
//     backgroundColor: "#6C63FF",
//     padding: 16,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 25,
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";

// export default function ResultScreen({ route, navigation }) {
//   const {
//     questionnaire_score,
//     final_score,
//     anxiety_level,
//     emotion,
//     mode,
//   } = route.params || {};

//   const usedVoice = emotion && emotion !== "neutral";

//   /* =======================
//      Explainable AI Text
//   ======================== */
//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const emotionImpact = {
//     happy:
//       "Positive emotional tones in your voice slightly reduced your overall anxiety score.",
//     sad:
//       "Emotional heaviness detected in your voice contributed to increased anxiety indicators.",
//     fear:
//       "Fear-related vocal patterns significantly influenced your anxiety score.",
//     anger:
//       "Tension detected in your voice increased emotional stress indicators.",
//     neutral:
//       "Voice data did not significantly influence the final result.",
//   };

//   const activities = {
//     "Minimal Anxiety": [
//       "Gratitude journaling",
//       "Slow breathing (5 minutes)",
//     ],
//     "Mild Anxiety": [
//       "Guided breathing exercises",
//       "Light stretching or walking",
//     ],
//     "Moderate Anxiety": [
//       "Short guided meditation",
//       "Consistent sleep routine",
//     ],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   /* =======================
//      Dynamic Colors
//   ======================== */
//   const levelColors = {
//     "Minimal Anxiety": "#D1FAE5",
//     "Mild Anxiety": "#FEF3C7",
//     "Moderate Anxiety": "#FFEDD5",
//     "Severe Anxiety": "#FEE2E2",
//   };

//   const levelTextColors = {
//     "Minimal Anxiety": "#065F46",
//     "Mild Anxiety": "#92400E",
//     "Moderate Anxiety": "#9A3412",
//     "Severe Anxiety": "#991B1B",
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       {/* Scores */}
//       <View style={styles.card}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Mode</Text>
//           <Text style={styles.value}>{mode}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Detected Emotion</Text>
//           <Text style={styles.valueSmall}>{emotion}</Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Questionnaire Score</Text>
//           <Text style={styles.value}>
//             {questionnaire_score ?? "N/A"}
//           </Text>
//         </View>

//         <View style={styles.row}>
//           <Text style={styles.label}>Final Predicted Score</Text>
//           <Text style={styles.value}>{final_score}</Text>
//         </View>
//       </View>

//       {/* Anxiety Level */}
//       <View
//         style={[
//           styles.levelCard,
//           { backgroundColor: levelColors[anxiety_level] },
//         ]}
//       >
//         <Text
//           style={[
//             styles.levelText,
//             { color: levelTextColors[anxiety_level] },
//           ]}
//         >
//           {anxiety_level}
//         </Text>
//       </View>

//       {/* Explainable AI */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>
//           How this result was determined
//         </Text>

//         <Text style={styles.text}>
//           {explanations[anxiety_level]}
//         </Text>

//         {usedVoice && (
//           <Text style={styles.text}>
//             🎤 Voice Analysis: {emotionImpact[emotion]}
//           </Text>
//         )}
//       </View>

//       {/* Suggested Activities Preview */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>
//           Suggested Activities
//         </Text>

//         {activities[anxiety_level]?.map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         {/* Continue to Activities */}
//         <TouchableOpacity
//           style={styles.activityBtn}
//           onPress={() =>
//             navigation.navigate("Activities", {
//               anxiety_level,
//             })
//           }
//         >
//           <Text style={styles.activityText}>
//             Continue to Activities
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Back to Voice */}
//       <TouchableOpacity
//         style={styles.homeBtn}
//         onPress={() => navigation.navigate("Voice")}
//       >
//         <Text style={styles.homeText}>
//           ← Back to Voice Check
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// /* =======================
//    STYLES
// ======================= */
// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     backgroundColor: "#F4F7FB",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 16,
//     color: "#1F2937",
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//     elevation: 3,
//   },
//   row: {
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 13,
//     color: "#6B7280",
//   },
//   value: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   valueSmall: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//     textTransform: "capitalize",
//   },
//   levelCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     alignItems: "center",
//   },
//   levelText: {
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#1F2937",
//   },
//   text: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: "#374151",
//     marginBottom: 8,
//   },
//   list: {
//     fontSize: 14,
//     color: "#374151",
//     marginVertical: 3,
//   },
//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   activityText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   homeBtn: {
//     marginTop: 18,
//     backgroundColor: "#9CA3AF",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   homeText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "500",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";

// export default function ResultScreen({ route, navigation }) {
//   const params = route.params || {};

//   /* =========================
//      SAFE VALUE EXTRACTION
//   ========================== */
//   const questionnaire_score = params.questionnaire_score ?? null;
//   const voice_score = params.voice_score ?? null;
//   const final_score = params.final_score ?? null;
//   const anxiety_level = params.anxiety_level ?? "Unknown";
//   const emotion = params.emotion ?? "neutral";

//   /* =========================
//      AUTO MODE DETECTION (FIX)
//   ========================== */
//   let mode = "Unknown";

//   if (voice_score !== null && questionnaire_score !== null) {
//     mode = "Voice + Questionnaire";
//   } else if (voice_score !== null) {
//     mode = "Voice Only";
//   } else if (questionnaire_score !== null) {
//     mode = "Questionnaire Only";
//   }

//   const usedVoice = emotion && emotion !== "neutral";

//   /* =======================
//      Explainable AI Text
//   ======================== */
//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const emotionImpact = {
//     happy:
//       "Positive emotional tones in your voice slightly reduced your overall anxiety score.",
//     sad:
//       "Emotional heaviness detected in your voice contributed to increased anxiety indicators.",
//     fear:
//       "Fear-related vocal patterns significantly influenced your anxiety score.",
//     anger:
//       "Tension detected in your voice increased emotional stress indicators.",
//     neutral:
//       "Voice data did not significantly influence the final result.",
//   };

//   const activities = {
//     "Minimal Anxiety": [
//       "Gratitude journaling",
//       "Slow breathing (5 minutes)",
//     ],
//     "Mild Anxiety": [
//       "Guided breathing exercises",
//       "Light stretching or walking",
//     ],
//     "Moderate Anxiety": [
//       "Short guided meditation",
//       "Consistent sleep routine",
//     ],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   /* =======================
//      Dynamic Colors
//   ======================== */
//   const levelColors = {
//     "Minimal Anxiety": "#D1FAE5",
//     "Mild Anxiety": "#FEF3C7",
//     "Moderate Anxiety": "#FFEDD5",
//     "Severe Anxiety": "#FEE2E2",
//   };

//   const levelTextColors = {
//     "Minimal Anxiety": "#065F46",
//     "Mild Anxiety": "#92400E",
//     "Moderate Anxiety": "#9A3412",
//     "Severe Anxiety": "#991B1B",
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       {/* ================= SCORES ================= */}
//       <View style={styles.card}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Mode</Text>
//           <Text style={styles.value}>{mode}</Text>
//         </View>

//         {/* show emotion only if voice used */}
//         {voice_score !== null && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Detected Emotion</Text>
//             <Text style={styles.valueSmall}>{emotion}</Text>
//           </View>
//         )}

//         {/* Questionnaire score */}
//         {questionnaire_score !== null && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Questionnaire Score</Text>
//             <Text style={styles.value}>{questionnaire_score}</Text>
//           </View>
//         )}

//         {/* Voice score */}
//         {voice_score !== null && (
//           <View style={styles.row}>
//             <Text style={styles.label}>Voice Score</Text>
//             <Text style={styles.value}>{voice_score}</Text>
//           </View>
//         )}

//         {/* Final score */}
//         <View style={styles.row}>
//           <Text style={styles.label}>Final Predicted Score</Text>
//           <Text style={styles.value}>{final_score ?? "N/A"}</Text>
//         </View>
//       </View>

//       {/* ================= ANXIETY LEVEL ================= */}
//       <View
//         style={[
//           styles.levelCard,
//           {
//             backgroundColor:
//               levelColors[anxiety_level] || "#E5E7EB",
//           },
//         ]}
//       >
//         <Text
//           style={[
//             styles.levelText,
//             {
//               color:
//                 levelTextColors[anxiety_level] || "#111827",
//             },
//           ]}
//         >
//           {anxiety_level}
//         </Text>
//       </View>

//       {/* ================= EXPLAINABLE AI ================= */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>
//           How this result was determined
//         </Text>

//         <Text style={styles.text}>
//           {explanations[anxiety_level] ||
//             "Your result was calculated using the available assessment data."}
//         </Text>

//         {usedVoice && voice_score !== null && (
//           <Text style={styles.text}>
//             🎤 Voice Analysis: {emotionImpact[emotion]}
//           </Text>
//         )}
//       </View>

//       {/* ================= ACTIVITIES ================= */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>
//           Suggested Activities
//         </Text>

//         {activities[anxiety_level]?.map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         <TouchableOpacity
//           style={styles.activityBtn}
//           onPress={() =>
//             navigation.navigate("Activities", {
//               anxiety_level,
//             })
//           }
//         >
//           <Text style={styles.activityText}>
//             Continue to Activities
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* ================= DASHBOARD BUTTON (NEW) ================= */}
//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Dashboard")}
//       >
//         <Text style={styles.dashboardText}>
//           Go to Dashboard
//         </Text>
//       </TouchableOpacity>

//       {/* ================= BACK TO VOICE ================= */}
//       <TouchableOpacity
//         style={styles.homeBtn}
//         onPress={() => navigation.navigate("Voice")}
//       >
//         <Text style={styles.homeText}>
//           ← Back to Voice Check
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// /* ======================= STYLES ======================= */
// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     backgroundColor: "#F4F7FB",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 16,
//     color: "#1F2937",
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//     elevation: 3,
//   },
//   row: {
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 13,
//     color: "#6B7280",
//   },
//   value: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   valueSmall: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//     textTransform: "capitalize",
//   },
//   levelCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     alignItems: "center",
//   },
//   levelText: {
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#1F2937",
//   },
//   text: {
//     fontSize: 14,
//     lineHeight: 21,
//     color: "#374151",
//     marginBottom: 8,
//   },
//   list: {
//     fontSize: 14,
//     color: "#374151",
//     marginVertical: 3,
//   },
//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   activityText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   dashboardBtn: {
//     marginTop: 10,
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   dashboardText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   homeBtn: {
//     marginTop: 12,
//     backgroundColor: "#9CA3AF",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },
//   homeText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "500",
//   },
// });

// import React, { useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function ResultScreen({ route, navigation }) {
//   const params = route.params || {};

//   const questionnaire_score = params.questionnaire_score ?? null;
//   const voice_score = params.voice_score ?? null;
//   const final_score = params.final_score ?? null;
//   const anxiety_level = params.anxiety_level ?? "Unknown";
//   const emotion = params.emotion ?? "neutral";

//   /* SAVE ANXIETY LEVEL FOR DASHBOARD */
//   useEffect(() => {
//     const saveLevel = async () => {
//       try {
//         await AsyncStorage.setItem("anxietyLevel", anxiety_level);
//       } catch (error) {
//         console.log("Error saving anxiety level:", error);
//       }
//     };

//     if (anxiety_level) {
//       saveLevel();
//     }
//   }, [anxiety_level]);

//   /* MODE DETECTION */
//   let mode = "Unknown";

//   if (voice_score !== null && questionnaire_score !== null) {
//     mode = "Voice + Questionnaire";
//   } else if (voice_score !== null) {
//     mode = "Voice Only";
//   } else if (questionnaire_score !== null) {
//     mode = "Questionnaire Only";
//   }

//   const usedVoice = emotion && emotion !== "neutral";

//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const activities = {
//     "Minimal Anxiety": [
//       "Gratitude journaling",
//       "Slow breathing (5 minutes)",
//     ],
//     "Mild Anxiety": [
//       "Guided breathing exercises",
//       "Light stretching or walking",
//     ],
//     "Moderate Anxiety": [
//       "Short guided meditation",
//       "Consistent sleep routine",
//     ],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   const levelColors = {
//     "Minimal Anxiety": "#D1FAE5",
//     "Mild Anxiety": "#FEF3C7",
//     "Moderate Anxiety": "#FFEDD5",
//     "Severe Anxiety": "#FEE2E2",
//   };

//   const levelTextColors = {
//     "Minimal Anxiety": "#065F46",
//     "Mild Anxiety": "#92400E",
//     "Moderate Anxiety": "#9A3412",
//     "Severe Anxiety": "#991B1B",
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       {/* SCORES */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Mode</Text>
//         <Text style={styles.value}>{mode}</Text>

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Detected Emotion</Text>
//             <Text style={styles.valueSmall}>{emotion}</Text>
//           </>
//         )}

//         {questionnaire_score !== null && (
//           <>
//             <Text style={styles.label}>Questionnaire Score</Text>
//             <Text style={styles.value}>{questionnaire_score}</Text>
//           </>
//         )}

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Voice Score</Text>
//             <Text style={styles.value}>{voice_score}</Text>
//           </>
//         )}

//         <Text style={styles.label}>Final Predicted Score</Text>
//         <Text style={styles.value}>{final_score ?? "N/A"}</Text>
//       </View>

//       {/* ANXIETY LEVEL */}
//       <View
//         style={[
//           styles.levelCard,
//           { backgroundColor: levelColors[anxiety_level] || "#E5E7EB" },
//         ]}
//       >
//         <Text
//           style={[
//             styles.levelText,
//             { color: levelTextColors[anxiety_level] || "#111827" },
//           ]}
//         >
//           {anxiety_level}
//         </Text>
//       </View>

//       {/* EXPLANATION */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Explanation</Text>

//         <Text style={styles.text}>
//           {explanations[anxiety_level] ||
//             "Your result was calculated using the available assessment data."}
//         </Text>
//       </View>

//       {/* ACTIVITIES */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Suggested Activities</Text>

//         {activities[anxiety_level]?.map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         <TouchableOpacity
//           style={styles.activityBtn}
//           onPress={() =>
//             navigation.navigate("Activities", {
//               anxiety_level,
//             })
//           }
//         >
//           <Text style={styles.activityText}>Continue to Activities</Text>
//         </TouchableOpacity>
//       </View>

//       {/* DASHBOARD BUTTON */}
//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Dashboard")}
//       >
//         <Text style={styles.dashboardText}>Go to Dashboard</Text>
//       </TouchableOpacity>

//       {/* BACK BUTTON */}
//       <TouchableOpacity
//         style={styles.homeBtn}
//         onPress={() => navigation.navigate("Voice")}
//       >
//         <Text style={styles.homeText}>← Back to Voice Check</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     backgroundColor: "#F4F7FB",
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 16,
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//   },

//   label: {
//     fontSize: 13,
//     color: "#6B7280",
//   },

//   value: {
//     fontSize: 20,
//     fontWeight: "700",
//   },

//   valueSmall: {
//     fontSize: 16,
//     fontWeight: "600",
//     textTransform: "capitalize",
//   },

//   levelCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     alignItems: "center",
//   },

//   levelText: {
//     fontSize: 20,
//     fontWeight: "700",
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//   },

//   text: {
//     fontSize: 14,
//     lineHeight: 21,
//     marginBottom: 8,
//   },

//   list: {
//     fontSize: 14,
//     marginVertical: 3,
//   },

//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   activityText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     marginTop: 10,
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   dashboardText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },

//   homeBtn: {
//     marginTop: 12,
//     backgroundColor: "#9CA3AF",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   homeText: {
//     color: "#FFFFFF",
//   },
// });

// import React, { useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function ResultScreen({ route, navigation }) {
//   const params = route.params || {};

//   const questionnaire_score = params.questionnaire_score ?? null;
//   const voice_score = params.voice_score ?? null;
//   const final_score = params.final_score ?? null;
//   const anxiety_level = params.anxiety_level ?? "Unknown";
//   const emotion = params.emotion ?? "neutral";

//   /* SAVE ANXIETY LEVEL FOR DASHBOARD */
//   useEffect(() => {
//     const saveLevel = async () => {
//       try {
//         await AsyncStorage.setItem("anxietyLevel", anxiety_level);
//       } catch (error) {
//         console.log("Error saving anxiety level:", error);
//       }
//     };

//     if (anxiety_level) {
//       saveLevel();
//     }
//   }, [anxiety_level]);

//   /* MODE DETECTION */
//   let mode = "Unknown";

//   if (voice_score !== null && questionnaire_score !== null) {
//     mode = "Voice + Questionnaire";
//   } else if (voice_score !== null) {
//     mode = "Voice Only";
//   } else if (questionnaire_score !== null) {
//     mode = "Questionnaire Only";
//   }

//   const usedVoice = emotion && emotion !== "neutral";

//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const activities = {
//     "Minimal Anxiety": [
//       "Gratitude journaling",
//       "Slow breathing (5 minutes)",
//     ],
//     "Mild Anxiety": [
//       "Guided breathing exercises",
//       "Light stretching or walking",
//     ],
//     "Moderate Anxiety": [
//       "Short guided meditation",
//       "Consistent sleep routine",
//     ],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   const levelColors = {
//     "Minimal Anxiety": "#D1FAE5",
//     "Mild Anxiety": "#FEF3C7",
//     "Moderate Anxiety": "#FFEDD5",
//     "Severe Anxiety": "#FEE2E2",
//   };

//   const levelTextColors = {
//     "Minimal Anxiety": "#065F46",
//     "Mild Anxiety": "#92400E",
//     "Moderate Anxiety": "#9A3412",
//     "Severe Anxiety": "#991B1B",
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       {/* SCORES */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Mode</Text>
//         <Text style={styles.value}>{mode}</Text>

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Detected Emotion</Text>
//             <Text style={styles.valueSmall}>{emotion}</Text>
//           </>
//         )}

//         {questionnaire_score !== null && (
//           <>
//             <Text style={styles.label}>Questionnaire Score</Text>
//             <Text style={styles.value}>{questionnaire_score}</Text>
//           </>
//         )}

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Voice Score</Text>
//             <Text style={styles.value}>{voice_score}</Text>
//           </>
//         )}

//         <Text style={styles.label}>Final Predicted Score</Text>
//         <Text style={styles.value}>{final_score ?? "N/A"}</Text>
//       </View>

//       {/* ANXIETY LEVEL */}
//       <View
//         style={[
//           styles.levelCard,
//           { backgroundColor: levelColors[anxiety_level] || "#E5E7EB" },
//         ]}
//       >
//         <Text
//           style={[
//             styles.levelText,
//             { color: levelTextColors[anxiety_level] || "#111827" },
//           ]}
//         >
//           {anxiety_level}
//         </Text>
//       </View>

//       {/* EXPLANATION */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Explanation</Text>

//         <Text style={styles.text}>
//           {explanations[anxiety_level] ||
//             "Your result was calculated using the available assessment data."}
//         </Text>
//       </View>

//       {/* ACTIVITIES */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Suggested Activities</Text>

//         {activities[anxiety_level]?.map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         <TouchableOpacity
//           style={styles.activityBtn}
//           onPress={() =>
//             navigation.navigate("Activities", {
//               anxiety_level,
//             })
//           }
//         >
//           <Text style={styles.activityText}>Continue to Activities</Text>
//         </TouchableOpacity>
//       </View>

//       {/* DASHBOARD BUTTON */}
//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Dashboard")}
//       >
//         <Text style={styles.dashboardText}>Go to Dashboard</Text>
//       </TouchableOpacity>

//       {/* BACK BUTTON */}
//       <TouchableOpacity
//         style={styles.homeBtn}
//         onPress={() => navigation.navigate("Voice")}
//       >
//         <Text style={styles.homeText}>← Back to Voice Check</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     backgroundColor: "#F4F7FB",
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 16,
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//   },

//   label: {
//     fontSize: 13,
//     color: "#6B7280",
//   },

//   value: {
//     fontSize: 20,
//     fontWeight: "700",
//   },

//   valueSmall: {
//     fontSize: 16,
//     fontWeight: "600",
//     textTransform: "capitalize",
//   },

//   levelCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     alignItems: "center",
//   },

//   levelText: {
//     fontSize: 20,
//     fontWeight: "700",
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//   },

//   text: {
//     fontSize: 14,
//     lineHeight: 21,
//     marginBottom: 8,
//   },

//   list: {
//     fontSize: 14,
//     marginVertical: 3,
//   },

//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   activityText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     marginTop: 10,
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   dashboardText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },

//   homeBtn: {
//     marginTop: 12,
//     backgroundColor: "#9CA3AF",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   homeText: {
//     color: "#FFFFFF",
//   },
// });

// import React, { useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function ResultScreen({ route, navigation }) {
//   const params = route.params || {};

//   const questionnaire_score = params.questionnaire_score ?? null;
//   const voice_score = params.voice_score ?? null;
//   const final_score = params.final_score ?? null;
//   const anxiety_level = params.anxiety_level ?? "Unknown";
//   const emotion = params.emotion ?? "neutral";

//   /* SAVE ANXIETY LEVEL + HISTORY */
//   useEffect(() => {
//     const saveData = async () => {
//       try {
//         const today = new Date().toISOString().split("T")[0];

//         // save latest level
//         await AsyncStorage.setItem("anxietyLevel", anxiety_level);

//         // save history
//         const existing = await AsyncStorage.getItem("anxietyHistory");
//         const history = existing ? JSON.parse(existing) : [];

//         const newRecord = {
//           level: anxiety_level,
//           date: today,
//           score: final_score,
//         };

//         history.push(newRecord);

//         await AsyncStorage.setItem("anxietyHistory", JSON.stringify(history));
//       } catch (error) {
//         console.log("Error saving anxiety history:", error);
//       }
//     };

//     if (anxiety_level) saveData();
//   }, [anxiety_level]);

//   /* MODE DETECTION */
//   let mode = "Unknown";

//   if (voice_score !== null && questionnaire_score !== null)
//     mode = "Voice + Questionnaire";
//   else if (voice_score !== null) mode = "Voice Only";
//   else if (questionnaire_score !== null) mode = "Questionnaire Only";

//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const activities = {
//     "Minimal Anxiety": [
//       "Gratitude journaling",
//       "Slow breathing (5 minutes)",
//     ],
//     "Mild Anxiety": [
//       "Guided breathing exercises",
//       "Light stretching or walking",
//     ],
//     "Moderate Anxiety": [
//       "Short guided meditation",
//       "Consistent sleep routine",
//     ],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>Mode</Text>
//         <Text style={styles.value}>{mode}</Text>

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Detected Emotion</Text>
//             <Text style={styles.valueSmall}>{emotion}</Text>
//           </>
//         )}

//         {questionnaire_score !== null && (
//           <>
//             <Text style={styles.label}>Questionnaire Score</Text>
//             <Text style={styles.value}>{questionnaire_score}</Text>
//           </>
//         )}

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Voice Score</Text>
//             <Text style={styles.value}>{voice_score}</Text>
//           </>
//         )}

//         <Text style={styles.label}>Final Predicted Score</Text>
//         <Text style={styles.value}>{final_score ?? "N/A"}</Text>
//       </View>

//       <View style={styles.levelCard}>
//         <Text style={styles.levelText}>{anxiety_level}</Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Explanation</Text>
//         <Text style={styles.text}>
//           {explanations[anxiety_level] ||
//             "Your result was calculated using the available assessment data."}
//         </Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Suggested Activities</Text>

//         {activities[anxiety_level]?.map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         <TouchableOpacity
//           style={styles.activityBtn}
//           onPress={() =>
//             navigation.navigate("Activities", {
//               anxiety_level,
//             })
//           }
//         >
//           <Text style={styles.activityText}>Continue to Activities</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Dashboard")}
//       >
//         <Text style={styles.dashboardText}>Go to Dashboard</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 22, backgroundColor: "#F4F7FB" },

//   title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//   },

//   label: { fontSize: 13, color: "#6B7280" },

//   value: { fontSize: 20, fontWeight: "700" },

//   valueSmall: { fontSize: 16, fontWeight: "600" },

//   levelCard: {
//     backgroundColor: "#E0E7FF",
//     borderRadius: 16,
//     padding: 16,
//     alignItems: "center",
//     marginBottom: 14,
//   },

//   levelText: { fontSize: 20, fontWeight: "700" },

//   sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

//   text: { fontSize: 14, lineHeight: 21 },

//   list: { fontSize: 14, marginVertical: 3 },

//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   activityText: { color: "#fff", fontWeight: "600" },

//   dashboardBtn: {
//     marginTop: 10,
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   dashboardText: { color: "#fff", fontWeight: "600" },
// });

// import React, { useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function ResultScreen({ route, navigation }) {
//   const params = route.params || {};

//   const questionnaire_score = params.questionnaire_score ?? null;
//   const voice_score = params.voice_score ?? null;
//   const final_score = params.final_score ?? null;
//   const anxiety_level = params.anxiety_level ?? "Unknown";
//   const emotion = params.emotion ?? "neutral";

//   useEffect(() => {
//     const saveData = async () => {
//       try {
//         const today = new Date().toISOString().split("T")[0];

//         await AsyncStorage.setItem("anxietyLevel", anxiety_level);

//         const existing = await AsyncStorage.getItem("anxietyHistory");
//         const history = existing ? JSON.parse(existing) : [];

//         const newRecord = {
//           level: anxiety_level,
//           date: today,
//           score: final_score,
//         };

//         history.push(newRecord);

//         await AsyncStorage.setItem("anxietyHistory", JSON.stringify(history));
//       } catch (error) {
//         console.log("Error saving anxiety history:", error);
//       }
//     };

//     if (anxiety_level) saveData();
//   }, [anxiety_level]);

//   let mode = "Unknown";

//   if (voice_score !== null && questionnaire_score !== null)
//     mode = "Voice + Questionnaire";
//   else if (voice_score !== null) mode = "Voice Only";
//   else if (questionnaire_score !== null) mode = "Questionnaire Only";

//   const explanations = {
//     "Minimal Anxiety":
//       "Your responses suggest good emotional balance. You are managing everyday stress well.",
//     "Mild Anxiety":
//       "Your responses indicate mild anxiety, often linked to routine emotional or physical changes.",
//     "Moderate Anxiety":
//       "Your answers show noticeable anxiety that may affect focus, rest, or emotional comfort.",
//     "Severe Anxiety":
//       "Your responses suggest high anxiety levels. Professional emotional support may be helpful.",
//   };

//   const activities = {
//     "Minimal Anxiety": ["Gratitude journaling", "Slow breathing (5 minutes)"],
//     "Mild Anxiety": ["Guided breathing exercises", "Light stretching or walking"],
//     "Moderate Anxiety": ["Short guided meditation", "Consistent sleep routine"],
//     "Severe Anxiety": [
//       "Speak with a mental health professional",
//       "Grounding exercises (5-4-3-2-1)",
//     ],
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Your Anxiety Assessment</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>Mode</Text>
//         <Text style={styles.value}>{mode}</Text>

//         {voice_score !== null && (
//           <>
//             <Text style={styles.label}>Detected Emotion</Text>
//             <Text style={styles.valueSmall}>{emotion}</Text>
//           </>
//         )}

//         <Text style={styles.label}>Final Predicted Score</Text>
//         <Text style={styles.value}>{final_score ?? "N/A"}</Text>
//       </View>

//       <View style={styles.levelCard}>
//         <Text style={styles.levelText}>{anxiety_level}</Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Explanation</Text>
//         <Text style={styles.text}>
//           {explanations[anxiety_level] ||
//             "Your result was calculated using the available assessment data."}
//         </Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Suggested Activities</Text>

//         {activities[anxiety_level]?.map((item, index) => (
//           <Text key={index} style={styles.list}>
//             • {item}
//           </Text>
//         ))}

//         <TouchableOpacity
//           style={styles.activityBtn}
//           onPress={() =>
//             navigation.navigate("Activities", { anxiety_level })
//           }
//         >
//           <Text style={styles.activityText}>Continue to Activities</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Dashboard")}
//       >
//         <Text style={styles.dashboardText}>Go to Dashboard</Text>
//       </TouchableOpacity>

//       {/* NEW BUTTON → VOICE SCREEN */}
//       <TouchableOpacity
//         style={styles.voiceBtn}
//         onPress={() => navigation.navigate("Voice")}
//       >
//         <Text style={styles.voiceText}>Back to Voice Screen</Text>
//       </TouchableOpacity>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 22, backgroundColor: "#F4F7FB" },

//   title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//   },

//   label: { fontSize: 13, color: "#6B7280" },

//   value: { fontSize: 20, fontWeight: "700" },

//   valueSmall: { fontSize: 16, fontWeight: "600" },

//   levelCard: {
//     backgroundColor: "#E0E7FF",
//     borderRadius: 16,
//     padding: 16,
//     alignItems: "center",
//     marginBottom: 14,
//   },

//   levelText: { fontSize: 20, fontWeight: "700" },

//   sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

//   text: { fontSize: 14, lineHeight: 21 },

//   list: { fontSize: 14, marginVertical: 3 },

//   activityBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   activityText: { color: "#fff", fontWeight: "600" },

//   dashboardBtn: {
//     marginTop: 10,
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   dashboardText: { color: "#fff", fontWeight: "600" },

//   voiceBtn: {
//     marginTop: 10,
//     backgroundColor: "#6B7280",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   voiceText: { color: "#fff", fontWeight: "600" },
// });


import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ResultScreen({ route, navigation }) {
  const params = route.params || {};

  const questionnaire_score = params.questionnaire_score ?? null;
  const voice_score = params.voice_score ?? null;
  const final_score = params.final_score ?? null;
  const anxiety_level = params.anxiety_level ?? "Unknown";
  const emotion = params.emotion ?? "neutral";

  useEffect(() => {
    const saveData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        await AsyncStorage.setItem("anxietyLevel", anxiety_level);

        const existing = await AsyncStorage.getItem("anxietyHistory");
        const history = existing ? JSON.parse(existing) : [];

        const newRecord = {
          level: anxiety_level,
          date: today,
          score: final_score,
        };

        history.push(newRecord);

        await AsyncStorage.setItem("anxietyHistory", JSON.stringify(history));
      } catch (error) {
        console.log("Error saving anxiety history:", error);
      }
    };

    if (anxiety_level) saveData();
  }, [anxiety_level]);

  let mode = "Unknown";

  if (voice_score !== null && questionnaire_score !== null)
    mode = "Voice + Questionnaire";
  else if (voice_score !== null) mode = "Voice Only";
  else if (questionnaire_score !== null) mode = "Questionnaire Only";

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

  const activities = {
    "Minimal Anxiety": ["Gratitude journaling", "Slow breathing (5 minutes)"],
    "Mild Anxiety": ["Guided breathing exercises", "Light stretching or walking"],
    "Moderate Anxiety": ["Short guided meditation", "Consistent sleep routine"],
    "Severe Anxiety": [
      "Speak with a mental health professional",
      "Grounding exercises (5-4-3-2-1)",
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Anxiety Assessment</Text>

      {/* Score Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Assessment Mode</Text>
        <Text style={styles.value}>{mode}</Text>

        {voice_score !== null && (
          <>
            <Text style={styles.label}>Detected Emotion</Text>
            <Text style={styles.valueSmall}>{emotion}</Text>
          </>
        )}

        <Text style={styles.label}>Final Anxiety Score</Text>
        <Text style={styles.value}>{final_score ?? "N/A"}</Text>
      </View>

      {/* Anxiety Level Highlight */}
      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>Predicted Anxiety Level</Text>
        <Text style={styles.levelText}>{anxiety_level}</Text>
      </View>

      {/* Explanation */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Explanation</Text>

        <Text style={styles.text}>
          {explanations[anxiety_level] ||
            "Your result was calculated using the available assessment data."}
        </Text>
      </View>

      {/* Activities */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Suggested Activities</Text>

        {activities[anxiety_level]?.map((item, index) => (
          <Text key={index} style={styles.list}>
            • {item}
          </Text>
        ))}

        <TouchableOpacity
          style={styles.activityBtn}
          onPress={() =>
            navigation.navigate("Activities", { anxiety_level })
          }
        >
          <Text style={styles.activityText}>Start Activities</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Button */}
      <TouchableOpacity
        style={styles.dashboardBtn}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.dashboardText}>Go to Dashboard</Text>
      </TouchableOpacity>

      {/* Voice Button */}
      <TouchableOpacity
        style={styles.voiceBtn}
        onPress={() => navigation.navigate("Voice")}
      >
        <Text style={styles.voiceText}>Back to Voice Screen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    backgroundColor: "#F9F6FB",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
    color: "#3F3F46",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
  },

  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },

  valueSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },

  levelCard: {
    backgroundColor: "#F2E7F9",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E4C6F2",
  },

  levelLabel: {
    fontSize: 13,
    color: "#6B7280",
  },

  levelText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7B2CBF",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },

  text: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
  },

  list: {
    fontSize: 14,
    marginVertical: 3,
    color: "#374151",
  },

  activityBtn: {
    marginTop: 14,
    backgroundColor: "#e339e9",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  activityText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  dashboardBtn: {
    marginTop: 10,
    backgroundColor: "#9333EA",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  dashboardText: {
    color: "#fff",
    fontWeight: "600",
  },

  voiceBtn: {
    marginTop: 10,
    backgroundColor: "#6B7280",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  voiceText: {
    color: "#fff",
    fontWeight: "600",
  },
});