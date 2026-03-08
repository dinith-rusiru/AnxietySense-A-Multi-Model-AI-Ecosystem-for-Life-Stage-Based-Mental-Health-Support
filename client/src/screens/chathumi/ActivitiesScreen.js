// import React, { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";

// const anxietyPlans = {
//   Low: [
//     "Light stretching for 5 minutes",
//     "Listen to calm instrumental music",
//     "Organize your study desk",
//     "Read a motivational quote",
//   ],
//   Moderate: [
//     "5-minute deep breathing exercise",
//     "Short mindful walk",
//     "Write down your worries",
//     "Drink water and take a short break",
//   ],
//   High: [
//     "Guided meditation (10 minutes)",
//     "Progressive muscle relaxation",
//     "Talk to a trusted friend",
//     "Practice grounding (5-4-3-2-1 method)",
//   ],
//   Severe: [
//     "Step away from work and rest",
//     "Slow breathing with hand on chest",
//     "Contact a support person",
//     "Follow a professional calming exercise",
//   ],
// };

// export default function StudyPlanAnxiety() {
//   const [selectedLevel, setSelectedLevel] = useState("Low");

//   return (
//     <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-3xl font-bold text-center mb-6"
//       >
//         Anxiety-Based Activity Planner
//       </motion.h1>

//       {/* Level Buttons */}
//       <div className="flex flex-wrap justify-center gap-3 mb-8">
//         {Object.keys(anxietyPlans).map((level) => (
//           <Button
//             key={level}
//             onClick={() => setSelectedLevel(level)}
//             className={`rounded-2xl px-6 py-2 ${{
//               true: "",
//             }} ${selectedLevel === level ? "bg-purple-600" : "bg-gray-400"}`}
//           >
//             {level}
//           </Button>
//         ))}
//       </div>

//       {/* Activities Card */}
//       <motion.div
//         key={selectedLevel}
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3 }}
//         className="max-w-xl mx-auto"
//       >
//         <Card className="rounded-2xl shadow-lg">
//           <CardContent className="p-6">
//             <h2 className="text-xl font-semibold mb-4 text-center">
//               {selectedLevel} Anxiety Activities
//             </h2>
//             <ul className="space-y-3">
//               {anxietyPlans[selectedLevel].map((activity, index) => (
//                 <li
//                   key={index}
//                   className="p-3 bg-gray-100 rounded-xl text-sm"
//                 >
//                   {activity}
//                 </li>
//               ))}
//             </ul>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }

// ===============================
// ActivitiesScreen.js (React Native – FIXED)
// ===============================

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";

// // -------------------------------
// // Activities by Anxiety Level
// // -------------------------------
// const ACTIVITIES = {
//   Low: [
//     {
//       id: "1",
//       title: "Gratitude Journaling",
//       description: "Write 3 things you are grateful for.",
//       duration: "5 min",
//       type: "journal",
//     },
//     {
//       id: "2",
//       title: "Light Stretching",
//       description: "Gentle body stretching to stay relaxed.",
//       duration: "7 min",
//       type: "stretch",
//     },
//   ],

//   Moderate: [
//     {
//       id: "3",
//       title: "Deep Breathing",
//       description: "4-4-4 breathing exercise to calm your mind.",
//       duration: "3 min",
//       type: "breathing",
//     },
//     {
//       id: "4",
//       title: "Short Meditation",
//       description: "Guided mindfulness meditation.",
//       duration: "5 min",
//       type: "meditation",
//     },
//   ],

//   High: [
//     {
//       id: "5",
//       title: "Box Breathing",
//       description: "Structured breathing to reduce anxiety.",
//       duration: "5 min",
//       type: "breathing",
//     },
//     {
//       id: "6",
//       title: "Grounding Exercise",
//       description: "5-4-3-2-1 grounding technique.",
//       duration: "4 min",
//       type: "grounding",
//     },
//   ],

