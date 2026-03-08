// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Helper to get formatted date
// const getToday = () => new Date().toISOString().split("T")[0];

// // Helper to get last 7 days
// const getLast7Days = () => {
//   const dates = [];
//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     dates.push(d.toISOString().split("T")[0]);
//   }
//   return dates;
// };

// export default function DashboardScreen({ navigation }) {
//   const [activities, setActivities] = useState([]);

//   const loadActivities = async () => {
//     try {
//       const data = await AsyncStorage.getItem("completedActivities");
//       const parsed = data ? JSON.parse(data) : [];
//       setActivities(parsed);
//     } catch (err) {
//       console.log("Error loading activities:", err);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadActivities();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // ---------------- DAILY / WEEKLY STATS ----------------
//   const today = getToday();
//   const last7Days = getLast7Days();

//   const dailyActivities = activities.filter((a) => a.date === today);
//   const weeklyActivities = activities.filter((a) =>
//     last7Days.includes(a.date)
//   );

//   const renderItem = ({ item }) => (
//     <View style={styles.activityCard}>
//       <Text style={styles.activityTitle}>{item.title}</Text>
//       <Text style={styles.activityType}>Type: {item.type}</Text>
//       <Text style={styles.activityDate}>Completed on: {item.date}</Text>
//     </View>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Dashboard</Text>

//       {/* ================= DAILY SUMMARY ================= */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Today's Progress ({today})</Text>
//         <Text style={styles.summaryText}>
//           Completed Activities: {dailyActivities.length}
//         </Text>
//         {dailyActivities.length > 0 ? (
//           <FlatList
//             data={dailyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//             contentContainerStyle={{ paddingTop: 8 }}
//           />
//         ) : (
//           <Text style={styles.noActivity}>No activities completed today.</Text>
//         )}
//       </View>

//       {/* ================= WEEKLY SUMMARY ================= */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Weekly Progress</Text>
//         <Text style={styles.summaryText}>
//           Activities Completed This Week: {weeklyActivities.length}
//         </Text>
//         {weeklyActivities.length > 0 ? (
//           <FlatList
//             data={weeklyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//             contentContainerStyle={{ paddingTop: 8 }}
//           />
//         ) : (
//           <Text style={styles.noActivity}>No activities completed this week.</Text>
//         )}
//       </View>

//       {/* ================= NAVIGATION BUTTONS ================= */}
//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Activities")}
//       >
//         <Text style={styles.dashboardText}>Go to Activities</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.dashboardBtn}
//         onPress={() => navigation.navigate("Result")}
//       >
//         <Text style={styles.dashboardText}>Back to Results</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// // ================= STYLES =================
// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#f4f6fb",
//     flexGrow: 1,
//   },
//   header: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#1e40af",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   summaryCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1e3a8a",
//     marginBottom: 8,
//   },
//   summaryText: {
//     fontSize: 16,
//     marginBottom: 12,
//     color: "#374151",
//   },
//   activityCard: {
//     backgroundColor: "#e0f2fe",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//   },
//   activityTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1e40af",
//   },
//   activityType: {
//     fontSize: 14,
//     color: "#334155",
//   },
//   activityDate: {
//     fontSize: 13,
//     color: "#475569",
//   },
//   noActivity: {
//     fontSize: 14,
//     color: "#6b7280",
//     fontStyle: "italic",
//   },
//   dashboardBtn: {
//     marginTop: 12,
//     backgroundColor: "#22c55e",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   dashboardText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const getToday = () => new Date().toISOString().split("T")[0];

// const getLast7Days = () => {
//   const dates = [];
//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     dates.push(d.toISOString().split("T")[0]);
//   }
//   return dates;
// };

// export default function DashboardScreen({ navigation }) {
//   const [activities, setActivities] = useState([]);
//   const [anxietyLevel, setAnxietyLevel] = useState("Unknown");

//   const loadData = async () => {
//     try {
//       const activityData = await AsyncStorage.getItem("completedActivities");
//       const levelData = await AsyncStorage.getItem("anxietyLevel");

