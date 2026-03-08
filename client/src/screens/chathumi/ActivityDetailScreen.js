// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// export default function ActivityDetailScreen({ route, navigation }) {
//   const { activity } = route.params || {};

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{activity?.title}</Text>

//       <Text style={styles.desc}>
//         This activity will help you relax and manage anxiety.
//       </Text>

//       <TouchableOpacity
//         style={styles.startBtn}
//         onPress={() => alert("Activity Started")}
//       >
//         <Text style={styles.startText}>Start Activity</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: "#F4F7FB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//   },
//   desc: {
//     fontSize: 15,
//     color: "#374151",
//     marginBottom: 20,
//   },
//   startBtn: {
//     backgroundColor: "#22C55E",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   startText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// import React, { useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// export default function ActivityDetailScreen({ route, navigation }) {
//   const { activity } = route.params || {};
//   const [started, setStarted] = useState(false);

//   const startActivity = () => setStarted(true);

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.backText}>← Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>{activity?.title}</Text>

//       <Text style={styles.desc}>
//         {activity?.description}
//       </Text>

//       {!started ? (
//         <TouchableOpacity style={styles.startBtn} onPress={startActivity}>
//           <Text style={styles.startText}>Start Activity</Text>
//         </TouchableOpacity>
//       ) : (
//         <View style={styles.timerContainer}>
//           <Text style={styles.timerText}>⏱ Timer running... {activity.duration}</Text>
//           <TouchableOpacity
//             style={styles.finishBtn}
//             onPress={() => alert("Activity Completed!")}
//           >
//             <Text style={styles.finishText}>Finish Activity</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: "#f4f6fb",
//   },
//   backText: {
//     color: "#1e3a8a",
//     marginBottom: 20,
//     fontWeight: "600",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#1e40af",
//   },
//   desc: {
//     fontSize: 16,
//     color: "#374151",
//     marginBottom: 20,
//   },
//   startBtn: {
//     backgroundColor: "#22C55E",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   startText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   timerContainer: {
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: "#dbeafe",
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   timerText: {
//     fontSize: 18,
//     marginBottom: 12,
//     fontWeight: "600",
//     color: "#1e3a8a",
//   },
//   finishBtn: {
//     backgroundColor: "#f59e0b",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },
//   finishText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function ActivityDetailScreen({ route, navigation }) {
//   const { activity } = route.params || {};
//   const [started, setStarted] = useState(false);
//   const [completed, setCompleted] = useState(false);
//   const [seconds, setSeconds] = useState(0);
//   const [journalText, setJournalText] = useState("");

//   useEffect(() => {
//     let timer;
//     if (started && seconds > 0) {
//       timer = setInterval(() => setSeconds((s) => s - 1), 1000);
//     }
//     return () => clearInterval(timer);
//   }, [started, seconds]);

//   // Helper: Save completed activity
//   const saveProgress = async () => {
//     try {
//       const today = new Date().toISOString().split("T")[0];
//       const stored = await AsyncStorage.getItem("completed_activities");
//       const completedList = stored ? JSON.parse(stored) : [];
//       completedList.push({
//         id: activity.id,
//         title: activity.title,
//         type: activity.type,
//         date: today,
//         journal: activity.type === "journal" ? journalText : null,
//       });
//       await AsyncStorage.setItem("completed_activities", JSON.stringify(completedList));
//       setCompleted(true);
//       Alert.alert("Success", "Activity saved to your progress!");
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save progress.");
//     }
//   };

//   // Start activity
//   const startActivity = () => {
//     setStarted(true);
//     if (activity.type === "breathing" || activity.type === "meditation") {
//       const dur = parseInt(activity.duration) || 5; // minutes
//       setSeconds(dur * 60);
//     }
//   };

//   // Render activity content by type
//   const renderContent = () => {
//     switch (activity.type) {
//       case "journal":
//         return (
//           <View>
//             <Text style={styles.desc}>{activity.description}</Text>
//             <TextInput
//               style={styles.textInput}
//               placeholder="Write your notes here..."
//               multiline
//               value={journalText}
//               onChangeText={setJournalText}
//             />
//             <TouchableOpacity style={styles.finishBtn} onPress={saveProgress}>
//               <Text style={styles.finishText}>Save Journal</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       case "breathing":
//       case "meditation":
//         return (
//           <View>
//             {!started ? (
//               <TouchableOpacity style={styles.startBtn} onPress={startActivity}>
//                 <Text style={styles.startText}>Start {activity.type}</Text>
//               </TouchableOpacity>
//             ) : seconds > 0 ? (
//               <Text style={styles.timerText}>⏱ {seconds} sec remaining</Text>
//             ) : (
//               <TouchableOpacity style={styles.finishBtn} onPress={saveProgress}>
//                 <Text style={styles.finishText}>Finish {activity.type}</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         );
//       case "stretch":
//       case "grounding":
//         return (
//           <View>
//             <Text style={styles.desc}>{activity.description}</Text>
//             <TouchableOpacity style={styles.finishBtn} onPress={saveProgress}>
//               <Text style={styles.finishText}>Mark as Done</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       case "support":
//         return (
//           <View>
//             <Text style={styles.desc}>{activity.description}</Text>
//             <TouchableOpacity style={styles.finishBtn} onPress={() => Alert.alert("Contact Support")}>
//               <Text style={styles.finishText}>Contact Support</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       default:
//         return <Text style={styles.desc}>Activity instructions not found.</Text>;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.backText}>← Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>{activity.title}</Text>
//       {renderContent()}
//       {completed && <Text style={styles.completedText}>✅ Completed</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 24, backgroundColor: "#F4F7FB" },
//   backText: { color: "#1e3a8a", marginBottom: 16, fontWeight: "600" },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#1e40af" },
//   desc: { fontSize: 16, color: "#374151", marginBottom: 16 },
//   startBtn: { backgroundColor: "#22C55E", padding: 16, borderRadius: 12, alignItems: "center" },
//   startText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   finishBtn: { backgroundColor: "#f59e0b", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 12 },
//   finishText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   timerText: { fontSize: 18, fontWeight: "600", marginVertical: 20, textAlign: "center" },
//   textInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: "top", marginBottom: 12 },
//   completedText: { color: "#16a34a", fontWeight: "700", marginTop: 16, fontSize: 16 },
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Animated,
//   Easing,
//   ScrollView,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Helper to save completed activity
// const saveActivity = async (activity) => {
//   try {
//     const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
//     const record = {
//       id: activity.id,
//       title: activity.title,
//       type: activity.type,
//       date: today,
//       completed: true,
//     };

//     const existing = await AsyncStorage.getItem("completedActivities");
//     const activities = existing ? JSON.parse(existing) : [];
//     activities.push(record);
//     await AsyncStorage.setItem("completedActivities", JSON.stringify(activities));
//   } catch (err) {
//     console.log("Error saving activity:", err);
//   }
// };

// export default function ActivityDetailScreen({ route, navigation }) {
//   const { activity } = route.params || {};
//   const [started, setStarted] = useState(false);
//   const [stepIndex, setStepIndex] = useState(0);
//   const [journalText, setJournalText] = useState("");
//   const [timer, setTimer] = useState(0);

//   // For breathing circle animation
//   const circleAnim = new Animated.Value(0);

//   const startActivity = () => {
//     setStarted(true);
//     if (activity.type === "breathing") startBreathing();
//     if (activity.type === "meditation") startMeditation();
//     if (activity.type === "walk") startWalk();
//   };

//   // ---------------- BREATHING ----------------
//   const breathingSteps = ["Inhale", "Hold", "Exhale", "Hold"];
//   const startBreathing = () => {
//     setStepIndex(0);
//     setTimer(parseInt(activity.duration) * 60); // convert min to seconds

//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(circleAnim, {
//           toValue: 1,
//           duration: 4000,
//           useNativeDriver: false,
//           easing: Easing.inOut(Easing.ease),
//         }),
//         Animated.timing(circleAnim, {
//           toValue: 0,
//           duration: 4000,
//           useNativeDriver: false,
//           easing: Easing.inOut(Easing.ease),
//         }),
//       ])
//     ).start();

//     const stepInterval = setInterval(() => {
//       setStepIndex((prev) => (prev + 1) % breathingSteps.length);
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(stepInterval);
//           Alert.alert("Activity Completed!");
//           saveActivity(activity);
//           navigation.goBack();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 4000); // each step 4 sec
//   };

//   // ---------------- MEDITATION ----------------
//   const meditationPrompts = [
//     "Focus on your breath.",
//     "Notice the sensations in your body.",
//     "If your mind wanders, gently return to breathing.",
//     "Feel your shoulders relax.",
//     "Observe your thoughts without judgment.",
//   ];
//   const startMeditation = () => {
//     setStepIndex(0);
//     setTimer(parseInt(activity.duration) * 60);
//     const meditationInterval = setInterval(() => {
//       setStepIndex((prev) => {
//         if (prev >= meditationPrompts.length - 1) return 0;
//         return prev + 1;
//       });
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(meditationInterval);
//           Alert.alert("Meditation Completed!");
//           saveActivity(activity);
//           navigation.goBack();
//           return 0;
//         }
//         return prev - 10; // show prompt every 10 seconds
//       });
//     }, 10000);
//   };

//   // ---------------- WALK / GROUNDING ----------------
//   const walkPrompts = [
//     "Take a deep breath.",
//     "Notice your surroundings.",
//     "Feel your steps grounding you.",
//     "Relax your shoulders.",
//     "Observe your emotions.",
//   ];
//   const startWalk = () => {
//     setStepIndex(0);
//     setTimer(parseInt(activity.duration) * 60);
//     const walkInterval = setInterval(() => {
//       setStepIndex((prev) => {
//         if (prev >= walkPrompts.length - 1) return 0;
//         return prev + 1;
//       });
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(walkInterval);
//           Alert.alert("Walk / Grounding Completed!");
//           saveActivity(activity);
//           navigation.goBack();
//           return 0;
//         }
//         return prev - 10;
//       });
//     }, 10000);
//   };

//   const finishJournal = () => {
//     if (!journalText.trim()) {
//       Alert.alert("Please write something before finishing.");
//       return;
//     }
//     saveActivity(activity);
//     Alert.alert("Journal saved!");
//     navigation.goBack();
//   };

//   // Circle size for breathing animation
//   const circleSize = circleAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [100, 200],
//   });

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.backText}>← Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>{activity?.title}</Text>
//       <Text style={styles.desc}>{activity?.description}</Text>