//   Severe: [
//     {
//       id: "7",
//       title: "Emergency Calm Breathing",
//       description: "Slow breathing for panic moments.",
//       duration: "2 min",
//       type: "breathing",
//     },
//     {
//       id: "8",
//       title: "Guided Safe Meditation",
//       description: "Follow the voice and relax slowly.",
//       duration: "6 min",
//       type: "meditation",
//     },
//   ],
// };

// // ===============================
// // Main Component
// // ===============================
// export default function ActivitiesScreen({ navigation, route }) {
//   const anxietyLevel = route?.params?.anxietyLevel || "Low";

//   const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate("ActivityDetail", {
//           activity: item,
//         })
//       }
//     >
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.desc}>{item.description}</Text>
//       <Text style={styles.duration}>⏱ {item.duration}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.header}>
//         Recommended Activities ({anxietyLevel})
//       </Text>

//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       />
//     </SafeAreaView>
//   );
// }

// // ===============================
// // Styles
// // ===============================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f4f6fb",
//     padding: 16,
//   },

//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 16,
//     color: "#2c3e50",
//   },

//   card: {
//     backgroundColor: "#ffffff",
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 14,
//     elevation: 3,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#34495e",
//   },

//   desc: {
//     fontSize: 14,
//     color: "#7f8c8d",
//     marginTop: 6,
//   },

//   duration: {
//     marginTop: 8,
//     fontSize: 13,
//     color: "#2980b9",
//     fontWeight: "600",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";

// // -------------------------------
// // Activities by Anxiety Level (Updated for practical exercises)
// const ACTIVITIES = {
//   Low: [
//     { id: "1", title: "Gratitude Journaling", description: "Write 3 things you are grateful for.", duration: "5 min", type: "journal" },
//     { id: "2", title: "Light Stretching", description: "Gentle body stretching to stay relaxed.", duration: "7 min", type: "stretch" },
//   ],
//   Moderate: [
//     { id: "3", title: "Deep Breathing", description: "4-4-4 breathing exercise to calm your mind.", duration: "3 min", type: "breathing" },
//     { id: "4", title: "Short Meditation", description: "Guided mindfulness meditation.", duration: "5 min", type: "meditation" },
//   ],
//   High: [
//     { id: "5", title: "Box Breathing", description: "Structured breathing to reduce anxiety.", duration: "5 min", type: "breathing" },
//     { id: "6", title: "Grounding Exercise", description: "5-4-3-2-1 grounding technique.", duration: "4 min", type: "grounding" },
//   ],
//   Severe: [
//     { id: "7", title: "Emergency Calm Breathing", description: "Slow breathing for panic moments.", duration: "2 min", type: "breathing" },
//     { id: "8", title: "Guided Safe Meditation", description: "Follow the voice and relax slowly.", duration: "6 min", type: "meditation" },
//   ],
// };

// // ===============================
// // Main Component
// // ===============================
// export default function ActivitiesScreen({ navigation, route }) {
//   const anxietyLevel = route?.params?.anxietyLevel || "Low";
//   const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate("ActivityDetail", { activity: item })}
//     >
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.desc}>{item.description}</Text>
//       <Text style={styles.duration}>⏱ {item.duration}</Text>
//       <TouchableOpacity
//         style={styles.startBtn}
//         onPress={() => navigation.navigate("ActivityDetail", { activity: item })}
//       >
//         <Text style={styles.startText}>Start Activity</Text>
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>

//         <Text style={styles.header}>Recommended Activities ({anxietyLevel})</Text>

//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={styles.dashboardBtn}
//         >
//           <Text style={styles.dashboardText}>Go to Dashboard</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//     </SafeAreaView>
//   );
// }

// // ===============================
// // Styles
// // ===============================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#eef2f7",
//     padding: 16,
//   },

//   headerContainer: {
//     marginBottom: 16,
//   },

//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#1e3a8a",
//     marginBottom: 12,
//   },