//       const parsedActivities = activityData ? JSON.parse(activityData) : [];

//       setActivities(parsedActivities);
//       setAnxietyLevel(levelData ?? "Not Tested");
//     } catch (err) {
//       console.log("Error loading data:", err);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const today = getToday();
//   const last7Days = getLast7Days();

//   const dailyActivities = activities.filter((a) => a.date === today);
//   const weeklyActivities = activities.filter((a) =>
//     last7Days.includes(a.date)
//   );

//   const streak = new Set(activities.map((a) => a.date)).size;

//   const renderItem = ({ item }) => (
//     <View style={styles.activityCard}>
//       <Text style={styles.activityTitle}>{item.title}</Text>
//       <Text style={styles.activityType}>{item.type}</Text>
//       <Text style={styles.activityDate}>{item.date}</Text>
//     </View>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Mental Health Dashboard</Text>

//       {/* Anxiety Level Card */}
//       <View style={styles.levelCard}>
//         <Text style={styles.levelTitle}>Your Anxiety Level</Text>
//         <Text style={styles.levelValue}>{anxietyLevel}</Text>
//         <Text style={styles.levelHint}>
//           Continue doing activities to improve your mental health
//         </Text>
//       </View>

//       {/* Progress Cards */}
//       <View style={styles.progressRow}>
//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{dailyActivities.length}</Text>
//           <Text style={styles.progressText}>Today</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{weeklyActivities.length}</Text>
//           <Text style={styles.progressText}>This Week</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{streak}</Text>
//           <Text style={styles.progressText}>Streak</Text>
//         </View>
//       </View>

//       {/* Daily Activities */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Today's Activities</Text>

//         {dailyActivities.length > 0 ? (
//           <FlatList
//             data={dailyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//           />
//         ) : (
//           <Text style={styles.noActivity}>
//             No activities completed today
//           </Text>
//         )}
//       </View>

//       {/* Weekly Activities */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Weekly Activities</Text>

//         {weeklyActivities.length > 0 ? (
//           <FlatList
//             data={weeklyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//           />
//         ) : (
//           <Text style={styles.noActivity}>
//             No activities completed this week
//           </Text>
//         )}
//       </View>

//       {/* Navigation Buttons */}

//       <TouchableOpacity
//         style={styles.mainBtn}
//         onPress={() => navigation.navigate("Activities")}
//       >
//         <Text style={styles.btnText}>Start Activities</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.secondaryBtn}
//         onPress={() => navigation.navigate("Result")}
//       >
//         <Text style={styles.btnText}>Retake Anxiety Test</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#f3f6ff",
//     flexGrow: 1,
//   },

//   header: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#1e3a8a",
//     textAlign: "center",
//     marginBottom: 20,
//   },

//   levelCard: {
//     backgroundColor: "#4f46e5",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 20,
//   },

//   levelTitle: {
//     color: "#c7d2fe",
//     fontSize: 16,
//   },

//   levelValue: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "bold",
//     marginTop: 6,
//   },

//   levelHint: {
//     color: "#e0e7ff",
//     marginTop: 8,
//   },

//   progressRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },

//   progressCard: {
//     backgroundColor: "#ffffff",
//     width: "30%",
//     padding: 15,
//     borderRadius: 14,
//     alignItems: "center",
//     elevation: 3,
//   },

//   progressNumber: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1e40af",
//   },

//   progressText: {
//     color: "#6b7280",
//   },

//   summaryCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },

//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   activityCard: {
//     backgroundColor: "#eef2ff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 8,
//   },

//   activityTitle: {
//     fontWeight: "600",
//     fontSize: 15,
//   },

//   activityType: {
//     fontSize: 13,
//     color: "#6b7280",
//   },

//   activityDate: {
//     fontSize: 12,
//     color: "#9ca3af",
//   },

//   noActivity: {
//     fontStyle: "italic",
//     color: "#9ca3af",
//   },

//   mainBtn: {
//     backgroundColor: "#22c55e",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   secondaryBtn: {
//     backgroundColor: "#3b82f6",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const getToday = () => new Date().toISOString().split("T")[0];