//       {!started ? (
//         <TouchableOpacity style={styles.startBtn} onPress={startActivity}>
//           <Text style={styles.startText}>Start Activity</Text>
//         </TouchableOpacity>
//       ) : activity.type === "journal" ? (
//         <View style={{ marginTop: 20 }}>
//           <TextInput
//             style={styles.journalInput}
//             placeholder="Write your thoughts here..."
//             multiline
//             value={journalText}
//             onChangeText={setJournalText}
//           />
//           <TouchableOpacity style={styles.finishBtn} onPress={finishJournal}>
//             <Text style={styles.finishText}>Finish Journal</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.activityContainer}>
//           {activity.type === "breathing" && (
//             <Animated.View
//               style={[styles.breathCircle, { width: circleSize, height: circleSize }]}
//             />
//           )}
//           <Text style={styles.stepText}>
//             {activity.type === "breathing"
//               ? breathingSteps[stepIndex]
//               : activity.type === "meditation"
//               ? meditationPrompts[stepIndex]
//               : walkPrompts[stepIndex]}
//           </Text>
//           <Text style={styles.timerText}>⏱ {Math.floor(timer / 60)}:{timer % 60}</Text>
//           <TouchableOpacity
//             style={styles.finishBtn}
//             onPress={() => {
//               Alert.alert("Activity Completed!");
//               saveActivity(activity);
//               navigation.goBack();
//             }}
//           >
//             <Text style={styles.finishText}>Finish Activity</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#f4f6fb",
//   },
//   backText: {
//     color: "#1e3a8a",
//     marginBottom: 20,
//     fontWeight: "600",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#1e40af",
//   },
//   desc: {
//     fontSize: 16,
//     color: "#374151",
//     marginBottom: 20,
//   },
//   startBtn: {
//     backgroundColor: "#22C55E",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   startText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   activityContainer: {
//     marginTop: 20,
//     alignItems: "center",
//   },
//   stepText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1e3a8a",
//     marginVertical: 20,
//     textAlign: "center",
//   },
//   timerText: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 20,
//   },
//   finishBtn: {
//     backgroundColor: "#f59e0b",
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 12,
//   },
//   finishText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   journalInput: {
//     height: 150,
//     borderColor: "#d1d5db",
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 12,
//     backgroundColor: "#fff",
//     textAlignVertical: "top",
//     fontSize: 16,
//     marginBottom: 12,
//   },
//   breathCircle: {
//     borderRadius: 100,
//     backgroundColor: "#22C55E",
//     marginBottom: 20,
//   },
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Animated,
//   Easing,
//   ScrollView,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Helper to save completed activity
// const saveActivity = async (activity) => {
//   try {
//     const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
//     const record = {
//       id: activity.id,
//       title: activity.title,
//       type: activity.type,
//       date: today,
//       completed: true,
//     };