//   card: {
//     backgroundColor: "#ffffff",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 3,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#34495e",
//   },

//   desc: {
//     fontSize: 14,
//     color: "#7f8c8d",
//     marginTop: 6,
//   },

//   duration: {
//     marginTop: 8,
//     fontSize: 13,
//     color: "#2980b9",
//     fontWeight: "600",
//   },

//   startBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   startText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   backBtn: {
//     marginBottom: 6,
//   },

//   backText: {
//     color: "#1e3a8a",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     marginTop: 6,
//     alignSelf: "flex-start",
//     backgroundColor: "#f59e0b",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },

//   dashboardText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";

// // -------------------------------
// // Updated Activities by Anxiety Level
// // Matches the ResultScreen activity suggestions
// // -------------------------------
// const ACTIVITIES = {
//   Low: [
//     {
//       id: "1",
//       title: "Gratitude Journaling",
//       description: "Write 3 things you are grateful for to improve your mood.",
//       duration: "5 min",
//       type: "journal",
//     },
//     {
//       id: "2",
//       title: "Slow Breathing",
//       description: "Practice slow breathing for 5 minutes to calm your mind.",
//       duration: "5 min",
//       type: "breathing",
//     },
//   ],

//   Moderate: [
//     {
//       id: "3",
//       title: "Guided Breathing Exercises",
//       description: "Follow guided breathing exercises to reduce mild anxiety.",
//       duration: "5 min",
//       type: "breathing",
//     },
//     {
//       id: "4",
//       title: "Light Stretching or Walking",
//       description: "Engage in light stretching or a short walk to stay relaxed.",
//       duration: "7 min",
//       type: "stretch",
//     },
//   ],

//   High: [
//     {
//       id: "5",
//       title: "Short Guided Meditation",
//       description: "Follow a short guided meditation session to regain focus.",
//       duration: "5 min",
//       type: "meditation",
//     },
//     {
//       id: "6",
//       title: "Consistent Sleep Routine",
//       description: "Maintain a consistent sleep schedule to improve emotional stability.",
//       duration: "7 min",
//       type: "routine",
//     },
//   ],

//   Severe: [
//     {
//       id: "7",
//       title: "Speak with a Mental Health Professional",
//       description: "Consult a professional for support with severe anxiety.",
//       duration: "N/A",
//       type: "support",
//     },
//     {
//       id: "8",
//       title: "Grounding Exercises (5-4-3-2-1)",
//       description: "Use the 5-4-3-2-1 technique to regain calm and presence.",
//       duration: "4 min",
//       type: "grounding",
//     },
//   ],
// };

// // Map ResultScreen anxiety levels to ACTIVITIES keys
// const LEVEL_MAP = {
//   "Minimal Anxiety": "Low",
//   "Mild Anxiety": "Moderate",
//   "Moderate Anxiety": "High",
//   "Severe Anxiety": "Severe",
// };

// // ===============================
// // Main Component
// // ===============================
// export default function ActivitiesScreen({ navigation, route }) {
//   const anxietyLevelFromResult = route?.params?.anxiety_level || "Minimal Anxiety";
//   const anxietyLevel = LEVEL_MAP[anxietyLevelFromResult] || "Low";

//   const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.desc}>{item.description}</Text>
//       <Text style={styles.duration}>⏱ {item.duration}</Text>

//       <TouchableOpacity
//         style={styles.startBtn}
//         onPress={() => navigation.navigate("ActivityDetail", { activity: item })}
//       >
//         <Text style={styles.startText}>Start Activity</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>

//         <Text style={styles.header}>
//           Recommended Activities ({anxietyLevelFromResult})
//         </Text>

//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={styles.dashboardBtn}
//         >
//           <Text style={styles.dashboardText}>Go to Dashboard</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//     </SafeAreaView>
//   );
// }

// // ===============================
// // Styles
// // ===============================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#eef2f7",
//     padding: 16,
//   },