// const getLast7Days = () => {
//   const dates = [];
//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     dates.push(d.toISOString().split("T")[0]);
//   }
//   return dates;
// };

// export default function DashboardScreen({ navigation }) {
//   const [activities, setActivities] = useState([]);
//   const [anxietyLevel, setAnxietyLevel] = useState("Unknown");
//   const [history, setHistory] = useState([]);

//   const loadData = async () => {
//     try {
//       const activityData = await AsyncStorage.getItem("completedActivities");
//       const levelData = await AsyncStorage.getItem("anxietyLevel");
//       const historyData = await AsyncStorage.getItem("anxietyHistory");

//       const parsedActivities = activityData ? JSON.parse(activityData) : [];
//       const parsedHistory = historyData ? JSON.parse(historyData) : [];

//       setActivities(parsedActivities);
//       setAnxietyLevel(levelData ?? "Not Tested");
//       setHistory(parsedHistory);
//     } catch (err) {
//       console.log("Error loading data:", err);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const today = getToday();
//   const last7Days = getLast7Days();

//   const dailyActivities = activities.filter((a) => a.date === today);
//   const weeklyActivities = activities.filter((a) =>
//     last7Days.includes(a.date)
//   );

//   const streak = new Set(activities.map((a) => a.date)).size;

//   const renderItem = ({ item }) => (
//     <View style={styles.activityCard}>
//       <Text style={styles.activityTitle}>{item.title}</Text>
//       <Text style={styles.activityType}>{item.type}</Text>
//       <Text style={styles.activityDate}>{item.date}</Text>
//     </View>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Mental Health Dashboard</Text>

//       {/* Anxiety Level */}
//       <View style={styles.levelCard}>
//         <Text style={styles.levelTitle}>Your Anxiety Level</Text>
//         <Text style={styles.levelValue}>{anxietyLevel}</Text>
//       </View>

//       {/* Progress Numbers */}
//       <View style={styles.progressRow}>
//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{dailyActivities.length}</Text>
//           <Text style={styles.progressText}>Today</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{weeklyActivities.length}</Text>
//           <Text style={styles.progressText}>Week</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{streak}</Text>
//           <Text style={styles.progressText}>Streak</Text>
//         </View>
//       </View>

//       {/* Anxiety Progress */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Anxiety Progress</Text>

//         {history.length > 0 ? (
//           history.slice(-5).map((item, index) => (
//             <View key={index} style={styles.progressItem}>
//               <Text style={styles.progressDate}>{item.date}</Text>
//               <Text style={styles.progressLevel}>{item.level}</Text>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noActivity}>No previous records</Text>
//         )}
//       </View>

//       {/* Today Activities */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Today's Activities</Text>

//         {dailyActivities.length > 0 ? (
//           <FlatList
//             data={dailyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//           />
//         ) : (
//           <Text style={styles.noActivity}>
//             No activities completed today
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity
//         style={styles.mainBtn}
//         onPress={() => navigation.navigate("Activities")}
//       >
//         <Text style={styles.btnText}>Start Activities</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f3f6ff", flexGrow: 1 },

//   header: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#1e3a8a",
//     textAlign: "center",
//     marginBottom: 20,
//   },

//   levelCard: {
//     backgroundColor: "#4f46e5",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 20,
//   },

//   levelTitle: { color: "#c7d2fe", fontSize: 16 },

//   levelValue: { color: "#fff", fontSize: 28, fontWeight: "bold" },

//   progressRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },

//   progressCard: {
//     backgroundColor: "#fff",
//     width: "30%",
//     padding: 15,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   progressNumber: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1e40af",
//   },

//   progressText: { color: "#6b7280" },

//   summaryCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },

//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   progressItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 6,
//   },

//   progressDate: { color: "#6b7280" },

//   progressLevel: { fontWeight: "600", color: "#1e40af" },

//   activityCard: {
//     backgroundColor: "#eef2ff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 8,
//   },

//   activityTitle: { fontWeight: "600" },

