import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import { useState } from "react";
import axios from "axios";

const BACKEND_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://10.0.2.2:8000";

const SENTENCES = [
  "I feel calm and relaxed today.",
  "Sometimes I worry about my future.",
  "I feel supported by my family.",
  "I often think deeply about my emotions.",
  "Today has been an emotional day.",
];

export default function VoiceScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  /* ======================
     START RECORDING
  ====================== */
  const startRecording = async () => {
    try {
      console.log("🎤 [Voice] Requesting microphone permission...");
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

      console.log("🎙️ [Voice] Recording started");
      setRecording(recording);
      setResult(null);
      setErrorMessage(null);
    } catch (err) {
      console.error("❌ [Voice] Start recording failed:", err);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  /* ======================
     STOP & ANALYZE
  ====================== */
  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log("⏹️ [Voice] Stopping recording...");
      setLoading(true);
      setErrorMessage(null);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      console.log("📁 [Voice] Audio file ready:", uri);
      await uploadAudio(uri);
    } catch (err) {
      console.error("❌ [Voice] Stop error:", err);
      setErrorMessage("Failed to analyze voice. Please try again.");
      setLoading(false);
    }
  };

  /* ======================
     UPLOAD AUDIO
  ====================== */
  const uploadAudio = async (uri) => {
    try {
      console.log("📤 [Voice] Uploading audio to backend...");

      let file;
      if (uri.startsWith("blob:")) {
        const response = await fetch(uri);
        const blob = await response.blob();
        file = new File([blob], "voice.wav", { type: "audio/wav" });
      } else {
        file = { uri, name: "voice.wav", type: "audio/wav" };
      }

      const formData = new FormData();
      formData.append("file", file);

      console.log("⚙️ [Voice] Backend analyzing voice...");
      const response = await axios.post(
        `${BACKEND_URL}/voice/analyze`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ [Voice] Analysis result:", response.data);

      /* ======================
         🔴 HANDLE ERRORS (DISPLAY IN UI)
      ====================== */
      if (response.data.success === false) {
        const errorMsg = response.data.error ||
          "Your voice was too low or unclear. Please try again.";
        setErrorMessage(errorMsg);
        setResult(null);
        return;
      }

      /* ======================
         ✅ SUCCESS
      ====================== */
      setResult(response.data);
      setErrorMessage(null);

    } catch (err) {
      console.error("❌ [Voice] Upload/analysis failed:", err);
      setErrorMessage("Could not analyze voice. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     TRY AGAIN BUTTON
  ====================== */
  const handleTryAgain = () => {
    setErrorMessage(null);
    setResult(null);
    setRecording(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate("Welcome")}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Voice Analysis</Text>
      <Text style={styles.subtitle}>Read ONE sentence clearly</Text>

      <View style={styles.card}>
        {SENTENCES.map((s, i) => (
          <Text key={i} style={styles.sentence}>
            {i + 1}. {s}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() =>
          navigation.navigate("Questionnaire", { emotion: "neutral" })
        }
      >
        <Text style={styles.btnText}>Continue without Voice Analysis</Text>
      </TouchableOpacity>

      {/* ======================
          ERROR MESSAGE DISPLAY
      ====================== */}
      {errorMessage && (
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Voice Analysis Failed</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.tryAgainBtn} onPress={handleTryAgain}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!result && !loading && !errorMessage && (
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

      {loading && (
        <Text style={styles.loadingText}>🔄 Analyzing your voice...</Text>
      )}

      {result && !loading && !errorMessage && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Result</Text>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{result.gender}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Emotion</Text>
            <Text style={styles.value}>{result.emotion}</Text>
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() =>
              navigation.navigate("Questionnaire", {
                emotion: result.emotion,
              })
            }
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

/* ======================
   STYLES
====================== */
const styles = StyleSheet.create({
  container: {
    padding: 22,
    flexGrow: 1,
    backgroundColor: "#F5F7FB",
  },
  backBtn: { marginBottom: 10 },
  backText: { color: "#e339e9f6", fontSize: 15 },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 18,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },
  sentence: {
    fontSize: 14,
    marginVertical: 4,
    color: "#374151",
  },
  skipBtn: {
    backgroundColor: "#9CA3AF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  recordBtn: {
    backgroundColor: "#24b443de",
    padding: 14,
    borderRadius: 12,
  },
  stopBtn: {
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 12,
  },
  continueBtn: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  tryAgainBtn: {
    backgroundColor: "#e339e9f6",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  btnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    color: "#374151",
  },
  errorCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
    lineHeight: 20,
  },
  resultCard: {
    marginTop: 20,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#16A34A",
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    color: "#6B7280",
    fontSize: 14,
  },
  value: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111827",
  },
});