//   headerContainer: {
//     marginBottom: 16,
//   },

//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#1e3a8a",
//     marginBottom: 12,
//   },

//   card: {
//     backgroundColor: "#ffffff",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 3,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#34495e",
//   },

//   desc: {
//     fontSize: 14,
//     color: "#7f8c8d",
//     marginTop: 6,
//   },

//   duration: {
//     marginTop: 8,
//     fontSize: 13,
//     color: "#2980b9",
//     fontWeight: "600",
//   },

//   startBtn: {
//     marginTop: 12,
//     backgroundColor: "#22C55E",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   startText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   backBtn: {
//     marginBottom: 6,
//   },

//   backText: {
//     color: "#1e3a8a",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     marginTop: 6,
//     alignSelf: "flex-start",
//     backgroundColor: "#f59e0b",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },

//   dashboardText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });



// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";

// // -------------------------------
// // Activities by Anxiety Level
// // -------------------------------
// const ACTIVITIES = {
//   Low: [
//     {
//       id: "1",
//       title: "Gratitude Journaling",
//       description: "Write 3 things you are grateful for to improve your mood.",
//       duration: "5 min",
//       type: "journal",
//     },
//     {
//       id: "2",
//       title: "Slow Breathing",
//       description: "Practice slow breathing for 5 minutes to calm your mind.",
//       duration: "5 min",
//       type: "breathing",
//     },
//   ],
//   Moderate: [
//     {
//       id: "3",
//       title: "Guided Breathing Exercises",
//       description: "Follow guided breathing exercises to reduce mild anxiety.",
//       duration: "5 min",
//       type: "breathing",
//     },
//     {
//       id: "4",
//       title: "Light Stretching or Walking",
//       description: "Engage in light stretching or a short walk to stay relaxed.",
//       duration: "7 min",
//       type: "stretch",
//     },
//   ],
//   High: [
//     {
//       id: "5",
//       title: "Short Guided Meditation",
//       description: "Follow a short guided meditation session to regain focus.",
//       duration: "5 min",
//       type: "meditation",
//     },
//     {
//       id: "6",
//       title: "Consistent Sleep Routine",
//       description: "Maintain a consistent sleep schedule to improve emotional stability.",
//       duration: "7 min",
//       type: "routine",
//     },
//   ],
//   Severe: [
//     {
//       id: "7",
//       title: "Speak with a Mental Health Professional",
//       description: "Consult a professional for support with severe anxiety.",
//       duration: "N/A",
//       type: "support",
//     },
//     {
//       id: "8",
//       title: "Grounding Exercises (5-4-3-2-1)",
//       description: "Use the 5-4-3-2-1 technique to regain calm and presence.",
//       duration: "4 min",
//       type: "grounding",
//     },
//   ],
// };

// // Map ResultScreen anxiety levels to ACTIVITIES keys
// const LEVEL_MAP = {
//   "Minimal Anxiety": "Low",
//   "Mild Anxiety": "Moderate",
//   "Moderate Anxiety": "High",
//   "Severe Anxiety": "Severe",
// };

// // ===============================
// // Main Component
// // ===============================
// export default function ActivitiesScreen({ navigation, route }) {
//   const anxietyLevelFromResult = route?.params?.anxiety_level || "Minimal Anxiety";
//   const anxietyLevel = LEVEL_MAP[anxietyLevelFromResult] || "Low";

//   const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.desc}>{item.description}</Text>
//       <Text style={styles.duration}>⏱ {item.duration}</Text>

//       <TouchableOpacity
//         style={styles.startBtn}
//         onPress={() => navigation.navigate("ActivityDetail", { activity: item })}
//       >
//         <Text style={styles.startText}>Start Activity</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <View style={styles.headerTop}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//             <Text style={styles.backText}>← Back</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => navigation.navigate("Dashboard")}
//             style={styles.dashboardBtn}
//           >
//             <Text style={styles.dashboardText}>Dashboard</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.header}>
//           Recommended Activities ({anxietyLevelFromResult})
//         </Text>
//       </View>

