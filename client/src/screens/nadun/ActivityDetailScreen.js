// // ActivityDetailScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput
// } from "react-native";

// // Default instructions for activities
// const activityInstructions = {
//   "Daily physical exercise (e.g., jogging or cycling)": [
//     "Go for a 20-30 minute walk, jog, or cycle.",
//     "Focus on your breathing and movements."
//   ],
//   "Journaling positive experiences or gratitude": [
//     "Write 3 things you are grateful for today.",
//     "Reflect on positive experiences in your life."
//   ],
//   "Engaging in hobbies or creative outlets": [
//     "Spend 20 minutes on a hobby you enjoy.",
//     "Focus on enjoying the process, not the result."
//   ],
//   "Short meditation or mindfulness exercises": [
//     "Sit comfortably and close your eyes.",
//     "Focus on your breath and sensations.",
//     "Do this for 5-10 minutes."
//   ],
//   "Regular aerobic exercise": [
//     "Do 20-30 minutes of aerobic exercise.",
//     "You can jog, cycle, or dance."
//   ],
//   "Organize your daily routine": [
//     "Write down your tasks for the day.",
//     "Prioritize them and follow your plan."
//   ],
//   "Practice deep breathing exercises (4-7-8 or box breathing)": [
//     "Sit comfortably.",
//     "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.",
//     "Repeat 5 times."
//   ],
//   "Yoga or tai chi for relaxation": [
//     "Follow a yoga or tai chi routine for 10 minutes.",
//     "Focus on movements and breathing."
//   ],
//   "Talk to supportive friends or family": [
//     "Reach out to a trusted friend or family member.",
//     "Share your feelings and listen actively."
//   ],
//   "Seek professional counseling or therapy": [
//     "Schedule an appointment with a counselor or therapist.",
//     "Prepare notes on your current feelings and struggles."
//   ],
//   "Practice grounding or relaxation techniques": [
//     "Focus on your senses: touch, sound, smell to ground yourself.",
//     "Do this for 5 minutes."
//   ],
//   "Maintain a structured daily routine": [
//     "Plan your tasks for the day.",
//     "Stick to your schedule as much as possible."
//   ],
//   "Immediate consultation with a mental health professional": [
//     "Contact a mental health professional immediately.",
//     "Ensure you have a safe environment."
//   ],
//   "Engage in short mindfulness or grounding exercises": [
//     "Take 5-10 minutes to focus on your senses.",
//     "Breathe slowly and observe your surroundings."
//   ],
//   "Ensure close support from family or friends": [
//     "Stay in touch with a supportive person.",
//     "Talk about your feelings and listen to guidance."
//   ]
// };

// export default function ActivityDetailScreen({ route, navigation }) {
//   const { activityName } = route.params;
//   const instructions = activityInstructions[activityName] || ["Follow the activity as best as you can."];

//   // Determine if this is timer-based activity
//   const timerActivities = [
//     "Short meditation or mindfulness exercises",
//     "Practice deep breathing exercises (4-7-8 or box breathing)",
//     "Yoga or tai chi for relaxation",
//     "Practice grounding or relaxation techniques"
//   ];
//   const isTimerActivity = timerActivities.includes(activityName);

//   const [timer, setTimer] = useState(isTimerActivity ? 5 * 60 : 0); // 5 min default
//   const [intervalId, setIntervalId] = useState(null);
//   const [note, setNote] = useState("");

//   // Timer countdown effect
//   useEffect(() => {
//     if (!isTimerActivity) return;

//     if (timer === 0 && intervalId) {
//       clearInterval(intervalId);
//     }
//   }, [timer]);

//   const startTimer = () => {
//     if (intervalId) return;
//     const id = setInterval(() => setTimer(prev => {
//       if (prev <= 1) {
//         clearInterval(id);
//         return 0;
//       }
//       return prev - 1;
//     }), 1000);
//     setIntervalId(id);
//   };

//   const formatTime = (seconds) => {
//     const m = Math.floor(seconds / 60).toString().padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>{activityName}</Text>

//       <View style={{ width: "100%", marginTop: 20 }}>
//         {instructions.map((step, index) => (
//           <Text key={index} style={styles.instruction}>
//             {index + 1}. {step}
//           </Text>
//         ))}
//       </View>

//       {isTimerActivity && (
//         <View style={{ alignItems: "center", marginVertical: 20 }}>
//           <Text style={styles.timer}>{formatTime(timer)}</Text>
//           <TouchableOpacity style={styles.startButton} onPress={startTimer}>
//             <Text style={styles.buttonText}>Start Timer</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {!isTimerActivity && (
//         <TextInput
//           style={styles.textInput}
//           placeholder="Write your notes here..."
//           multiline
//           numberOfLines={5}
//           value={note}
//           onChangeText={setNote}
//         />
//       )}

//       <TouchableOpacity
//         style={styles.completeButton}
//         onPress={() => navigation.popToTop()}
//       >
//         <Text style={styles.buttonText}>Mark as Done / Go Home</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//               >
//               <Text style={styles.buttonText}>Back to Activities</Text>
//               </TouchableOpacity>
      

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 30,
//     backgroundColor: "#fff",
//     alignItems: "center"
//   },
//   title: { fontSize: 26, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
//   instruction: { fontSize: 16, marginBottom: 10 },
//   timer: { fontSize: 48, color: "#2563eb", marginVertical: 20 },
//   startButton: {
//     backgroundColor: "#2563eb",
//     padding: 14,
//     borderRadius: 12,
//     width: "60%",
//     alignItems: "center"
//   },
//   completeButton: {
//     backgroundColor: "#64748b",
//     padding: 14,
//     borderRadius: 12,
//     marginTop: 20,
//     width: "80%",
//     alignItems: "center"
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
//   textInput: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "#64748b",
//     borderRadius: 12,
//     padding: 10,
//     marginVertical: 20,
//     textAlignVertical: "top"
//   },
//   uttonText: { color: "#fff", fontWeight: "bold" },
//   backButton: {
//   backgroundColor: "#f59e0b",
//   padding: 14,
//   borderRadius: 12,
//   marginTop: 10,
//   width: "60%",
//   alignItems: "center"
// },
// });



