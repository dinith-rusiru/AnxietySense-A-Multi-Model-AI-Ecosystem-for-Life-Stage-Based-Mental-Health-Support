//ActivitiesScreen.js

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
description: "Use the 5-4-3-2-1 technique to regain calm and presence.",
duration: "4 min",
type: "grounding",
},
],
};


// Icons

const ACTIVITY_ICONS = {
journal: "📝",
breathing: "🌬️",
stretch: "🤸‍♀️",
meditation: "🧘‍♀️",
routine: "🌙",
support: "💬",
grounding: "🌿",
};


const LEVEL_MAP = {
"Minimal Anxiety": "Low",
"Mild Anxiety": "Moderate",
"Moderate Anxiety": "High",
"Severe Anxiety": "Severe",
};


export default function ActivitiesScreen({ navigation, route }) {

const [anxietyLevelFromResult, setAnxietyLevelFromResult] =
useState("Unknown");

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


// -------------------------------
// Card UI
// -------------------------------

const renderItem = ({ item }) => (

<View style={styles.card}>

<View style={styles.iconBox}>
<Text style={styles.icon}>{ACTIVITY_ICONS[item.type] || "✨"}</Text>
</View>

<View style={styles.content}>

<Text style={styles.title}>{item.title}</Text>

<Text style={styles.desc}>{item.description}</Text>

<View style={styles.footer}>

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

</View>

);


// -------------------------------
// Screen UI
// -------------------------------

return (

<SafeAreaView style={styles.container}>

<View style={styles.headerContainer}>

<View style={styles.navBar}>

<TouchableOpacity
style={styles.navButton}
onPress={() => navigation.goBack()}
>
<Text style={styles.navIcon}>←</Text>
<Text style={styles.navText}>Back</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.dashboardBtn}
onPress={() => navigation.navigate("Dashboard")}
>
<Text style={styles.dashboardText}>Dashboard</Text>
</TouchableOpacity>

</View>

<Text style={styles.header}>
Activities for {anxietyLevelFromResult}
</Text>

<Text style={styles.subHeader}>
Small guided activities designed to support your emotional wellbeing.
</Text>

</View>

<FlatList
data={data}
keyExtractor={(item) => item.id}
renderItem={renderItem}
showsVerticalScrollIndicator={false}
contentContainerStyle={styles.listContent}
/>

</SafeAreaView>

);

}


// -------------------------------
// Styles
// -------------------------------

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#FDF7FF",
paddingTop:18
},

headerContainer:{
paddingHorizontal:20,
marginBottom:20
},

navBar:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:18
},

navButton:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#F3E8FF",
paddingVertical:8,
paddingHorizontal:14,
borderRadius:14
},

navIcon:{
fontSize:15,
color:"#7e22ce",
marginRight:4
},

navText:{
fontSize:14,
color:"#7e22ce",
fontWeight:"600"
},

dashboardBtn:{
backgroundColor:"#E9D5FF",
paddingVertical:8,
paddingHorizontal:16,
borderRadius:14
},

dashboardText:{
color:"#6B21A8",
fontWeight:"600",
fontSize:14
},

header:{
fontSize:24,
fontWeight:"700",
color:"#4b1d55",
marginBottom:6
},

subHeader:{
fontSize:13,
color:"#6B7280",
lineHeight:20
},


// List padding

listContent:{
paddingBottom:40,
paddingTop:5
},


// Cards

card:{
flexDirection:"row",
backgroundColor:"#FFFFFF",
borderRadius:20,
padding:18,

marginHorizontal:20,   // LEFT & RIGHT spacing
marginBottom:16,       // space between cards

shadowColor:"#000",
shadowOpacity:0.06,
shadowOffset:{width:0,height:4},
shadowRadius:8,
elevation:3
},

iconBox:{
width:46,
height:46,
borderRadius:12,
backgroundColor:"#F3E8FF",
alignItems:"center",
justifyContent:"center",
marginRight:14
},

icon:{
fontSize:20
},

content:{
flex:1
},

title:{
fontSize:16,
fontWeight:"600",
color:"#374151"
},

desc:{
fontSize:13,
color:"#6B7280",
marginTop:4,
lineHeight:18
},

footer:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginTop:12
},

duration:{
fontSize:12,
color:"#a855f7",
fontWeight:"600"
},

startBtn:{
backgroundColor:"#d946ef",
paddingVertical:8,
paddingHorizontal:18,
borderRadius:14
},

startText:{
color:"#FFFFFF",
fontWeight:"600",
fontSize:13
}

});