//   activityType: { fontSize: 13, color: "#6b7280" },

//   activityDate: { fontSize: 12, color: "#9ca3af" },

//   noActivity: { fontStyle: "italic", color: "#9ca3af" },

//   mainBtn: {
//     backgroundColor: "#22c55e",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const getToday = () => new Date().toISOString().split("T")[0];

// const getLast7Days = () => {
//   const dates = [];
//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     dates.push(d.toISOString().split("T")[0]);
//   }
//   return dates;
// };

// export default function DashboardScreen({ navigation }) {
//   const [activities, setActivities] = useState([]);
//   const [anxietyLevel, setAnxietyLevel] = useState("Unknown");
//   const [history, setHistory] = useState([]);

//   const loadData = async () => {
//     try {
//       const activityData = await AsyncStorage.getItem("completedActivities");
//       const levelData = await AsyncStorage.getItem("anxietyLevel");
//       const historyData = await AsyncStorage.getItem("anxietyHistory");

//       const parsedActivities = activityData ? JSON.parse(activityData) : [];
//       const parsedHistory = historyData ? JSON.parse(historyData) : [];

//       setActivities(parsedActivities);
//       setAnxietyLevel(levelData ?? "Not Tested");
//       setHistory(parsedHistory);
//     } catch (err) {
//       console.log("Error loading data:", err);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const today = getToday();
//   const last7Days = getLast7Days();

//   const dailyActivities = activities.filter((a) => a.date === today);
//   const weeklyActivities = activities.filter((a) =>
//     last7Days.includes(a.date)
//   );

//   const streak = new Set(activities.map((a) => a.date)).size;

//   const renderItem = ({ item }) => (
//     <View style={styles.activityCard}>
//       <Text style={styles.activityTitle}>{item.title}</Text>
//       <Text style={styles.activityType}>{item.type}</Text>
//       <Text style={styles.activityDate}>{item.date}</Text>
//     </View>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Mental Health Dashboard</Text>

//       <View style={styles.levelCard}>
//         <Text style={styles.levelTitle}>Your Anxiety Level</Text>
//         <Text style={styles.levelValue}>{anxietyLevel}</Text>
//       </View>

//       <View style={styles.progressRow}>
//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{dailyActivities.length}</Text>
//           <Text style={styles.progressText}>Today</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{weeklyActivities.length}</Text>
//           <Text style={styles.progressText}>Week</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{streak}</Text>
//           <Text style={styles.progressText}>Streak</Text>
//         </View>
//       </View>

//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Anxiety Progress</Text>

//         {history.length > 0 ? (
//           history.slice(-5).map((item, index) => (
//             <View key={index} style={styles.progressItem}>
//               <Text style={styles.progressDate}>{item.date}</Text>
//               <Text style={styles.progressLevel}>{item.level}</Text>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noActivity}>No previous records</Text>
//         )}
//       </View>

//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Today's Activities</Text>

//         {dailyActivities.length > 0 ? (
//           <FlatList
//             data={dailyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//           />
//         ) : (
//           <Text style={styles.noActivity}>
//             No activities completed today
//           </Text>
//         )}
//       </View>

//       {/* Start Activities */}
//       <TouchableOpacity
//         style={styles.mainBtn}
//         onPress={() => navigation.navigate("Activities")}
//       >
//         <Text style={styles.btnText}>Start Activities</Text>
//       </TouchableOpacity>

//       {/* NEW BUTTON → RESULT SCREEN */}
//       <TouchableOpacity
//         style={styles.resultBtn}
//         onPress={() => navigation.navigate("Result")}
//       >
//         <Text style={styles.btnText}>Go to Result Screen</Text>
//       </TouchableOpacity>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f3f6ff", flexGrow: 1 },

//   header: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#1e3a8a",
//     textAlign: "center",
//     marginBottom: 20,
//   },

//   levelCard: {
//     backgroundColor: "#4f46e5",
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 20,
//   },

//   levelTitle: { color: "#c7d2fe", fontSize: 16 },

