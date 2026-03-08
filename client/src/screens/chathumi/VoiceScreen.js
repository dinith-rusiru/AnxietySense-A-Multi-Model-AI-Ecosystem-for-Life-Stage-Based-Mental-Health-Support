// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   Platform,
// } from "react-native";
// import { Audio } from "expo-av";
// import { useState } from "react";
// import axios from "axios";

// const BACKEND_URL =
//   Platform.OS === "web"
//     ? "http://localhost:8000"
//     : "http://10.0.2.2:8000";

// const SENTENCES = [
//   "I feel calm and relaxed today.",
//   "Sometimes I worry about my future.",
//   "I feel supported by my family.",
//   "I often think deeply about my emotions.",
//   "Today has been an emotional day.",
// ];

// export default function VoiceScreen({ navigation }) {
//   const [recording, setRecording] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   /* ======================
//      START RECORDING
//   ====================== */
//   const startRecording = async () => {
//     try {
//       console.log("🎤 [Voice] Requesting microphone permission...");
//       const permission = await Audio.requestPermissionsAsync();

//       if (!permission.granted) {
//         Alert.alert("Permission Required", "Microphone access is required.");
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       console.log("🎙️ [Voice] Recording started");
//       setRecording(recording);
//       setResult(null);
//       setErrorMessage(null);
//     } catch (err) {
//       console.error("❌ [Voice] Start recording failed:", err);
//       Alert.alert("Error", "Could not start recording.");
//     }
//   };

//   /* ======================
//      STOP & ANALYZE
//   ====================== */
//   const stopRecording = async () => {
//     if (!recording) return;

//     try {
//       console.log("⏹️ [Voice] Stopping recording...");
//       setLoading(true);
//       setErrorMessage(null);

//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);

//       console.log("📁 [Voice] Audio file ready:", uri);
//       await uploadAudio(uri);
//     } catch (err) {
//       console.error("❌ [Voice] Stop error:", err);
//       setErrorMessage("Failed to analyze voice. Please try again.");
//       setLoading(false);
//     }
//   };

//   /* ======================
//      UPLOAD AUDIO
//   ====================== */
//   const uploadAudio = async (uri) => {
//     try {
//       console.log("📤 [Voice] Uploading audio to backend...");

//       let file;
//       if (uri.startsWith("blob:")) {
//         const response = await fetch(uri);
//         const blob = await response.blob();
//         file = new File([blob], "voice.wav", { type: "audio/wav" });
//       } else {
//         file = { uri, name: "voice.wav", type: "audio/wav" };
//       }

//       const formData = new FormData();
//       formData.append("file", file);

//       console.log("⚙️ [Voice] Backend analyzing voice...");
//       const response = await axios.post(
//         `${BACKEND_URL}/voice/analyze`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       console.log("✅ [Voice] Analysis result:", response.data);

//       /* ======================
//          🔴 HANDLE ERRORS (DISPLAY IN UI)
//       ====================== */
//       if (response.data.success === false) {
//         const errorMsg = response.data.error ||
//           "Your voice was too low or unclear. Please try again.";
//         setErrorMessage(errorMsg);
//         setResult(null);
//         return;
//       }

//       /* ======================
//          ✅ SUCCESS
//       ====================== */
//       setResult(response.data);
//       setErrorMessage(null);

//     } catch (err) {
//       console.error("❌ [Voice] Upload/analysis failed:", err);
//       setErrorMessage("Could not analyze voice. Please check your connection and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ======================
//      TRY AGAIN BUTTON
//   ====================== */
//   const handleTryAgain = () => {
//     setErrorMessage(null);
//     setResult(null);
//     setRecording(null);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.navigate("Welcome")}
//       >
//         <Text style={styles.backText}>← Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>Voice Analysis</Text>
//       <Text style={styles.subtitle}>Read ONE sentence clearly</Text>

//       <View style={styles.card}>
//         {SENTENCES.map((s, i) => (
//           <Text key={i} style={styles.sentence}>
//             {i + 1}. {s}
//           </Text>
//         ))}
//       </View>

//       <TouchableOpacity
//         style={styles.skipBtn}
//         onPress={() =>
//           navigation.navigate("Questionnaire", { emotion: "neutral" })
//         }
//       >
//         <Text style={styles.btnText}>Continue without Voice Analysis</Text>
//       </TouchableOpacity>