import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const activityInstructions = {
  "Daily physical exercise (e.g., jogging or cycling)": [
    "Go for a 20-30 minute walk, jog, or cycle.",
    "Focus on your breathing and movements."
  ],
  "Journaling positive experiences or gratitude": [
    "Write 3 things you are grateful for today.",
    "Reflect on positive experiences in your life."
  ],
  "Engaging in hobbies or creative outlets": [
    "Spend 20 minutes on a hobby you enjoy.",
    "Focus on enjoying the process, not the result."
  ],
  "Short meditation or mindfulness exercises": [
    "Sit comfortably and close your eyes.",
    "Focus on your breath and sensations.",
    "Do this for 5-10 minutes."
  ],
  "Regular aerobic exercise": [
    "Do 20-30 minutes of aerobic exercise.",
    "You can jog, cycle, or dance."
  ],
  "Organize your daily routine": [
    "Write down your tasks for the day.",
    "Prioritize them and follow your plan."
  ],
  "Practice deep breathing exercises (4-7-8 or box breathing)": [
    "Sit comfortably.",
    "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.",
    "Repeat 5 times."
  ],
  "Yoga or tai chi for relaxation": [
    "Follow a yoga or tai chi routine for 10 minutes.",
    "Focus on movements and breathing."
  ],
  "Talk to supportive friends or family": [
    "Reach out to a trusted friend or family member.",
    "Share your feelings and listen actively."
  ],
  "Seek professional counseling or therapy": [
    "Schedule an appointment with a counselor or therapist.",
    "Prepare notes on your current feelings and struggles."
  ],
  "Practice grounding or relaxation techniques": [
    "Focus on your senses: touch, sound, smell to ground yourself.",
    "Do this for 5 minutes."
  ],
  "Maintain a structured daily routine": [
    "Plan your tasks for the day.",
    "Stick to your schedule as much as possible."
  ],
  "Immediate consultation with a mental health professional": [
    "Contact a mental health professional immediately.",
    "Ensure you have a safe environment."
  ],
  "Engage in short mindfulness or grounding exercises": [
    "Take 5-10 minutes to focus on your senses.",
    "Breathe slowly and observe your surroundings."
  ],
  "Ensure close support from family or friends": [
    "Stay in touch with a supportive person.",
    "Talk about your feelings and listen to guidance."
  ]
};

export default function ActivityDetailScreen({ route, navigation }) {
  const { activityName } = route.params;
  const instructions = activityInstructions[activityName] || ["Follow the activity as best as you can."];

  const timerActivities = [
    "Short meditation or mindfulness exercises",
    "Practice deep breathing exercises (4-7-8 or box breathing)",
    "Yoga or tai chi for relaxation",
    "Practice grounding or relaxation techniques"
  ];
  const isTimerActivity = timerActivities.includes(activityName);

  const [timer, setTimer] = useState(isTimerActivity ? 5 * 60 : 0);
  const [intervalId, setIntervalId] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isTimerActivity) return;
    if (timer === 0 && intervalId) clearInterval(intervalId);
  }, [timer]);

  const startTimer = () => {
    if (intervalId) return;
    const id = setInterval(() => setTimer(prev => {
      if (prev <= 1) { clearInterval(id); return 0; }
      return prev - 1;
    }), 1000);
    setIntervalId(id);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const markAsDone = async () => {
    try {
      const todayKey = new Date().toISOString().slice(0,10);
      const todayActivities = JSON.parse(await AsyncStorage.getItem(todayKey)) || [];
      if (!todayActivities.includes(activityName)) {
        todayActivities.push(activityName);
        await AsyncStorage.setItem(todayKey, JSON.stringify(todayActivities));
      }
      navigation.popToTop();
    } catch(e) {
      console.log("Error saving today's activity", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{activityName}</Text>

      <View style={{ width: "100%", marginTop: 20 }}>
        {instructions.map((step, index) => (
          <Text key={index} style={styles.instruction}>{index + 1}. {step}</Text>
        ))}
      </View>

      {isTimerActivity && (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isTimerActivity && (
        <TextInput
          style={styles.textInput}
          placeholder="Write your notes here..."
          multiline
          numberOfLines={5}
          value={note}
          onChangeText={setNote}
        />
      )}

      <TouchableOpacity
        style={styles.completeButton}
        onPress={markAsDone}
      >
        <Text style={styles.buttonText}>Mark as Done / Go Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Activities</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: "#fff", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  instruction: { fontSize: 16, marginBottom: 10 },
  timer: { fontSize: 48, color: "#2563eb", marginVertical: 20 },
  startButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 12, width: "60%", alignItems: "center" },
  completeButton: { backgroundColor: "#64748b", padding: 14, borderRadius: 12, marginTop: 20, width: "80%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  textInput: { width: "100%", borderWidth: 1, borderColor: "#64748b", borderRadius: 12, padding: 10, marginVertical: 20, textAlignVertical: "top" },
  backButton: { backgroundColor: "#f59e0b", padding: 14, borderRadius: 12, marginTop: 10, width: "60%", alignItems: "center" }
});