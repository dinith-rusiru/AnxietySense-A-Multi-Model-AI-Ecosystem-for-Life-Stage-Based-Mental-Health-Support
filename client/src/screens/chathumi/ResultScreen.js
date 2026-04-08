import React, { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* LOCAL DATE FUNCTION (FIX) */
const getToday = () => {
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2,"0");
const day = String(today.getDate()).padStart(2,"0");
return `${year}-${month}-${day}`;
};

export default function ResultScreen({ route, navigation }) {

const params = route.params || {};

const [resultData, setResultData] = useState({
questionnaire_score: null,
voice_score: null,
final_score: null,
anxiety_level: "Unknown",
emotion: "neutral",
});

useEffect(() => {

const loadResult = async () => {

try {

if (params.final_score !== undefined) {

const newResult = {
questionnaire_score: params.questionnaire_score ?? null,
voice_score: params.voice_score ?? null,
final_score: params.final_score ?? null,
anxiety_level: params.anxiety_level ?? "Unknown",
emotion: params.emotion ?? "neutral",
};

setResultData(newResult);

await AsyncStorage.setItem(
"latestResult",
JSON.stringify(newResult)
);

const today = getToday();

await AsyncStorage.setItem("anxietyLevel", newResult.anxiety_level);

const existing = await AsyncStorage.getItem("anxietyHistory");
const history = existing ? JSON.parse(existing) : [];

history.push({
level: newResult.anxiety_level,
date: today,
score: newResult.final_score,
});

await AsyncStorage.setItem("anxietyHistory", JSON.stringify(history));

} else {

const stored = await AsyncStorage.getItem("latestResult");

if (stored) {
setResultData(JSON.parse(stored));
}

}

} catch (error) {
console.log("Error loading result:", error);
}

};

loadResult();

}, []);

const {
questionnaire_score,
voice_score,
final_score,
anxiety_level,
emotion,
} = resultData;

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

<View style={styles.row}>

<View style={styles.smallCard}>
<Text style={styles.smallLabel}>Assessment Mode</Text>
<Text style={styles.smallValue}>{mode}</Text>
</View>

{voice_score !== null && (
<View style={styles.smallCard}>
<Text style={styles.smallLabel}>Detected Emotion</Text>
<Text style={styles.smallValue}>{emotion}</Text>
</View>
)}

</View>

<View style={styles.scoreCard}>
<Text style={styles.scoreLabel}>Final Anxiety Score</Text>
<Text style={styles.scoreValue}>{final_score ?? "N/A"}</Text>
</View>

<View style={styles.levelCard}>
<Text style={styles.levelLabel}>Predicted Anxiety Level</Text>
<Text style={styles.levelText}>{anxiety_level}</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Explanation</Text>

<Text style={styles.text}>
{explanations[anxiety_level] ||
"Your result was calculated using the available assessment data."}
</Text>

</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Suggested Activities</Text>

<View style={styles.activityList}>

{activities[anxiety_level]?.map((item, index) => (
<View key={index} style={styles.activityItem}>
<Text style={styles.activityDot}>•</Text>
<Text style={styles.activityTextItem}>{item}</Text>
</View>
))}

</View>

<TouchableOpacity
style={styles.activityBtn}
onPress={() =>
navigation.navigate("Activities", { anxiety_level })
}
>
<Text style={styles.activityText}>Start Activities</Text>
</TouchableOpacity>

</View>

<TouchableOpacity
style={styles.dashboardBtn}
onPress={() => navigation.navigate("Dashboard")}
>
<Text style={styles.dashboardText}>Go to Dashboard</Text>
</TouchableOpacity>

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

container:{
padding:22,
backgroundColor:"#F9F6FB"
},

title:{
fontSize:24,
fontWeight:"700",
textAlign:"center",
marginBottom:20,
color:"#3F3F46"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:16
},

smallCard:{
backgroundColor:"#FFFFFF",
borderRadius:18,
padding:16,
width:"48%",
shadowColor:"#000",
shadowOpacity:0.05,
shadowOffset:{width:0,height:4},
shadowRadius:6,
elevation:3
},

smallLabel:{
fontSize:12,
color:"#6B7280"
},

smallValue:{
fontSize:16,
fontWeight:"600",
marginTop:4,
color:"#374151"
},

scoreCard:{
backgroundColor:"#EEF2FF",
borderRadius:18,
padding:22,
alignItems:"center",
marginBottom:16
},

scoreLabel:{
fontSize:13,
color:"#6B7280"
},

scoreValue:{
fontSize:32,
fontWeight:"700",
color:"#6366F1",
marginTop:6
},

levelCard:{
backgroundColor:"#F2E7F9",
borderRadius:18,
padding:22,
alignItems:"center",
marginBottom:16
},

levelLabel:{
fontSize:13,
color:"#6B7280"
},

levelText:{
fontSize:22,
fontWeight:"700",
color:"#7B2CBF",
marginTop:6
},

card:{
backgroundColor:"#ffffff",
borderRadius:18,
padding:20,
marginBottom:16,
shadowColor:"#000",
shadowOpacity:0.05,
shadowOffset:{width:0,height:4},
shadowRadius:6,
elevation:3
},

sectionTitle:{
fontSize:17,
fontWeight:"600",
marginBottom:10,
color:"#374151"
},

text:{
fontSize:14,
lineHeight:21,
color:"#4B5563"
},

activityList:{
marginTop:6
},

activityItem:{
flexDirection:"row",
alignItems:"center",
marginBottom:6
},

activityDot:{
fontSize:16,
marginRight:6,
color:"#7B2CBF"
},

activityTextItem:{
fontSize:14,
color:"#374151"
},

activityBtn:{
marginTop:14,
backgroundColor:"#d946ef",
paddingVertical:13,
borderRadius:14,
alignItems:"center"
},

activityText:{
color:"#fff",
fontWeight:"600",
fontSize:15
},

dashboardBtn:{
marginTop:8,
backgroundColor:"#9333EA",
paddingVertical:13,
borderRadius:14,
alignItems:"center"
},

dashboardText:{
color:"#fff",
fontWeight:"600"
},

voiceBtn:{
marginTop:10,
backgroundColor:"#6B7280",
paddingVertical:13,
borderRadius:14,
alignItems:"center"
},

voiceText:{
color:"#fff",
fontWeight:"600"
}

});