//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//     </SafeAreaView>
//   );
// }

// // ===============================
// // Styles
// // ===============================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF", // white background
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },

//   headerContainer: {
//     marginBottom: 16,
//   },

//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#2C3E50",
//     marginBottom: 8,
//   },

//   card: {
//     backgroundColor: "#F8F9FA", // soft card background
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 3,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#34495E",
//   },

//   desc: {
//     fontSize: 14,
//     color: "#7F8C8D",
//     marginTop: 6,
//   },

//   duration: {
//     marginTop: 8,
//     fontSize: 13,
//     color: "#2980B9",
//     fontWeight: "600",
//   },

//   startBtn: {
//     marginTop: 12,
//     backgroundColor: "#fa9999", // professional purple
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   startText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 15,
//   },

//   backBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     backgroundColor: "#E0E0E0",
//     borderRadius: 8,
//   },

//   backText: {
//     color: "#2C3E50",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     backgroundColor: "#00B894", // calm green
//     borderRadius: 8,
//   },

//   dashboardText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },
// });

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";

// // -------------------------------
// // Activities by Anxiety Level
// // -------------------------------
// const ACTIVITIES = {
//   Low: [
//     {
//       id: "1",
//       title: "Gratitude Journaling",
//       description: "Write 3 things you are grateful for to improve your mood.",
//       duration: "5 min",
//       type: "journal",
//     },
//     {
//       id: "2",
//       title: "Slow Breathing",
//       description: "Practice slow breathing for 5 minutes to calm your mind.",
//       duration: "5 min",
//       type: "breathing",
//     },
//   ],
//   Moderate: [
//     {
//       id: "3",
//       title: "Guided Breathing Exercises",
//       description: "Follow guided breathing exercises to reduce mild anxiety.",
//       duration: "5 min",
//       type: "breathing",
//     },
//     {
//       id: "4",
//       title: "Light Stretching or Walking",
//       description: "Engage in light stretching or a short walk to stay relaxed.",
//       duration: "7 min",
//       type: "stretch",
//     },
//   ],
//   High: [
//     {
//       id: "5",
//       title: "Short Guided Meditation",
//       description: "Follow a short guided meditation session to regain focus.",
//       duration: "5 min",
//       type: "meditation",
//     },
//     {
//       id: "6",
//       title: "Consistent Sleep Routine",
//       description: "Maintain a consistent sleep schedule to improve emotional stability.",
//       duration: "7 min",
//       type: "routine",
//     },
//   ],
//   Severe: [
//     {
//       id: "7",
//       title: "Speak with a Mental Health Professional",
//       description: "Consult a professional for support with severe anxiety.",
//       duration: "N/A",
//       type: "support",
//     },
//     {
//       id: "8",
//       title: "Grounding Exercises (5-4-3-2-1)",
//       description: "Use the 5-4-3-2-1 technique to regain calm and presence.",
//       duration: "4 min",
//       type: "grounding",
//     },
//   ],
// };

// // Activity icons
// const ACTIVITY_ICONS = {
//   journal: "📝",
//   breathing: "🌬️",
//   stretch: "🤸‍♀️",
//   meditation: "🧘‍♀️",
//   routine: "🌙",
//   support: "💬",
//   grounding: "🌿",
// };

// // Map ResultScreen anxiety levels
// const LEVEL_MAP = {
//   "Minimal Anxiety": "Low",
//   "Mild Anxiety": "Moderate",
//   "Moderate Anxiety": "High",
//   "Severe Anxiety": "Severe",
// };

// export default function ActivitiesScreen({ navigation, route }) {
//   const anxietyLevelFromResult =
//     route?.params?.anxiety_level || "Minimal Anxiety";