//     const existing = await AsyncStorage.getItem("completedActivities");
//     const activities = existing ? JSON.parse(existing) : [];
//     activities.push(record);
//     await AsyncStorage.setItem("completedActivities", JSON.stringify(activities));
//   } catch (err) {
//     console.log("Error saving activity:", err);
//   }
// };

// export default function ActivityDetailScreen({ route, navigation }) {
//   const { activity } = route.params || {};
//   const [started, setStarted] = useState(false);
//   const [stepIndex, setStepIndex] = useState(0);
//   const [journalText, setJournalText] = useState("");
//   const [timer, setTimer] = useState(0);

//   // Breathing animation
//   const circleAnim = new Animated.Value(0);

//   const startActivity = () => {
//     setStarted(true);
//     if (activity.type === "breathing") startBreathing();
//     if (activity.type === "meditation") startMeditation();
//     if (activity.type === "walk") startWalk();
//   };

//   // ---------------- BREATHING ----------------
//   const breathingSteps = ["Inhale", "Hold", "Exhale", "Hold"];
//   const startBreathing = () => {
//     setStepIndex(0);
//     setTimer(parseInt(activity.duration) * 60);

//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(circleAnim, {
//           toValue: 1,
//           duration: 4000,
//           useNativeDriver: false,
//           easing: Easing.inOut(Easing.ease),
//         }),
//         Animated.timing(circleAnim, {
//           toValue: 0,
//           duration: 4000,
//           useNativeDriver: false,
//           easing: Easing.inOut(Easing.ease),
//         }),
//       ])
//     ).start();

