import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { analyzeVoice } from "../../../api/api";

const SENTENCES = [
  "I feel calm and relaxed today.",
  "Sometimes I worry about my future.",
  "I feel supported by my family.",
  "I often think deeply about my emotions.",
  "Today has been an emotional day.",
];

export default function VoiceScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Microphone access is required.");
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
      setIsRecording(true);
      setRecordingUri(null);
      setResult(null);
      setErrorMessage(null);

      Alert.alert("Recording Started", "Please read the sentences displayed.");
    } catch (err) {
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      setLoading(true);

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);

      await sendToAPI(uri);
    } catch (err) {
      setErrorMessage("Failed to analyze voice.");
      setLoading(false);
    }
  };

  const pickAudio = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const file = res.assets[0];
      await sendToAPI(file.uri);
    } catch (err) {
      Alert.alert("Error", "Voice selection failed.");
    }
  };

  const sendToAPI = async (uri) => {
    try {
      setLoading(true);
      setResult(null);
      setErrorMessage(null);

      const response = await analyzeVoice(uri);
      const data = response.data;

      if (!data.success) {
        setErrorMessage(data.error || "Voice analysis failed.");
        return;
      }

      setResult(data);
    } catch (err) {
      setErrorMessage("Voice analysis failed. Check internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
    setRecordingUri(null);
    setErrorMessage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.dashboardLink}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Voice Anxiety Check</Text>
      <Text style={styles.subtitle}>
        Please read one of the sentences below clearly or upload a voice file.
      </Text>

      {/* SENTENCE CARD */}
      <View style={styles.card}>
        {SENTENCES.map((s, i) => (
          <Text key={i} style={styles.sentence}>  
            {i + 1}. {s}
          </Text>
        ))}
      </View>

      {!result && !loading && !errorMessage && (
        <>
          {!isRecording ? (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <Text style={styles.btnText}>🎤 Start Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <Text style={styles.btnText}>Stop & Analyze</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.uploadBtn} onPress={pickAudio}>
            <Text style={styles.btnText}>Upload Voice File</Text>
          </TouchableOpacity>
        </>
      )}

      {loading && <ActivityIndicator size="large" color="#e339e9f6" />}

      {errorMessage && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{errorMessage}</Text>

          <TouchableOpacity style={styles.tryAgainBtn} onPress={handleTryAgain}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Result</Text>

          <Text style={styles.resultText}>Gender: {result.gender}</Text>
          <Text style={styles.resultText}>Emotion: {result.emotion}</Text>

          <Text style={styles.resultText}>
            Voice Anxiety Score: {result.voice_anxiety_score}
          </Text>

          <Text style={styles.resultText}>
            Anxiety Level: {result.voice_anxiety_level}
          </Text>

          {/* ❌ BLOCK MALE */}
          {!result.is_allowed && (
            <Text style={{ color: "red", marginTop: 12, fontWeight: "600" }}>
              {result.message}
            </Text>
          )}

          {/* ✅ ONLY FEMALE CAN CONTINUE */}
          {result.is_allowed && (
            <>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() =>
                  navigation.navigate("Questionnaire", {
                    emotion: result.emotion,
                    voice_score: result.voice_anxiety_score,
                  })
                }
              >
                <Text style={styles.btnText}>Continue to Questionnaire</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resultScreenBtn}
                onPress={() =>
                  navigation.navigate("Result", {
                    emotion: result.emotion,
                    voice_score: result.voice_anxiety_score,
                    final_score: result.voice_anxiety_score,
                    anxiety_level: result.voice_anxiety_level,
                  })
                }
              >
                <Text style={styles.btnText}>Skip to Result</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FDF7FF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  back: {
    color: "#e339e9f6",
    fontWeight: "600",
    fontSize: 15,
  },

  dashboardLink: {
    color: "#7c3aed",
    fontWeight: "600",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#4b1d55",
    marginBottom: 6,
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  sentence: {
    fontSize: 14,
    marginVertical: 4,
    color: "#374151",
  },

  recordBtn: {
    backgroundColor: "#e339e9f6",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
  },

  stopBtn: {
    backgroundColor: "#f87171",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
  },

  uploadBtn: {
    backgroundColor: "#a855f7",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginTop: 15,
    elevation: 3,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#4b1d55",
  },

  resultText: {
    fontSize: 15,
    marginBottom: 8,
    color: "#374151",
  },

  continueBtn: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
  },

  resultScreenBtn: {
    backgroundColor: "#e339e9f6",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },

  errorCard: {
    backgroundColor: "#fde2ff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  errorTitle: {
    color: "#7e22ce",
    fontWeight: "600",
    marginBottom: 10,
  },

  tryAgainBtn: {
    backgroundColor: "#e339e9f6",
    padding: 12,
    borderRadius: 12,
  },
});