//   levelValue: { color: "#fff", fontSize: 28, fontWeight: "bold" },

//   progressRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },

//   progressCard: {
//     backgroundColor: "#fff",
//     width: "30%",
//     padding: 15,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   progressNumber: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1e40af",
//   },

//   progressText: { color: "#6b7280" },

//   summaryCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },

//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   progressItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 6,
//   },

//   progressDate: { color: "#6b7280" },

//   progressLevel: { fontWeight: "600", color: "#1e40af" },

//   activityCard: {
//     backgroundColor: "#eef2ff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 8,
//   },

//   activityTitle: { fontWeight: "600" },

//   activityType: { fontSize: 13, color: "#6b7280" },

//   activityDate: { fontSize: 12, color: "#9ca3af" },

//   noActivity: { fontStyle: "italic", color: "#9ca3af" },

//   mainBtn: {
//     backgroundColor: "#22c55e",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   resultBtn: {
//     backgroundColor: "#3b82f6",
//     padding: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const getToday = () => new Date().toISOString().split("T")[0];

// const getLast7Days = () => {
//   const dates = [];
//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     dates.push(d.toISOString().split("T")[0]);
//   }
//   return dates;
// };

// export default function DashboardScreen({ navigation }) {
//   const [activities, setActivities] = useState([]);
//   const [anxietyLevel, setAnxietyLevel] = useState("Unknown");
//   const [history, setHistory] = useState([]);

//   const loadData = async () => {
//     try {
//       const activityData = await AsyncStorage.getItem("completedActivities");
//       const levelData = await AsyncStorage.getItem("anxietyLevel");
//       const historyData = await AsyncStorage.getItem("anxietyHistory");

//       const parsedActivities = activityData ? JSON.parse(activityData) : [];
//       const parsedHistory = historyData ? JSON.parse(historyData) : [];

//       setActivities(parsedActivities);
//       setAnxietyLevel(levelData ?? "Not Tested");
//       setHistory(parsedHistory);
//     } catch (err) {
//       console.log("Error loading data:", err);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const today = getToday();
//   const last7Days = getLast7Days();

//   const dailyActivities = activities.filter((a) => a.date === today);
//   const weeklyActivities = activities.filter((a) =>
//     last7Days.includes(a.date)
//   );

//   const streak = new Set(activities.map((a) => a.date)).size;

//   const renderItem = ({ item }) => (
//     <View style={styles.activityCard}>
//       <Text style={styles.activityTitle}>{item.title}</Text>
//       <Text style={styles.activityType}>{item.type}</Text>
//       <Text style={styles.activityDate}>{item.date}</Text>
//     </View>
//   );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Mental Wellness Dashboard</Text>

//       {/* Anxiety Level Card */}
//       <View style={styles.levelCard}>
//         <Text style={styles.levelTitle}>Your Anxiety Level</Text>
//         <Text style={styles.levelValue}>{anxietyLevel}</Text>
//       </View>

//       {/* Progress Cards */}
//       <View style={styles.progressRow}>
//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{dailyActivities.length}</Text>
//           <Text style={styles.progressText}>Today</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{weeklyActivities.length}</Text>
//           <Text style={styles.progressText}>Week</Text>
//         </View>

//         <View style={styles.progressCard}>
//           <Text style={styles.progressNumber}>{streak}</Text>
//           <Text style={styles.progressText}>Streak</Text>
//         </View>
//       </View>

//       {/* Anxiety Progress */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Anxiety Progress</Text>

//         {history.length > 0 ? (
//           history.slice(-5).map((item, index) => (
//             <View key={index} style={styles.progressItem}>
//               <Text style={styles.progressDate}>{item.date}</Text>
//               <Text style={styles.progressLevel}>{item.level}</Text>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noActivity}>No previous records</Text>
//         )}
//       </View>

//       {/* Today's Activities */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Today's Activities</Text>

//         {dailyActivities.length > 0 ? (
//           <FlatList
//             data={dailyActivities}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id + item.date}
//           />
//         ) : (
//           <Text style={styles.noActivity}>
//             No activities completed today
//           </Text>
//         )}
//       </View>