//   const anxietyLevel = LEVEL_MAP[anxietyLevelFromResult] || "Low";
//   const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.icon}>{ACTIVITY_ICONS[item.type] || "✨"}</Text>
//         <Text style={styles.title}>{item.title}</Text>
//       </View>

//       <Text style={styles.desc}>{item.description}</Text>

//       <View style={styles.cardFooter}>
//         <Text style={styles.duration}>⏱ {item.duration}</Text>

//         <TouchableOpacity
//           style={styles.startBtn}
//           onPress={() =>
//             navigation.navigate("ActivityDetail", { activity: item })
//           }
//         >
//           <Text style={styles.startText}>Start</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <View style={styles.headerTop}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backBtn}
//           >
//             <Text style={styles.backText}>← Back</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate("Dashboard")}
//             style={styles.dashboardBtn}
//           >
//             <Text style={styles.dashboardText}>Dashboard</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.header}>
//           Activities for {anxietyLevelFromResult}
//         </Text>

//         <Text style={styles.subHeader}>
//           Small activities to support your emotional well-being.
//         </Text>
//       </View>

//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 40 }}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// // -------------------------------
// // Styles
// // -------------------------------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },

//   headerContainer: {
//     marginBottom: 20,
//   },

//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 14,
//   },

//   header: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#374151",
//   },

//   subHeader: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//   },

//   card: {
//     backgroundColor: "#FFF5FF",
//     padding: 20,
//     borderRadius: 18,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 3,
//   },

//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },

//   icon: {
//     fontSize: 22,
//     marginRight: 10,
//   },

//   title: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#374151",
//   },

//   desc: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//     lineHeight: 20,
//   },

//   cardFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 12,
//   },

//   duration: {
//     fontSize: 13,
//     color: "#e339e9f6",
//     fontWeight: "600",
//   },

//   startBtn: {
//     backgroundColor: "#e339e9f6",
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 14,
//   },

//   startText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },

//   backBtn: {
//     backgroundColor: "#F3F4F6",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//   },

//   backText: {
//     color: "#374151",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     backgroundColor: "#FDEBFF",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//   },

//   dashboardText: {
//     color: "#e339e9f6",
//     fontWeight: "600",
//   },
// });


// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";

// // -------------------------------
// // Activities by Anxiety Level
// // -------------------------------
// const ACTIVITIES = {
//   Low: [
//     {
//       id: "1",
//       title: "Gratitude Journaling",
//       description: "Write 3 things you are grateful for to improve your mood.",
//       duration: "5 min",
//       type: "journal",
//     },
//     {
//       id: "2",
//       title: "Slow Breathing",
//       description: "Practice slow breathing for 5 minutes to calm your mind.",
//       duration: "5 min",
//       type: "breathing",
//     },
//   ],
//   Moderate: [
//     {
//       id: "3",
//       title: "Guided Breathing Exercises",
//       description: "Follow guided breathing exercises to reduce mild anxiety.",
//       duration: "5 min",
//       type: "breathing",
//     },
//     {
//       id: "4",
//       title: "Light Stretching or Walking",
//       description: "Engage in light stretching or a short walk to stay relaxed.",
//       duration: "7 min",
//       type: "stretch",
//     },
//   ],
//   High: [
//     {
//       id: "5",
//       title: "Short Guided Meditation",
//       description: "Follow a short guided meditation session to regain focus.",
//       duration: "5 min",
//       type: "meditation",
//     },
//     {
//       id: "6",
//       title: "Consistent Sleep Routine",
//       description:
//         "Maintain a consistent sleep schedule to improve emotional stability.",
//       duration: "7 min",
//       type: "routine",
//     },
//   ],
//   Severe: [
//     {
//       id: "7",
//       title: "Speak with a Mental Health Professional",
//       description: "Consult a professional for support with severe anxiety.",
//       duration: "N/A",
//       type: "support",
//     },
//     {
//       id: "8",
//       title: "Grounding Exercises (5-4-3-2-1)",
//       description:
//         "Use the 5-4-3-2-1 technique to regain calm and presence.",
//       duration: "4 min",
//       type: "grounding",
//     },
//   ],
// };