//       {/* ======================
//           ERROR MESSAGE DISPLAY
//       ====================== */}
//       {errorMessage && (
//         <View style={styles.errorCard}>
//           <Text style={styles.errorIcon}>⚠️</Text>
//           <Text style={styles.errorTitle}>Voice Analysis Failed</Text>
//           <Text style={styles.errorMessage}>{errorMessage}</Text>
//           <TouchableOpacity style={styles.tryAgainBtn} onPress={handleTryAgain}>
//             <Text style={styles.btnText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {!result && !loading && !errorMessage && (
//         <>
//           {!recording ? (
//             <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//               <Text style={styles.btnText}>🎤 Start Recording</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//               <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
//             </TouchableOpacity>
//           )}
//         </>
//       )}

//       {loading && (
//         <Text style={styles.loadingText}>🔄 Analyzing your voice...</Text>
//       )}

//       {result && !loading && !errorMessage && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>

//           <View style={styles.resultRow}>
//             <Text style={styles.label}>Gender</Text>
//             <Text style={styles.value}>{result.gender}</Text>
//           </View>

//           <View style={styles.resultRow}>
//             <Text style={styles.label}>Emotion</Text>
//             <Text style={styles.value}>{result.emotion}</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Questionnaire", {
//                 emotion: result.emotion,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Continue</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// /* ======================
//    STYLES
// ====================== */
// const styles = StyleSheet.create({
//   container: {
//     padding: 22,
//     flexGrow: 1,
//     backgroundColor: "#F5F7FB",
//   },
//   backBtn: { marginBottom: 10 },
//   backText: { color: "#e339e9f6", fontSize: 15 },
//   title: {
//     fontSize: 24,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 4,
//   },
//   subtitle: {
//     textAlign: "center",
//     color: "#6B7280",
//     marginBottom: 18,
//     fontSize: 14,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     padding: 16,
//     borderRadius: 14,
//     marginBottom: 15,
//   },
//   sentence: {
//     fontSize: 14,
//     marginVertical: 4,
//     color: "#374151",
//   },
//   skipBtn: {
//     backgroundColor: "#9CA3AF",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 14,
//   },
//   recordBtn: {
//     backgroundColor: "#24b443de",
//     padding: 14,
//     borderRadius: 12,
//   },
//   stopBtn: {
//     backgroundColor: "#DC2626",
//     padding: 14,
//     borderRadius: 12,
//   },
//   continueBtn: {
//     backgroundColor: "#16A34A",
//     padding: 14,
//     borderRadius: 12,
//     marginTop: 14,
//   },
//   tryAgainBtn: {
//     backgroundColor: "#e339e9f6",
//     padding: 12,
//     borderRadius: 12,
//     marginTop: 12,
//   },
//   btnText: {
//     color: "#FFFFFF",
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: 15,
//   },
//   loadingText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#374151",
//   },
//   errorCard: {
//     marginTop: 20,
//     padding: 20,
//     backgroundColor: "#FEF2F2",
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: "#DC2626",
//     alignItems: "center",
//   },
//   errorIcon: {
//     fontSize: 40,
//     marginBottom: 10,
//   },
//   errorTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#DC2626",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   errorMessage: {
//     fontSize: 14,
//     color: "#991B1B",
//     textAlign: "center",
//     lineHeight: 20,
//   },
//   resultCard: {
//     marginTop: 20,
//     padding: 18,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: "#16A34A",
//   },
//   resultTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   resultRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 6,
//   },
//   label: {
//     color: "#6B7280",
//     fontSize: 14,
//   },
//   value: {
//     fontWeight: "600",
//     fontSize: 14,
//     color: "#111827",
//   },
// });


// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { analyzeVoice } from "../services/api";

// export default function VoiceScreen({ navigation }) {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const pickAudio = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//       });

//       if (res.canceled) return;

//       const file = res.assets[0];

//       setLoading(true);
//       const response = await analyzeVoice(file.uri);
//       const data = response.data;

//       if (!data.success) {
//         Alert.alert("Error", data.error);
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Voice analysis failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Anxiety Check</Text>