//       {/* Start Activities */}
//       <TouchableOpacity
//         style={styles.mainBtn}
//         onPress={() => navigation.navigate("Activities")}
//       >
//         <Text style={styles.btnText}>Start Activities</Text>
//       </TouchableOpacity>

//       {/* Result Screen */}
//       <TouchableOpacity
//         style={styles.resultBtn}
//         onPress={() => navigation.navigate("Result")}
//       >
//         <Text style={styles.btnText}>View Assessment Result</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     backgroundColor: "#FAF7FC",
//     flexGrow: 1,
//   },

//   header: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#3F3F46",
//     textAlign: "center",
//     marginBottom: 22,
//   },

//   levelCard: {
//     backgroundColor: "#F4E8FB",
//     padding: 22,
//     borderRadius: 18,
//     marginBottom: 20,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E7C6F7",
//   },

//   levelTitle: {
//     color: "#6B7280",
//     fontSize: 14,
//   },

//   levelValue: {
//     color: "#8A2BE2",
//     fontSize: 26,
//     fontWeight: "700",
//     marginTop: 6,
//   },

//   progressRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 22,
//   },

//   progressCard: {
//     backgroundColor: "#ffffff",
//     width: "30%",
//     padding: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     elevation: 3,
//   },

//   progressNumber: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#e339e9",
//   },

//   progressText: {
//     color: "#6B7280",
//     fontSize: 13,
//     marginTop: 3,
//   },

//   summaryCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: 18,
//     padding: 18,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 5,
//     elevation: 2,
//   },

//   summaryTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//     marginBottom: 10,
//     color: "#374151",
//   },

//   progressItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 6,
//   },

//   progressDate: {
//     color: "#6B7280",
//   },

//   progressLevel: {
//     fontWeight: "600",
//     color: "#9333EA",
//   },

//   activityCard: {
//     backgroundColor: "#F7F0FB",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 8,
//   },

//   activityTitle: {
//     fontWeight: "600",
//     color: "#374151",
//   },

//   activityType: {
//     fontSize: 13,
//     color: "#6B7280",
//   },

//   activityDate: {
//     fontSize: 12,
//     color: "#9CA3AF",
//   },

//   noActivity: {
//     fontStyle: "italic",
//     color: "#9CA3AF",
//   },