// // Activity icons
// const ACTIVITY_ICONS = {
//   journal: "📝",
//   breathing: "🌬️",
//   stretch: "🤸‍♀️",
//   meditation: "🧘‍♀️",
//   routine: "🌙",
//   support: "💬",
//   grounding: "🌿",
// };

// // Map ResultScreen anxiety levels
// const LEVEL_MAP = {
//   "Minimal Anxiety": "Low",
//   "Mild Anxiety": "Moderate",
//   "Moderate Anxiety": "High",
//   "Severe Anxiety": "Severe",
// };

// export default function ActivitiesScreen({ navigation, route }) {
//   const anxietyLevelFromResult =
//     route?.params?.anxiety_level || "Minimal Anxiety";

//   const anxietyLevel = LEVEL_MAP[anxietyLevelFromResult] || "Low";
//   const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.icon}>{ACTIVITY_ICONS[item.type] || "✨"}</Text>
//         <Text style={styles.title}>{item.title}</Text>
//       </View>

//       <Text style={styles.desc}>{item.description}</Text>

//       <View style={styles.cardFooter}>
//         <Text style={styles.duration}>⏱ {item.duration}</Text>

//         <TouchableOpacity
//           style={styles.startBtn}
//           onPress={() =>
//             navigation.navigate("ActivityDetail", { activity: item })
//           }
//         >
//           <Text style={styles.startText}>Start</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <View style={styles.headerTop}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backBtn}
//           >
//             <Text style={styles.backText}>← Back</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate("Dashboard")}
//             style={styles.dashboardBtn}
//           >
//             <Text style={styles.dashboardText}>Dashboard</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.header}>
//           Activities for {anxietyLevelFromResult}
//         </Text>

//         <Text style={styles.subHeader}>
//           Small activities to support your emotional well-being.
//         </Text>
//       </View>

//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 40 }}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// // -------------------------------
// // Styles (Pregnancy Friendly UI)
// // -------------------------------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FDF7FF",
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },

//   headerContainer: {
//     marginBottom: 22,
//   },

//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 14,
//   },

//   header: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#4b1d55",
//   },

//   subHeader: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 6,
//     lineHeight: 20,
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     padding: 20,
//     borderRadius: 20,
//     marginBottom: 16,

//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,

//     elevation: 3,
//   },

//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },

//   icon: {
//     fontSize: 24,
//     marginRight: 12,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#374151",
//   },

//   desc: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//     lineHeight: 20,
//   },

//   cardFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 14,
//   },

//   duration: {
//     fontSize: 13,
//     color: "#a855f7",
//     fontWeight: "600",
//   },

//   startBtn: {
//     backgroundColor: "#e339e9f6",
//     paddingVertical: 10,
//     paddingHorizontal: 22,
//     borderRadius: 16,
//   },

//   startText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   backBtn: {
//     backgroundColor: "#F3E8FF",
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 12,
//   },

//   backText: {
//     color: "#7e22ce",
//     fontWeight: "600",
//   },

//   dashboardBtn: {
//     backgroundColor: "#F3E8FF",
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 12,
//   },