//     const stepInterval = setInterval(() => {
//       setStepIndex((prev) => (prev + 1) % breathingSteps.length);
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(stepInterval);
//           Alert.alert("Activity Completed!");
//           saveActivity(activity);
//           navigation.goBack();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 4000);
//   };

//   // ---------------- MEDITATION ----------------
//   const meditationPrompts = [
//     "Focus on your breath.",
//     "Notice the sensations in your body.",
//     "If your mind wanders, gently return to breathing.",
//     "Feel your shoulders relax.",
//     "Observe your thoughts without judgment.",
//   ];
//   const startMeditation = () => {
//     setStepIndex(0);
//     setTimer(parseInt(activity.duration) * 60);

//     const meditationInterval = setInterval(() => {
//       setStepIndex((prev) => (prev >= meditationPrompts.length - 1 ? 0 : prev + 1));
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(meditationInterval);
//           Alert.alert("Meditation Completed!");
//           saveActivity(activity);
//           navigation.goBack();
//           return 0;
//         }
//         return prev - 10;
//       });
//     }, 10000);
//   };

//   // ---------------- WALK / GROUNDING ----------------
//   const walkPrompts = [
//     "Take a deep breath.",
//     "Notice your surroundings.",
//     "Feel your steps grounding you.",
//     "Relax your shoulders.",
//     "Observe your emotions.",
//   ];
//   const startWalk = () => {
//     setStepIndex(0);
//     setTimer(parseInt(activity.duration) * 60);

//     const walkInterval = setInterval(() => {
//       setStepIndex((prev) => (prev >= walkPrompts.length - 1 ? 0 : prev + 1));
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(walkInterval);
//           Alert.alert("Walk / Grounding Completed!");
//           saveActivity(activity);
//           navigation.goBack();
//           return 0;
//         }
//         return prev - 10;
//       });
//     }, 10000);
//   };

//   const finishJournal = () => {
//     if (!journalText.trim()) {
//       Alert.alert("Please write something before finishing.");
//       return;
//     }
//     saveActivity(activity);
//     Alert.alert("Journal saved!");
//     navigation.goBack();
//   };

