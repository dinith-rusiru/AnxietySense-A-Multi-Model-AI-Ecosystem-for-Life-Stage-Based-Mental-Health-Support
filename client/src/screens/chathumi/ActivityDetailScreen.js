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

/* LOCAL DATE FUNCTION (Fix timezone issue) */
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to save completed activity
const saveActivity = async (activity) => {
  try {

    const today = getToday();

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

    await AsyncStorage.setItem(
      "completedActivities",
      JSON.stringify(activities)
    );

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

  container:{
    flexGrow:1,
    padding:22,
    backgroundColor:"#ffffff"
  },

  backBtn:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:20
  },

  backText:{
    marginLeft:6,
    fontSize:16,
    fontWeight:"600",
    color:"#374151"
  },

  title:{
    fontSize:26,
    fontWeight:"700",
    color:"#111827",
    textAlign:"center",
    marginBottom:6
  },

  desc:{
    fontSize:15,
    color:"#6B7280",
    textAlign:"center",
    marginBottom:30
  },

  startBtn:{
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#e339e9f6",
    paddingVertical:14,
    borderRadius:30
  },

  startText:{
    color:"#fff",
    fontWeight:"600",
    marginLeft:6
  },

  activityCard:{
    marginTop:30,
    backgroundColor:"#ffffff",
    borderRadius:20,
    padding:30,
    alignItems:"center",
    borderWidth:1,
    borderColor:"#F1F5F9",
    shadowColor:"#000",
    shadowOpacity:0.04,
    shadowOffset:{width:0,height:4},
    shadowRadius:6,
    elevation:2
  },

  stepText:{
    fontSize:18,
    fontWeight:"600",
    color:"#111827",
    marginTop:20,
    marginBottom:14,
    textAlign:"center"
  },

  timerBadge:{
    backgroundColor:"#EEF2FF",
    paddingHorizontal:14,
    paddingVertical:6,
    borderRadius:20,
    marginBottom:20
  },

  timerText:{
    color:"#4F46E5",
    fontWeight:"600"
  },

  finishBtn:{
    backgroundColor:"#22C55E",
    paddingVertical:12,
    paddingHorizontal:26,
    borderRadius:25
  },

  finishText:{
    color:"#fff",
    fontWeight:"600"
  },

  journalCard:{
    backgroundColor:"#ffffff",
    padding:20,
    borderRadius:18,
    borderWidth:1,
    borderColor:"#F1F5F9"
  },

  journalInput:{
    height:150,
    borderWidth:1,
    borderColor:"#E5E7EB",
    borderRadius:14,
    padding:14,
    fontSize:15,
    marginBottom:16,
    textAlignVertical:"top",
    backgroundColor:"#FAFAFA"
  },

  breathCircle:{
    borderRadius:200,
    backgroundColor:"#C7D2FE",
    marginBottom:20
  }

});