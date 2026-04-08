import React, { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
FlatList,
TouchableOpacity,
ScrollView,
Dimensions,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";

/* LOCAL DATE FIX */
const getToday = () => {
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
return `${year}-${month}-${day}`;
};

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen({ navigation }) {

const [activities, setActivities] = useState([]);
const [anxietyLevel, setAnxietyLevel] = useState("Unknown");
const [history, setHistory] = useState([]);
const [weekNumber, setWeekNumber] = useState(1);
const [lastAssessmentDate, setLastAssessmentDate] = useState(null);

const [trendMessage, setTrendMessage] = useState("");
const [activityInsight, setActivityInsight] = useState("");
const [wellnessScore, setWellnessScore] = useState(0);

const loadData = async () => {

try {

const activityData = await AsyncStorage.getItem("completedActivities");
const levelData = await AsyncStorage.getItem("anxietyLevel");
const historyData = await AsyncStorage.getItem("anxietyHistory");
const startDateData = await AsyncStorage.getItem("weekStartDate");

const parsedActivities = activityData ? JSON.parse(activityData) : [];
const parsedHistory = historyData ? JSON.parse(historyData) : [];

if (parsedHistory.length > 0) {
const last = parsedHistory[parsedHistory.length - 1];
setLastAssessmentDate(last.date);
}

/* Week Calculation */

let startDate = startDateData;

if (!startDate && parsedActivities.length > 0) {
startDate = parsedActivities[0].date;
await AsyncStorage.setItem("weekStartDate", startDate);
}

let week = 1;

if (startDate) {

const start = new Date(startDate);
const today = new Date(getToday());

const diffDays = Math.floor(
(today - start) / (1000 * 60 * 60 * 24)
);

week = Math.floor(diffDays / 7) + 1;

}

setActivities(parsedActivities);
setAnxietyLevel(levelData ?? "Not Tested");
setHistory(parsedHistory);
setWeekNumber(week);

/* Trend Insight */

const levelMap = {
"Minimal Anxiety": 1,
"Mild Anxiety": 2,
"Moderate Anxiety": 3,
"Severe Anxiety": 4,
};

if (parsedHistory.length >= 2) {

const last = levelMap[parsedHistory[parsedHistory.length - 1].level];
const previous = levelMap[parsedHistory[parsedHistory.length - 2].level];

if (last < previous) {
setTrendMessage("Your anxiety improved since the last assessment");
}
else if (last > previous) {
setTrendMessage("Your anxiety increased slightly since the last assessment");
}
else {
setTrendMessage("Your anxiety level is stable");
}

}

/* Activity Insight */

if (parsedActivities.length >= 3) {

const activeDays = new Set(parsedActivities.map(a => a.date)).size;

if (activeDays >= 3) {
setActivityInsight("Regular activities are helping maintain your mental wellness.");
}
else {
setActivityInsight("Try completing activities regularly to improve mental wellbeing.");
}

}

/* Wellness Score */

let score = 50;

const streak = new Set(parsedActivities.map(a => a.date)).size;

score += streak * 3;

if (levelData === "Minimal Anxiety") score += 25;
if (levelData === "Mild Anxiety") score += 10;
if (levelData === "Moderate Anxiety") score -= 10;
if (levelData === "Severe Anxiety") score -= 20;

score = Math.max(0, Math.min(100, score));

setWellnessScore(score);

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

/* Chart Data */

const levelMap = {
"Minimal Anxiety": 1,
"Mild Anxiety": 2,
"Moderate Anxiety": 3,
"Severe Anxiety": 4,
};

const chartLabels = history.map((item) => item.date.slice(5));
const chartValues = history.map((item) => levelMap[item.level] || 0);

return (

<ScrollView contentContainerStyle={styles.container}>

<Text style={styles.header}>Mental Wellness Dashboard</Text>

{/* Wellness Score */}

<View style={styles.scoreCard}>
<Text style={styles.scoreTitle}>Mental Wellness Score</Text>
<Text style={styles.scoreValue}>{wellnessScore}/100</Text>
</View>

{/* Anxiety Level */}

<View style={styles.levelCard}>

<Text style={styles.levelTitle}>Your Anxiety Level</Text>

<Text style={styles.levelValue}>{anxietyLevel}</Text>

{lastAssessmentDate && (
<Text style={styles.lastAssessment}>
Last assessment: {lastAssessmentDate}
</Text>
)}

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

{/* Scrollable Anxiety Trend Chart */}

{chartValues.length > 0 && (

<View style={styles.summaryCard}>

<Text style={styles.summaryTitle}>Anxiety Trend</Text>

<ScrollView horizontal showsHorizontalScrollIndicator={false}>

<LineChart
data={{
labels: chartLabels,
datasets: [{ data: chartValues }],
}}

width={Math.max(screenWidth - 40, chartLabels.length * 70)}

height={200}

chartConfig={{
backgroundGradientFrom: "#ffffff",
backgroundGradientTo: "#ffffff",
decimalPlaces: 0,
color: () => "#9333EA",
labelColor: () => "#6B7280",
propsForDots: {
r: "4",
strokeWidth: "2",
stroke: "#9333EA",
},
}}

bezier

style={{
marginTop: 10,
borderRadius: 16,
}}

/>

</ScrollView>

<Text style={styles.swipeText}>
Swipe to view full trend →
</Text>

</View>

)}

{/* Trend Insight */}

{trendMessage !== "" && (
<View style={styles.trendCard}>
<Text style={styles.trendText}>{trendMessage}</Text>
</View>
)}

{/* Activity Insight */}

{activityInsight !== "" && (
<View style={styles.insightCard}>
<Text style={styles.insightText}>{activityInsight}</Text>
</View>
)}

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

<TouchableOpacity
style={styles.mainBtn}
onPress={() => navigation.navigate("Activities")}
>
<Text style={styles.btnText}>Start Activities</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.resultBtn}
onPress={() => navigation.navigate("Result")}
>
<Text style={styles.btnText}>View Assessment Result</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.reassessBtn}
onPress={() => navigation.navigate("Voice")}
>
<Text style={styles.btnText}>Reassess Anxiety</Text>
</TouchableOpacity>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{padding:22,backgroundColor:"#FAF7FC",flexGrow:1},

header:{fontSize:24,fontWeight:"700",color:"#3F3F46",textAlign:"center",marginBottom:22},

scoreCard:{backgroundColor:"#EEF2FF",padding:20,borderRadius:18,alignItems:"center",marginBottom:20},

scoreTitle:{fontSize:14,color:"#6B7280"},

scoreValue:{fontSize:28,fontWeight:"700",color:"#4F46E5",marginTop:6},

levelCard:{backgroundColor:"#F4E8FB",padding:22,borderRadius:18,marginBottom:20,alignItems:"center"},

levelTitle:{color:"#6B7280",fontSize:14},

levelValue:{color:"#8A2BE2",fontSize:26,fontWeight:"700",marginTop:6},

lastAssessment:{marginTop:6,fontSize:12,color:"#6B7280"},

progressRow:{flexDirection:"row",justifyContent:"space-between",marginBottom:22},

progressCard:{backgroundColor:"#fff",width:"30%",padding:16,borderRadius:16,alignItems:"center",elevation:3},

progressNumber:{fontSize:24,fontWeight:"700",color:"#e339e9"},

progressText:{color:"#6B7280",fontSize:13,marginTop:3},

summaryCard:{backgroundColor:"#fff",borderRadius:18,padding:16,marginBottom:20,elevation:3},

summaryTitle:{fontSize:17,fontWeight:"600",marginBottom:10,color:"#374151"},

swipeText:{fontSize:12,color:"#9CA3AF",marginTop:6,textAlign:"right"},

trendCard:{backgroundColor:"#EEF2FF",padding:14,borderRadius:14,marginBottom:16,alignItems:"center"},

trendText:{fontSize:14,fontWeight:"600",color:"#4F46E5"},

insightCard:{backgroundColor:"#ECFDF5",padding:14,borderRadius:14,marginBottom:18,alignItems:"center"},

insightText:{fontSize:14,fontWeight:"600",color:"#059669"},

progressItem:{flexDirection:"row",justifyContent:"space-between",paddingVertical:6},

progressDate:{color:"#6B7280"},

progressLevel:{fontWeight:"600",color:"#9333EA"},

activityCard:{backgroundColor:"#F7F0FB",padding:12,borderRadius:12,marginBottom:8},

activityTitle:{fontWeight:"600",color:"#374151"},

activityType:{fontSize:13,color:"#6B7280"},

activityDate:{fontSize:12,color:"#9CA3AF"},

noActivity:{fontStyle:"italic",color:"#9CA3AF"},

mainBtn:{backgroundColor:"#e339e9",padding:14,borderRadius:14,alignItems:"center",marginBottom:10},

resultBtn:{backgroundColor:"#B66CF2",padding:14,borderRadius:14,alignItems:"center",marginBottom:10},

reassessBtn:{backgroundColor:"#6B7280",padding:14,borderRadius:14,alignItems:"center"},

btnText:{color:"#fff",fontWeight:"600",fontSize:15}

});