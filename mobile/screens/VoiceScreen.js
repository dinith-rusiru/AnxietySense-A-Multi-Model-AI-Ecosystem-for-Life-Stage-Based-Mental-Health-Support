import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import { Audio } from "expo-av";
import { useState } from "react";
import axios from "axios";

/* =============================
   BACKEND URL (AUTO FIX)
============================== */
const BACKEND_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://10.0.2.2:8000";

/* =============================
   SENTENCES
============================== */
const SENTENCES = [
  "I feel calm and relaxed today.",
  "Sometimes I worry about my future.",
  "I feel supported by my family.",
  "I often think deeply about my emotions.",
  "Today has been an emotional day."
];

export default function VoiceScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  /* =============================
     START RECORDING
  ============================== */
  const startRecording = async () => {
    try {
      console.log("🎤 Requesting microphone permission...");
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Microphone access is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setResult(null);
      console.log("✅ Recording started");
    } catch (err) {
      console.error("❌ Start recording error:", err);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  /* =============================
     STOP & ANALYZE
  ============================== */
  const stopRecording = async () => {
    try {
      if (!recording) return;

      setLoading(true);
      console.log("⏹ Stopping recording...");

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      console.log("📁 Audio URI:", uri);

      if (!uri) throw new Error("Recording URI missing");

      await uploadAudio(uri);
    } catch (err) {
      console.error("❌ Stop recording error:", err);
      setLoading(false);
      Alert.alert("Error", "Failed to analyze voice.");
    }
  };

  /* =============================
     UPLOAD AUDIO
  ============================== */
  const uploadAudio = async (uri) => {
  try {
    console.log("📤 Uploading audio to backend...");

    let file;

    // ✅ EXPO WEB FIX
    if (uri.startsWith("blob:")) {
      const response = await fetch(uri);
      const blob = await response.blob();

      file = new File([blob], "voice.wav", {
        type: "audio/wav",
      });
    } else {
      // Mobile (Android/iOS)
      file = {
        uri,
        name: "voice.wav",
        type: "audio/wav",
      };
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "http://localhost:8000/voice/analyze",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      }
    );

    console.log("✅ Backend response:", response.data);
    setResult(response.data);

  } catch (err) {
    console.error("❌ Upload error:", err);

    Alert.alert(
      "Analysis Failed",
      err.response?.data?.detail || err.message
    );
  } finally {
    setLoading(false);
  }
};


  /* =============================
     UI
  ============================== */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Voice Analysis</Text>
      <Text style={styles.subtitle}>
        Read ONE sentence clearly and loudly
      </Text>

      <View style={styles.card}>
        {SENTENCES.map((s, i) => (
          <Text key={i} style={styles.sentence}>
            {i + 1}. {s}
          </Text>
        ))}
      </View>

      {/* RECORD CONTROLS */}
      {!result && !loading && (
        <>
          {!recording ? (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <Text style={styles.btnText}>🎤 Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* LOADING */}
      {loading && (
        <Text style={styles.loadingText}>🔄 Analyzing your voice...</Text>
      )}

      {/* RESULT — ALWAYS DISPLAY */}
      {result && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Result</Text>

          <Text style={styles.resultText}>
            Gender: <Text style={styles.bold}>{result.gender}</Text>
          </Text>

          <Text style={styles.resultText}>
            Emotion: <Text style={styles.bold}>{result.emotion}</Text>
          </Text>

          {result.gender === "female" ? (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() =>
                navigation.navigate("Instructions", {
                emotion: result.emotion,
                })
              }

            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => setResult(null)}
            >
              <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* =============================
   STYLES
============================== */
const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: "#F3F4F6", flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: 20, color: "#555" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  sentence: { marginVertical: 5 },
  recordBtn: { backgroundColor: "#2563EB", padding: 15, borderRadius: 10 },
  stopBtn: { backgroundColor: "#DC2626", padding: 15, borderRadius: 10 },
  continueBtn: { backgroundColor: "#16A34A", padding: 15, borderRadius: 10, marginTop: 15 },
  retryBtn: { backgroundColor: "#6B7280", padding: 15, borderRadius: 10, marginTop: 15 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  loadingText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  resultCard: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginTop: 20 },
  resultTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  resultText: { fontSize: 16, marginVertical: 5 },
  bold: { fontWeight: "700" },
});