//   // Circle size for breathing animation
//   const circleSize = circleAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [100, 200],
//   });

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.backText}>← Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>{activity?.title}</Text>
//       <Text style={styles.desc}>{activity?.description}</Text>

//       {!started ? (
//         <TouchableOpacity style={styles.startBtn} onPress={startActivity}>
//           <Text style={styles.startText}>Start Activity</Text>
//         </TouchableOpacity>
//       ) : activity.type === "journal" ? (
//         <View style={{ marginTop: 20 }}>
//           <TextInput
//             style={styles.journalInput}
//             placeholder="Write your thoughts here..."
//             multiline
//             value={journalText}
//             onChangeText={setJournalText}
//           />
//           <TouchableOpacity style={styles.finishBtn} onPress={finishJournal}>
//             <Text style={styles.finishText}>Finish Journal</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.activityContainer}>
//           {activity.type === "breathing" && (
//             <Animated.View
//               style={[styles.breathCircle, { width: circleSize, height: circleSize }]}
//             />
//           )}
//           <Text style={styles.stepText}>
//             {activity.type === "breathing"
//               ? breathingSteps[stepIndex]
//               : activity.type === "meditation"
//               ? meditationPrompts[stepIndex]
//               : walkPrompts[stepIndex]}
//           </Text>
//           <Text style={styles.timerText}>
//             ⏱ {Math.floor(timer / 60)
//               .toString()
//               .padStart(2, "0")}:{(timer % 60).toString().padStart(2, "0")}
//           </Text>
//           <TouchableOpacity
//             style={styles.finishBtn}
//             onPress={() => {
//               Alert.alert("Activity Completed!");
//               saveActivity(activity);
//               navigation.goBack();
//             }}
//           >
//             <Text style={styles.finishText}>Finish Activity</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#ffffff", // white
//   },
//   backText: {
//     color: "#9B5DE5",
//     fontWeight: "600",
//     marginBottom: 20,
//     fontSize: 16,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     marginBottom: 8,
//     color: "#6A4C93", // soft purple
//     textAlign: "center",
//   },
//   desc: {
//     fontSize: 16,
//     color: "#4B4453",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   startBtn: {
//     backgroundColor: "#ffadad", // gentle coral
//     paddingVertical: 16,
//     borderRadius: 20,
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   startText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   activityContainer: {
//     marginTop: 20,
//     alignItems: "center",
//   },
//   stepText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#6A4C93",
//     marginVertical: 20,
//     textAlign: "center",
//   },
//   timerText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#4B4453",
//     marginBottom: 20,
//   },
//   finishBtn: {
//     backgroundColor: "#FF677D", // soft pink
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 16,
//     marginTop: 10,
//   },
//   finishText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   journalInput: {
//     height: 150,
//     borderColor: "#F3C6F1",
//     borderWidth: 1,
//     borderRadius: 16,
//     padding: 12,
//     backgroundColor: "#FFF0F5",
//     textAlignVertical: "top",
//     fontSize: 16,
//     marginBottom: 12,
//     color: "#4B4453",
//   },
//   breathCircle: {
//     borderRadius: 100,
//     backgroundColor: "#B5EAEA", // soft calming green
//     marginBottom: 20,
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// Helper to save completed activity
const saveActivity = async (activity) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const record = {
      id: activity.id,
      title: activity.title,
      type: activity.type,
      date: today,
      completed: true,
    };

    const existing = await AsyncStorage.getItem("completedActivities");
    const activities = existing ? JSON.parse(existing) : [];
    activities.push(record);

    await AsyncStorage.setItem("completedActivities", JSON.stringify(activities));
  } catch (err) {
    console.log("Error saving activity:", err);
  }
};