//   dashboardText: {
//     color: "#7e22ce",
//     fontWeight: "600",
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// -------------------------------
// Activities by Anxiety Level
// -------------------------------
const ACTIVITIES = {
  Low: [
    {
      id: "1",
      title: "Gratitude Journaling",
      description: "Write 3 things you are grateful for to improve your mood.",
      duration: "5 min",
      type: "journal",
    },
    {
      id: "2",
      title: "Slow Breathing",
      description: "Practice slow breathing for 5 minutes to calm your mind.",
      duration: "5 min",
      type: "breathing",
    },
  ],
  Moderate: [
    {
      id: "3",
      title: "Guided Breathing Exercises",
      description: "Follow guided breathing exercises to reduce mild anxiety.",
      duration: "5 min",
      type: "breathing",
    },
    {
      id: "4",
      title: "Light Stretching or Walking",
      description: "Engage in light stretching or a short walk to stay relaxed.",
      duration: "7 min",
      type: "stretch",
    },
  ],
  High: [
    {
      id: "5",
      title: "Short Guided Meditation",
      description: "Follow a short guided meditation session to regain focus.",
      duration: "5 min",
      type: "meditation",
    },
    {
      id: "6",
      title: "Consistent Sleep Routine",
      description:
        "Maintain a consistent sleep schedule to improve emotional stability.",
      duration: "7 min",
      type: "routine",
    },
  ],
  Severe: [
    {
      id: "7",
      title: "Speak with a Mental Health Professional",
      description: "Consult a professional for support with severe anxiety.",
      duration: "N/A",
      type: "support",
    },
    {
      id: "8",
      title: "Grounding Exercises (5-4-3-2-1)",
      description:
        "Use the 5-4-3-2-1 technique to regain calm and presence.",
      duration: "4 min",
      type: "grounding",
    },
  ],
};

// Activity icons
const ACTIVITY_ICONS = {
  journal: "📝",
  breathing: "🌬️",
  stretch: "🤸‍♀️",
  meditation: "🧘‍♀️",
  routine: "🌙",
  support: "💬",
  grounding: "🌿",
};

// Map ResultScreen anxiety levels
const LEVEL_MAP = {
  "Minimal Anxiety": "Low",
  "Mild Anxiety": "Moderate",
  "Moderate Anxiety": "High",
  "Severe Anxiety": "Severe",
};

export default function ActivitiesScreen({ navigation, route }) {
  const [anxietyLevelFromResult, setAnxietyLevelFromResult] =
    useState("Unknown");

  // 🔹 Load anxiety level from route.params or AsyncStorage
  useEffect(() => {
    const loadLevel = async () => {
      try {
        if (route?.params?.anxiety_level) {
          setAnxietyLevelFromResult(route.params.anxiety_level);
        } else {
          const storedLevel = await AsyncStorage.getItem("anxietyLevel");
          if (storedLevel) setAnxietyLevelFromResult(storedLevel);
        }
      } catch (error) {
        console.log("Error loading anxiety level", error);
      }
    };

    loadLevel();
  }, [route]);

  const anxietyLevel = LEVEL_MAP[anxietyLevelFromResult] || "Low";
  const data = ACTIVITIES[anxietyLevel] || ACTIVITIES.Low;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.icon}>{ACTIVITY_ICONS[item.type] || "✨"}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>

      <Text style={styles.desc}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.duration}>⏱ {item.duration}</Text>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() =>
            navigation.navigate("ActivityDetail", { activity: item })
          }
        >
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Dashboard")}
            style={styles.dashboardBtn}
          >
            <Text style={styles.dashboardText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.header}>
          Activities for {anxietyLevelFromResult}
        </Text>

        <Text style={styles.subHeader}>
          Small activities to support your emotional well-being.
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// -------------------------------
// Styles
// -------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7FF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  headerContainer: {
    marginBottom: 22,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4b1d55",
  },

  subHeader: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  icon: {
    fontSize: 24,
    marginRight: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },

  desc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  duration: {
    fontSize: 13,
    color: "#a855f7",
    fontWeight: "600",
  },

  startBtn: {
    backgroundColor: "#e339e9f6",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 16,
  },

  startText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  backBtn: {
    backgroundColor: "#F3E8FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  backText: {
    color: "#7e22ce",
    fontWeight: "600",
  },

  dashboardBtn: {
    backgroundColor: "#F3E8FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  dashboardText: {
    color: "#7e22ce",
    fontWeight: "600",
  },
});