//   mainBtn: {
//     backgroundColor: "#e339e9",
//     padding: 14,
//     borderRadius: 14,
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   resultBtn: {
//     backgroundColor: "#B66CF2",
//     padding: 14,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 15,
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getToday = () => new Date().toISOString().split("T")[0];

export default function DashboardScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [anxietyLevel, setAnxietyLevel] = useState("Unknown");
  const [history, setHistory] = useState([]);
  const [weekNumber, setWeekNumber] = useState(1);

  const loadData = async () => {
    try {
      const activityData = await AsyncStorage.getItem("completedActivities");
      const levelData = await AsyncStorage.getItem("anxietyLevel");
      const historyData = await AsyncStorage.getItem("anxietyHistory");
      const startDateData = await AsyncStorage.getItem("weekStartDate");

      const parsedActivities = activityData ? JSON.parse(activityData) : [];
      const parsedHistory = historyData ? JSON.parse(historyData) : [];

      // Set start date if not already
      let startDate = startDateData;
      if (!startDate && parsedActivities.length > 0) {
        startDate = parsedActivities[0].date;
        await AsyncStorage.setItem("weekStartDate", startDate);
      }

      // Calculate current week
      let week = 1;
      if (startDate) {
        const start = new Date(startDate);
        const today = new Date(getToday());
        const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        week = Math.floor(diffDays / 7) + 1;
      }

      setActivities(parsedActivities);
      setAnxietyLevel(levelData ?? "Not Tested");
      setHistory(parsedHistory);
      setWeekNumber(week);
    } catch (err) {
      console.log("Error loading data:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const today = getToday();

  const dailyActivities = activities.filter((a) => a.date === today);
  const streak = new Set(activities.map((a) => a.date)).size;

  const renderItem = ({ item }) => (
    <View style={styles.activityCard}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activityType}>{item.type}</Text>
      <Text style={styles.activityDate}>{item.date}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Mental Wellness Dashboard</Text>

      {/* Anxiety Level Card */}
      <View style={styles.levelCard}>
        <Text style={styles.levelTitle}>Your Anxiety Level</Text>
        <Text style={styles.levelValue}>{anxietyLevel}</Text>
      </View>

      {/* Progress Cards */}
      <View style={styles.progressRow}>
        <View style={styles.progressCard}>
          <Text style={styles.progressNumber}>{dailyActivities.length}</Text>
          <Text style={styles.progressText}>Today</Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressNumber}>{weekNumber}</Text>
          <Text style={styles.progressText}>Week</Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressNumber}>{streak}</Text>
          <Text style={styles.progressText}>Streak</Text>
        </View>
      </View>

      {/* Anxiety Progress */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Anxiety Progress</Text>

        {history.length > 0 ? (
          history.slice(-5).map((item, index) => (
            <View key={index} style={styles.progressItem}>
              <Text style={styles.progressDate}>{item.date}</Text>
              <Text style={styles.progressLevel}>{item.level}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noActivity}>No previous records</Text>
        )}
      </View>

      {/* Today's Activities */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Activities</Text>

        {dailyActivities.length > 0 ? (
          <FlatList
            data={dailyActivities}
            renderItem={renderItem}
            keyExtractor={(item) => item.id + item.date}
          />
        ) : (
          <Text style={styles.noActivity}>
            No activities completed today
          </Text>
        )}
      </View>

      {/* Start Activities */}
      <TouchableOpacity
        style={styles.mainBtn}
        onPress={() => navigation.navigate("Activities")}
      >
        <Text style={styles.btnText}>Start Activities</Text>
      </TouchableOpacity>

      {/* Result Screen */}
      <TouchableOpacity
        style={styles.resultBtn}
        onPress={() => navigation.navigate("Result")}
      >
        <Text style={styles.btnText}>View Assessment Result</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- Styles (same as your original) ---
const styles = StyleSheet.create({
  container: { padding: 22, backgroundColor: "#FAF7FC", flexGrow: 1 },
  header: { fontSize: 24, fontWeight: "700", color: "#3F3F46", textAlign: "center", marginBottom: 22 },
  levelCard: { backgroundColor: "#F4E8FB", padding: 22, borderRadius: 18, marginBottom: 20, alignItems: "center", borderWidth: 1, borderColor: "#E7C6F7" },
  levelTitle: { color: "#6B7280", fontSize: 14 },
  levelValue: { color: "#8A2BE2", fontSize: 26, fontWeight: "700", marginTop: 6 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  progressCard: { backgroundColor: "#ffffff", width: "30%", padding: 16, borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 3 },
  progressNumber: { fontSize: 24, fontWeight: "700", color: "#e339e9" },
  progressText: { color: "#6B7280", fontSize: 13, marginTop: 3 },
  summaryCard: { backgroundColor: "#ffffff", borderRadius: 18, padding: 18, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 2 },
  summaryTitle: { fontSize: 17, fontWeight: "600", marginBottom: 10, color: "#374151" },
  progressItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  progressDate: { color: "#6B7280" },
  progressLevel: { fontWeight: "600", color: "#9333EA" },
  activityCard: { backgroundColor: "#F7F0FB", padding: 12, borderRadius: 12, marginBottom: 8 },
  activityTitle: { fontWeight: "600", color: "#374151" },
  activityType: { fontSize: 13, color: "#6B7280" },
  activityDate: { fontSize: 12, color: "#9CA3AF" },
  noActivity: { fontStyle: "italic", color: "#9CA3AF" },
  mainBtn: { backgroundColor: "#e339e9", padding: 14, borderRadius: 14, alignItems: "center", marginBottom: 10 },
  resultBtn: { backgroundColor: "#B66CF2", padding: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});