//       {/* Upload button */}
//       <TouchableOpacity style={styles.recordBtn} onPress={pickAudio}>
//         <Text style={styles.btnText}>Upload Voice</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#6C63FF" />}

//       {/* Result section */}
//       {result && (
//         <View style={styles.resultBox}>
//           <Text style={styles.resultText}>
//             Detected Emotion: {result.emotion}
//           </Text>

//           <Text style={styles.resultText}>
//             Voice Anxiety: {result.voice_anxiety_level}
//           </Text>

//           {/* Continue with voice */}
//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//                 mode: "voice_only",
//                 final_score: result.voice_anxiety_score,
//                 anxiety_level: result.voice_anxiety_level,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Continue with Voice</Text>
//           </TouchableOpacity>

//           {/* Optional questionnaire */}
//           <TouchableOpacity
//             style={styles.skipBtn}
//             onPress={() =>
//               navigation.navigate("Questionnaire", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//               })
//             }
//           >
//             <Text style={styles.btnText}>
//               Answer Questionnaire (Optional)
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F4F6FB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   recordBtn: {
//     backgroundColor: "#6C63FF",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   resultBox: {
//     marginTop: 20,
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//   },
//   resultText: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   continueBtn: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   skipBtn: {
//     backgroundColor: "#ff9800",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { analyzeVoice } from "../api/api";

// export default function VoiceScreen({ navigation }) {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const pickAudio = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//       });

//       if (res.canceled) return;

//       const file = res.assets[0];

//       setLoading(true);
//       const response = await analyzeVoice(file.uri);
//       const data = response.data;

//       if (!data.success) {
//         Alert.alert("Error", data.error || "Analysis failed");
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Voice analysis failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Anxiety Check</Text>

//       <TouchableOpacity style={styles.recordBtn} onPress={pickAudio}>
//         <Text style={styles.btnText}>Upload Voice</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#6C63FF" />}

//       {result && (
//         <View style={styles.resultBox}>
//           <Text style={styles.resultText}>
//             Detected Emotion: {result.emotion}
//           </Text>

//           <Text style={styles.resultText}>
//             Voice Anxiety: {result.voice_anxiety_level}
//           </Text>

//           {/* Voice only */}
//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//                 mode: "voice_only",
//                 final_score: result.voice_anxiety_score,
//                 anxiety_level: result.voice_anxiety_level,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Continue with Voice</Text>
//           </TouchableOpacity>

//           {/* Optional questionnaire */}
//           <TouchableOpacity
//             style={styles.skipBtn}
//             onPress={() =>
//               navigation.navigate("Questionnaire", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//               })
//             }
//           >
//             <Text style={styles.btnText}>
//               Answer Questionnaire (Optional)
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F4F6FB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   recordBtn: {
//     backgroundColor: "#6C63FF",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   resultBox: {
//     marginTop: 20,
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//   },
//   resultText: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   continueBtn: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   skipBtn: {
//     backgroundColor: "#ff9800",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { Audio } from "expo-av";
// import { analyzeVoice } from "../api/api";

// export default function VoiceScreen({ navigation, route }) {
//   const emotion = route?.params?.emotion;

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [recording, setRecording] = useState(null);
//   const [recordingUri, setRecordingUri] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);

//   // ==============================
//   // 🎤 START RECORDING
//   // ==============================
//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Microphone permission is needed.");
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//       setIsRecording(true);
//       setRecordingUri(null);
//       setResult(null);
//     } catch (err) {
//       console.log("Start recording error:", err);
//       Alert.alert("Error", "Could not start recording.");
//     }
//   };

//   // ==============================
//   // 🛑 STOP RECORDING
//   // ==============================
//   const stopRecording = async () => {
//     try {
//       if (!recording) return;

//       setIsRecording(false);
//       await recording.stopAndUnloadAsync();

//       const uri = recording.getURI();
//       setRecordingUri(uri);
//       setRecording(null);

//       Alert.alert("Recorded", "Voice recorded successfully.");
//     } catch (err) {
//       console.log("Stop recording error:", err);
//       Alert.alert("Error", "Could not stop recording.");
//     }
//   };

//   // ==============================
//   // 📤 UPLOAD RECORDED AUDIO
//   // ==============================
//   const uploadRecordedAudio = async () => {
//     if (!recordingUri) {
//       Alert.alert("No recording", "Please record your voice first.");
//       return;
//     }

//     await sendToAPI(recordingUri);
//   };

//   // ==============================
//   // 📂 PICK AUDIO FILE
//   // ==============================
//   const pickAudio = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//         copyToCacheDirectory: true,
//       });

//       if (res.canceled) return;

//       const file = res.assets[0];
//       await sendToAPI(file.uri);
//     } catch (err) {
//       console.log("Picker error:", err);
//       Alert.alert("Error", "Voice selection failed.");
//     }
//   };

//   // ==============================
//   // 🚀 SEND TO BACKEND
//   // ==============================
//   const sendToAPI = async (uri) => {
//     try {
//       setLoading(true);
//       setResult(null);

//       const response = await analyzeVoice(uri);
//       const data = response.data;

//       if (!data.success) {
//         Alert.alert("Error", data.error || "Analysis failed");
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.log("API error:", err?.response?.data || err.message);
//       Alert.alert("Error", "Voice analysis failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Anxiety Check</Text>

//       {/* 🎤 RECORD BUTTON */}
//       {!isRecording ? (
//         <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//           <Text style={styles.btnText}>Start Recording</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//           <Text style={styles.btnText}>Stop Recording</Text>
//         </TouchableOpacity>
//       )}

//       {/* 📤 Upload recorded voice */}
//       {recordingUri && (
//         <TouchableOpacity
//           style={styles.uploadBtn}
//           onPress={uploadRecordedAudio}
//         >
//           <Text style={styles.btnText}>Analyze Recorded Voice</Text>
//         </TouchableOpacity>
//       )}

//       {/* 📂 Upload existing file */}
//       <TouchableOpacity style={styles.pickBtn} onPress={pickAudio}>
//         <Text style={styles.btnText}>Upload Voice File</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#6C63FF" />}

//       {/* ✅ RESULT */}
//       {result && (
//         <View style={styles.resultBox}>
//           <Text style={styles.resultText}>
//             Detected Emotion: {result.emotion}
//           </Text>

//           <Text style={styles.resultText}>
//             Voice Anxiety: {result.voice_anxiety_level}
//           </Text>

//           {/* Continue */}
//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//                 mode: "voice_only",
//                 final_score: result.voice_anxiety_score,
//                 anxiety_level: result.voice_anxiety_level,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Continue with Voice</Text>
//           </TouchableOpacity>

//           {/* Questionnaire */}
//           <TouchableOpacity
//             style={styles.skipBtn}
//             onPress={() =>
//               navigation.navigate("Instruction", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//               })
//             }
//           >
//             <Text style={styles.btnText}>
//               Answer Questionnaire (Optional)
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// // ==============================
// // 🎨 STYLES
// // ==============================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F4F6FB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   recordBtn: {
//     backgroundColor: "#6C63FF",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   stopBtn: {
//     backgroundColor: "#e53935",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   uploadBtn: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: "center",
//   },
//   pickBtn: {
//     backgroundColor: "#ff9800",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   resultBox: {
//     marginTop: 20,
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//   },
//   resultText: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   continueBtn: {
//     backgroundColor: "#2e7d32",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   skipBtn: {
//     backgroundColor: "#ff9800",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { Audio } from "expo-av";
// import { analyzeVoice } from "../api/api";

// export default function VoiceScreen({ navigation, route }) {
//   const emotion = route?.params?.emotion;

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [recording, setRecording] = useState(null);
//   const [recordingUri, setRecordingUri] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);

//   // ✅ NEW — recording message
//   const recordingScript =
//     "Please say clearly: I feel calm and relaxed today.";

//   // ==============================
//   // 🎤 START RECORDING
//   // ==============================
//   const startRecording = async () => {
//     try {
//       // 🚫 Web cannot record via expo-av
//       if (Platform.OS === "web") {
//         Alert.alert(
//           "Not supported",
//           "Recording is not supported on web. Please use Upload."
//         );
//         return;
//       }

//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Microphone permission is needed.");
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//       setIsRecording(true);
//       setRecordingUri(null);
//       setResult(null);
//     } catch (err) {
//       console.log("Start recording error:", err);
//       Alert.alert("Error", "Could not start recording.");
//     }
//   };

//   // ==============================
//   // 🛑 STOP RECORDING
//   // ==============================
//   const stopRecording = async () => {
//     try {
//       if (!recording) return;

//       setIsRecording(false);
//       await recording.stopAndUnloadAsync();

//       const uri = recording.getURI();
//       console.log("Recorded URI:", uri);

//       setRecordingUri(uri);
//       setRecording(null);

//       Alert.alert("Recorded", "Voice recorded successfully.");
//     } catch (err) {
//       console.log("Stop recording error:", err);
//       Alert.alert("Error", "Could not stop recording.");
//     }
//   };

//   // ==============================
//   // 📤 UPLOAD RECORDED AUDIO
//   // ==============================
//   const uploadRecordedAudio = async () => {
//     if (!recordingUri) {
//       Alert.alert("No recording", "Please record your voice first.");
//       return;
//     }

//     await sendToAPI(recordingUri);
//   };

//   // ==============================
//   // 📂 PICK AUDIO FILE
//   // ==============================
//   const pickAudio = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//         copyToCacheDirectory: true,
//       });

//       if (res.canceled) return;

//       const file = res.assets[0];
//       await sendToAPI(file.uri);
//     } catch (err) {
//       console.log("Picker error:", err);
//       Alert.alert("Error", "Voice selection failed.");
//     }
//   };

//   // ==============================
//   // 🚀 SEND TO BACKEND
//   // ==============================
//   const sendToAPI = async (uri) => {
//     try {
//       setLoading(true);
//       setResult(null);

//       console.log("Sending audio:", uri);

//       const response = await analyzeVoice(uri);
//       const data = response.data;

//       console.log("API response:", data);

//       if (!data.success) {
//         Alert.alert("Error", data.error || "Analysis failed");
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.log("API error:", err?.response?.data || err.message);
//       Alert.alert("Error", "Voice analysis failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Anxiety Check</Text>

//       {/* ✅ SCRIPT TO READ */}
//       <View style={styles.scriptBox}>
//         <Text style={styles.scriptTitle}>Please read this:</Text>
//         <Text style={styles.scriptText}>{recordingScript}</Text>
//       </View>

//       {/* 🎤 RECORD BUTTON */}
//       {!isRecording ? (
//         <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//           <Text style={styles.btnText}>Start Recording</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//           <Text style={styles.btnText}>Stop Recording</Text>
//         </TouchableOpacity>
//       )}

//       {/* 🔴 Recording indicator */}
//       {isRecording && (
//         <Text style={styles.recordingText}>🔴 Recording in progress...</Text>
//       )}

//       {/* 📤 Upload recorded voice */}
//       {recordingUri && (
//         <TouchableOpacity
//           style={styles.uploadBtn}
//           onPress={uploadRecordedAudio}
//         >
//           <Text style={styles.btnText}>Analyze Recorded Voice</Text>
//         </TouchableOpacity>
//       )}

//       {/* 📂 Upload existing file */}
//       <TouchableOpacity style={styles.pickBtn} onPress={pickAudio}>
//         <Text style={styles.btnText}>Upload Voice File</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#6C63FF" />}

//       {/* ✅ RESULT */}
//       {result && (
//         <View style={styles.resultBox}>
//           <Text style={styles.resultText}>
//             Detected Emotion: {result.emotion}
//           </Text>

//           <Text style={styles.resultText}>
//             Voice Anxiety: {result.voice_anxiety_level}
//           </Text>

//           {/* Continue */}
//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//                 mode: "voice_only",
//                 final_score: result.voice_anxiety_score,
//                 anxiety_level: result.voice_anxiety_level,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Continue with Voice</Text>
//           </TouchableOpacity>

//           {/* Questionnaire */}
//           <TouchableOpacity
//             style={styles.skipBtn}
//             onPress={() =>
//               navigation.navigate("Instruction", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//               })
//             }
//           >
//             <Text style={styles.btnText}>
//               Answer Questionnaire (Optional)
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// // ==============================
// // 🎨 STYLES
// // ==============================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F4F6FB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   scriptBox: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   scriptTitle: {
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   scriptText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   recordingText: {
//     textAlign: "center",
//     color: "red",
//     marginBottom: 10,
//     fontWeight: "bold",
//   },
//   recordBtn: {
//     backgroundColor: "#6C63FF",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   stopBtn: {
//     backgroundColor: "#e53935",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   uploadBtn: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: "center",
//   },
//   pickBtn: {
//     backgroundColor: "#ff9800",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   resultBox: {
//     marginTop: 20,
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//   },
//   resultText: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   continueBtn: {
//     backgroundColor: "#2e7d32",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   skipBtn: {
//     backgroundColor: "#ff9800",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { Audio } from "expo-av";
// import * as DocumentPicker from "expo-document-picker";
// import { analyzeVoice } from "../api/api";

// const SENTENCES = [
//   "I feel calm and relaxed today.",
//   "Sometimes I worry about my future.",
//   "I feel supported by my family.",
//   "I often think deeply about my emotions.",
//   "Today has been an emotional day.",
// ];

// export default function VoiceScreen({ navigation }) {
//   const [recording, setRecording] = useState(null);
//   const [recordingUri, setRecordingUri] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);

//   // ======================
//   // START RECORDING
//   // ======================
//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Microphone access is required.");
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//       setIsRecording(true);
//       setRecordingUri(null);
//       setResult(null);
//       setErrorMessage(null);

//       Alert.alert("Recording Started", "Please read the sentences displayed on screen.");
//     } catch (err) {
//       console.log("Start recording error:", err);
//       Alert.alert("Error", "Could not start recording.");
//     }
//   };

//   // ======================
//   // STOP RECORDING
//   // ======================
//   const stopRecording = async () => {
//     if (!recording) return;

//     try {
//       setIsRecording(false);
//       setLoading(true);
//       await recording.stopAndUnloadAsync();

//       const uri = recording.getURI();
//       setRecordingUri(uri);
//       setRecording(null);

//       Alert.alert("Recorded", "Your voice was recorded successfully.");
//       await sendToAPI(uri);
//     } catch (err) {
//       console.log("Stop recording error:", err);
//       setErrorMessage("Failed to analyze recorded voice. Please try again.");
//       setLoading(false);
//     }
//   };

//   // ======================
//   // PICK AUDIO FILE
//   // ======================
//   const pickAudio = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//         copyToCacheDirectory: true,
//       });

//       if (res.canceled) return;
//       const file = res.assets[0];
//       await sendToAPI(file.uri);
//     } catch (err) {
//       console.log("Picker error:", err);
//       Alert.alert("Error", "Voice selection failed.");
//     }
//   };

//   // ======================
//   // UPLOAD / ANALYZE
//   // ======================
//   const sendToAPI = async (uri) => {
//     try {
//       setLoading(true);
//       setResult(null);
//       setErrorMessage(null);

//       const response = await analyzeVoice(uri);
//       const data = response.data;

//       if (!data.success) {
//         setErrorMessage(data.error || "Voice analysis failed. Try again.");
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.log("API error:", err?.response?.data || err.message);
//       setErrorMessage("Voice analysis failed. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTryAgain = () => {
//     setResult(null);
//     setRecordingUri(null);
//     setErrorMessage(null);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Voice Anxiety Check</Text>
//       <Text style={styles.subtitle}>Read one of the sentences below:</Text>

//       <View style={styles.card}>
//         {SENTENCES.map((s, i) => (
//           <Text key={i} style={styles.sentence}>
//             {i + 1}. {s}
//           </Text>
//         ))}
//       </View>

//       {!result && !loading && !errorMessage && (
//         <>
//           {!isRecording ? (
//             <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//               <Text style={styles.btnText}>🎤 Start Recording</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//               <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={styles.pickBtn} onPress={pickAudio}>
//             <Text style={styles.btnText}>📂 Upload Voice File</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {loading && <ActivityIndicator size="large" color="#6C63FF" />}

//       {errorMessage && (
//         <View style={styles.errorCard}>
//           <Text style={styles.errorTitle}>⚠️ {errorMessage}</Text>
//           <TouchableOpacity style={styles.tryAgainBtn} onPress={handleTryAgain}>
//             <Text style={styles.btnText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {result && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>
//           <Text style={styles.resultText}>Gender: {result.gender}</Text>
//           <Text style={styles.resultText}>Emotion: {result.emotion}</Text>
//           <Text style={styles.resultText}>
//             Voice Anxiety Score: {result.voice_anxiety_score}
//           </Text>
//           <Text style={styles.resultText}>
//             Anxiety Level: {result.voice_anxiety_level}
//           </Text>

//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Questionnaire", { emotion: result.emotion })
//             }
//           >
//             <Text style={styles.btnText}>Continue to Questionnaire</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.resultScreenBtn}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//                 final_score: result.voice_anxiety_score,
//                 anxiety_level: result.voice_anxiety_level,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Skip to Result</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// // ======================
// // STYLES
// // ======================
// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#F4F6FB" },
//   title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
//   subtitle: { textAlign: "center", marginBottom: 15, color: "#6B7280" },
//   card: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 20 },
//   sentence: { fontSize: 14, marginVertical: 3, color: "#374151" },
//   recordBtn: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 12, marginBottom: 10, alignItems: "center" },
//   stopBtn: { backgroundColor: "#DC2626", padding: 14, borderRadius: 12, marginBottom: 10, alignItems: "center" },
//   pickBtn: { backgroundColor: "#FF9800", padding: 14, borderRadius: 12, marginBottom: 10, alignItems: "center" },
//   resultCard: { padding: 18, backgroundColor: "#fff", borderRadius: 16, marginTop: 10 },
//   resultTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
//   resultText: { fontSize: 16, marginBottom: 8 },
//   continueBtn: { backgroundColor: "#2e7d32", padding: 14, borderRadius: 12, marginTop: 10, alignItems: "center" },
//   resultScreenBtn: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 12, marginTop: 10, alignItems: "center" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
//   errorCard: { backgroundColor: "#FEE2E2", borderRadius: 16, padding: 18, marginTop: 10, alignItems: "center" },
//   errorTitle: { color: "#DC2626", fontWeight: "600", fontSize: 16, marginBottom: 8 },
//   tryAgainBtn: { backgroundColor: "#6C63FF", padding: 12, borderRadius: 12, alignItems: "center" },
// });

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { Audio } from "expo-av";
// import * as DocumentPicker from "expo-document-picker";
// import { analyzeVoice } from "../api/api";

// const SENTENCES = [
//   "I feel calm and relaxed today.",
//   "Sometimes I worry about my future.",
//   "I feel supported by my family.",
//   "I often think deeply about my emotions.",
//   "Today has been an emotional day.",
// ];

// export default function VoiceScreen({ navigation }) {
//   const [recording, setRecording] = useState(null);
//   const [recordingUri, setRecordingUri] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);

//   // ======================
//   // START RECORDING
//   // ======================
//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Microphone access is required.");
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//       setIsRecording(true);
//       setRecordingUri(null);
//       setResult(null);
//       setErrorMessage(null);

//       Alert.alert("Recording Started", "Please read the sentences displayed on screen.");
//     } catch (err) {
//       console.log("Start recording error:", err);
//       Alert.alert("Error", "Could not start recording.");
//     }
//   };

//   // ======================
//   // STOP RECORDING
//   // ======================
//   const stopRecording = async () => {
//     if (!recording) return;

//     try {
//       setIsRecording(false);
//       setLoading(true);
//       await recording.stopAndUnloadAsync();

//       const uri = recording.getURI();
//       setRecordingUri(uri);
//       setRecording(null);

//       Alert.alert("Recorded", "Your voice was recorded successfully.");
//       await sendToAPI(uri);
//     } catch (err) {
//       console.log("Stop recording error:", err);
//       setErrorMessage("Failed to analyze recorded voice. Please try again.");
//       setLoading(false);
//     }
//   };

//   // ======================
//   // PICK AUDIO FILE
//   // ======================
//   const pickAudio = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//         copyToCacheDirectory: true,
//       });

//       if (res.canceled) return;
//       const file = res.assets[0];
//       await sendToAPI(file.uri);
//     } catch (err) {
//       console.log("Picker error:", err);
//       Alert.alert("Error", "Voice selection failed.");
//     }
//   };

//   // ======================
//   // UPLOAD / ANALYZE
//   // ======================
//   const sendToAPI = async (uri) => {
//     try {
//       setLoading(true);
//       setResult(null);
//       setErrorMessage(null);

//       const response = await analyzeVoice(uri);
//       const data = response.data;

//       if (!data.success) {
//         setErrorMessage(data.error || "Voice analysis failed. Try again.");
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.log("API error:", err?.response?.data || err.message);
//       setErrorMessage("Voice analysis failed. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTryAgain = () => {
//     setResult(null);
//     setRecordingUri(null);
//     setErrorMessage(null);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* 🔹 NEW HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.back}>← Back</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
//           <Text style={styles.dashboardLink}>Dashboard</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.title}>Voice Anxiety Check</Text>
//       <Text style={styles.subtitle}>Read one of the sentences below:</Text>

//       <View style={styles.card}>
//         {SENTENCES.map((s, i) => (
//           <Text key={i} style={styles.sentence}>
//             {i + 1}. {s}
//           </Text>
//         ))}
//       </View>

//       {!result && !loading && !errorMessage && (
//         <>
//           {!isRecording ? (
//             <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//               <Text style={styles.btnText}>🎤 Start Recording</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//               <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={styles.pickBtn} onPress={pickAudio}>
//             <Text style={styles.btnText}>📂 Upload Voice File</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {loading && <ActivityIndicator size="large" color="#6C63FF" />}

//       {errorMessage && (
//         <View style={styles.errorCard}>
//           <Text style={styles.errorTitle}>⚠️ {errorMessage}</Text>
//           <TouchableOpacity style={styles.tryAgainBtn} onPress={handleTryAgain}>
//             <Text style={styles.btnText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {result && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>
//           <Text style={styles.resultText}>Gender: {result.gender}</Text>
//           <Text style={styles.resultText}>Emotion: {result.emotion}</Text>
//           <Text style={styles.resultText}>
//             Voice Anxiety Score: {result.voice_anxiety_score}
//           </Text>
//           <Text style={styles.resultText}>
//             Anxiety Level: {result.voice_anxiety_level}
//           </Text>

//           {/* ✅ FIXED — PASS voice_score */}
//           <TouchableOpacity
//             style={styles.continueBtn}
//             onPress={() =>
//               navigation.navigate("Questionnaire", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Continue to Questionnaire</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.resultScreenBtn}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion: result.emotion,
//                 voice_score: result.voice_anxiety_score,
//                 final_score: result.voice_anxiety_score,
//                 anxiety_level: result.voice_anxiety_level,
//               })
//             }
//           >
//             <Text style={styles.btnText}>Skip to Result</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// // ======================
// // STYLES (ONLY NEW ADDED)
// // ======================
// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#F4F6FB" },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   back: {
//     color: "#6C63FF",
//     fontWeight: "600",
//   },
//   dashboardLink: {
//     color: "#22C55E",
//     fontWeight: "600",
//   },

//   title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
//   subtitle: { textAlign: "center", marginBottom: 15, color: "#6B7280" },
//   card: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 20 },
//   sentence: { fontSize: 14, marginVertical: 3, color: "#374151" },
//   recordBtn: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 12, marginBottom: 10, alignItems: "center" },
//   stopBtn: { backgroundColor: "#DC2626", padding: 14, borderRadius: 12, marginBottom: 10, alignItems: "center" },
//   pickBtn: { backgroundColor: "#FF9800", padding: 14, borderRadius: 12, marginBottom: 10, alignItems: "center" },
//   resultCard: { padding: 18, backgroundColor: "#fff", borderRadius: 16, marginTop: 10 },
//   resultTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
//   resultText: { fontSize: 16, marginBottom: 8 },
//   continueBtn: { backgroundColor: "#2e7d32", padding: 14, borderRadius: 12, marginTop: 10, alignItems: "center" },
//   resultScreenBtn: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 12, marginTop: 10, alignItems: "center" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
//   errorCard: { backgroundColor: "#FEE2E2", borderRadius: 16, padding: 18, marginTop: 10, alignItems: "center" },
//   errorTitle: { color: "#DC2626", fontWeight: "600", fontSize: 16, marginBottom: 8 },
//   tryAgainBtn: { backgroundColor: "#6C63FF", padding: 12, borderRadius: 12, alignItems: "center" },
// });

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
        Please read one of the sentences below clearly.
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