export default function ActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params || {};
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [journalText, setJournalText] = useState("");
  const [timer, setTimer] = useState(0);

  const circleAnim = new Animated.Value(0);

  const startActivity = () => {
    setStarted(true);
    if (activity.type === "breathing") startBreathing();
    if (activity.type === "meditation") startMeditation();
    if (activity.type === "walk") startWalk();
  };

  // ---------------- BREATHING ----------------
  const breathingSteps = ["Inhale", "Hold", "Exhale", "Hold"];

  const startBreathing = () => {
    setStepIndex(0);
    setTimer(parseInt(activity.duration) * 60);

    Animated.loop(
      Animated.sequence([
        Animated.timing(circleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(circleAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % breathingSteps.length);

      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(stepInterval);
          Alert.alert("Activity Completed!");
          saveActivity(activity);
          navigation.goBack();
          return 0;
        }
        return prev - 1;
      });
    }, 4000);
  };

  // ---------------- MEDITATION ----------------
  const meditationPrompts = [
    "Focus on your breath.",
    "Notice the sensations in your body.",
    "If your mind wanders, gently return to breathing.",
    "Feel your shoulders relax.",
    "Observe your thoughts without judgment.",
  ];

  const startMeditation = () => {
    setStepIndex(0);
    setTimer(parseInt(activity.duration) * 60);

    const meditationInterval = setInterval(() => {
      setStepIndex((prev) =>
        prev >= meditationPrompts.length - 1 ? 0 : prev + 1
      );

      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(meditationInterval);
          Alert.alert("Meditation Completed!");
          saveActivity(activity);
          navigation.goBack();
          return 0;
        }
        return prev - 10;
      });
    }, 10000);
  };

  // ---------------- WALK ----------------
  const walkPrompts = [
    "Take a deep breath.",
    "Notice your surroundings.",
    "Feel your steps grounding you.",
    "Relax your shoulders.",
    "Observe your emotions.",
  ];

  const startWalk = () => {
    setStepIndex(0);
    setTimer(parseInt(activity.duration) * 60);

    const walkInterval = setInterval(() => {
      setStepIndex((prev) =>
        prev >= walkPrompts.length - 1 ? 0 : prev + 1
      );

      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(walkInterval);
          Alert.alert("Walk / Grounding Completed!");
          saveActivity(activity);
          navigation.goBack();
          return 0;
        }
        return prev - 10;
      });
    }, 10000);
  };

  const finishJournal = () => {
    if (!journalText.trim()) {
      Alert.alert("Please write something before finishing.");
      return;
    }

    saveActivity(activity);
    Alert.alert("Journal saved!");
    navigation.goBack();
  };

  const circleSize = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 220],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={22} color="#374151" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.title}>{activity?.title}</Text>
      <Text style={styles.desc}>{activity?.description}</Text>

      {!started ? (
        <TouchableOpacity style={styles.startBtn} onPress={startActivity}>
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={styles.startText}>Start Activity</Text>
        </TouchableOpacity>
      ) : activity.type === "journal" ? (
        <View style={styles.journalCard}>
          <TextInput
            style={styles.journalInput}
            placeholder="Write your thoughts here..."
            multiline
            value={journalText}
            onChangeText={setJournalText}
          />

          <TouchableOpacity style={styles.finishBtn} onPress={finishJournal}>
            <Text style={styles.finishText}>Finish Journal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activityCard}>
          {activity.type === "breathing" && (
            <Animated.View
              style={[
                styles.breathCircle,
                { width: circleSize, height: circleSize },
              ]}
            />
          )}

          <Text style={styles.stepText}>
            {activity.type === "breathing"
              ? breathingSteps[stepIndex]
              : activity.type === "meditation"
              ? meditationPrompts[stepIndex]
              : walkPrompts[stepIndex]}
          </Text>

          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>
              ⏱ {Math.floor(timer / 60)
                .toString()
                .padStart(2, "0")}
              :{(timer % 60).toString().padStart(2, "0")}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => {
              Alert.alert("Activity Completed!");
              saveActivity(activity);
              navigation.goBack();
            }}
          >
            <Text style={styles.finishText}>Finish Activity</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    backgroundColor: "#ffffff",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },

  desc: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
  },

  startBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e339e9f6",
    paddingVertical: 14,
    borderRadius: 30,
  },

  startText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },

  activityCard: {
    marginTop: 30,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },

  stepText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 20,
    marginBottom: 14,
    textAlign: "center",
  },

  timerBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },

  timerText: {
    color: "#4F46E5",
    fontWeight: "600",
  },

  finishBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 25,
  },

  finishText: {
    color: "#fff",
    fontWeight: "600",
  },

  journalCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  journalInput: {
    height: 150,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#FAFAFA",
  },

  breathCircle: {
    borderRadius: 200,
    backgroundColor: "#C7D2FE",
    marginBottom: 20,
  },
});