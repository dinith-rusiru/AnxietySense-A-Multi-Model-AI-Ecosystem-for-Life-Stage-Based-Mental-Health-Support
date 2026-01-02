// import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
// import { Audio } from "expo-av";
// import { useState } from "react";
// import axios from "axios";

// const SENTENCES = [
//   "I feel calm and relaxed today.",
//   "Sometimes I worry about my future.",
//   "I feel supported by my family.",
//   "I often think deeply about my emotions.",
//   "Today has been an emotional day."
// ];

// export default function VoiceScreen({ navigation }) {
//   const [recording, setRecording] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   // 🎤 Start recording
//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Microphone permission required");
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
//     } catch (error) {
//       Alert.alert("Failed to start recording");
//     }
//   };

//   // ⏹ Stop & Upload
//   const stopRecording = async () => {
//     try {
//       setLoading(true);
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);
//       uploadAudio(uri);
//     } catch (error) {
//       Alert.alert("Recording error");
//       setLoading(false);
//     }
//   };

//   // 📤 Upload audio
//   const uploadAudio = async (uri) => {
//     const formData = new FormData();
//     formData.append("file", {
//       uri,
//       name: "voice.wav",
//       type: "audio/wav",
//     });

//     try {
//       const res = await axios.post(
//         "http://10.0.2.2:8000/voice/gender",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       setResult(res.data);
//     } catch (error) {
//       Alert.alert("Voice analysis failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
      
//       {/* Header */}
//       <Text style={styles.title}>Voice Analysis</Text>
//       <Text style={styles.subtitle}>
//         Please read any ONE sentence clearly. Your voice will be analyzed.
//       </Text>

//       {/* Sentences */}
//       <View style={styles.card}>
//         {SENTENCES.map((sentence, index) => (
//           <Text key={index} style={styles.sentence}>
//             {index + 1}. {sentence}
//           </Text>
//         ))}
//       </View>

//       {/* Recording Button */}
//       {!recording ? (
//         <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//           <Text style={styles.btnText}>🎤 Start Recording</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//           <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
//         </TouchableOpacity>
//       )}

//       {/* Loading */}
//       {loading && (
//         <Text style={styles.loadingText}>Analyzing your voice...</Text>
//       )}

//       {/* Result */}
//       {result && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>

//           <Text style={styles.resultText}>
//             Gender Detected:{" "}
//             <Text style={styles.bold}>{result.gender}</Text>
//           </Text>

//           {result.gender === "male" ? (
//             <Text style={styles.errorText}>
//               This application is designed exclusively for women.
//             </Text>
//           ) : (
//             <>
//               <Text style={styles.resultText}>
//                 Emotion Detected:{" "}
//                 <Text style={styles.bold}>
//                   {result.emotion || "Calm"}
//                 </Text>
//               </Text>

//               <TouchableOpacity
//                 style={styles.continueBtn}
//                 onPress={() => navigation.navigate("Instructions")}
//               >
//                 <Text style={styles.btnText}>Continue</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 25,
//     backgroundColor: "#F9FAFB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#1F2937",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 25,
//     elevation: 2,
//   },
//   sentence: {
//     fontSize: 15,
//     color: "#374151",
//     marginVertical: 6,
//   },
//   recordBtn: {
//     backgroundColor: "#2563EB",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   stopBtn: {
//     backgroundColor: "#DC2626",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   continueBtn: {
//     backgroundColor: "#16A34A",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   btnText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loadingText: {
//     textAlign: "center",
//     marginTop: 10,
//     color: "#6B7280",
//   },
//   resultCard: {
//     backgroundColor: "#FFFFFF",
//     padding: 18,
//     borderRadius: 12,
//     marginTop: 20,
//     elevation: 2,
//   },
//   resultTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//     color: "#111827",
//   },
//   resultText: {
//     fontSize: 15,
//     color: "#374151",
//     marginBottom: 6,
//   },
//   bold: {
//     fontWeight: "700",
//   },
//   errorText: {
//     marginTop: 10,
//     color: "#DC2626",
//     fontWeight: "600",
//   },
// });

// import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
// import { Audio } from "expo-av";
// import { useState } from "react";
// import axios from "axios";

// const SENTENCES = [
//   "I feel calm and relaxed today.",
//   "Sometimes I worry about my future.",
//   "I feel supported by my family.",
//   "I often think deeply about my emotions.",
//   "Today has been an emotional day."
// ];

// export default function VoiceScreen({ navigation }) {
//   const [recording, setRecording] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   /* ---------------------------
//      🎤 Start Recording
//   ---------------------------- */
//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Microphone access is needed.");
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
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Failed to start recording");
//     }
//   };

//   /* ---------------------------
//      ⏹ Stop & Upload
//   ---------------------------- */
//   const stopRecording = async () => {
//     try {
//       setLoading(true);
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);
//       await uploadAudio(uri);
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Recording error");
//       setLoading(false);
//     }
//   };

//   /* ---------------------------
//      📤 Upload Audio
//   ---------------------------- */
//   const uploadAudio = async (uri) => {
//     const formData = new FormData();
//     formData.append("file", {
//       uri,
//       name: "voice.wav",
//       type: "audio/wav",
//     });

//     try {
//       const res = await axios.post(
//         "http://10.0.2.2:8000/voice/analyze",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setResult(res.data);
//     } catch (error) {
//       console.log(error.response?.data || error.message);
//       Alert.alert("Voice analysis failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===========================
//      UI
//   ============================ */
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Voice Analysis</Text>
//       <Text style={styles.subtitle}>
//         Please read any ONE sentence clearly.
//       </Text>

//       <View style={styles.card}>
//         {SENTENCES.map((sentence, index) => (
//           <Text key={index} style={styles.sentence}>
//             {index + 1}. {sentence}
//           </Text>
//         ))}
//       </View>

//       {!recording ? (
//         <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//           <Text style={styles.btnText}>🎤 Start Recording</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//           <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
//         </TouchableOpacity>
//       )}

//       {loading && (
//         <Text style={styles.loadingText}>Analyzing your voice...</Text>
//       )}

//       {result && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>

//           <Text style={styles.resultText}>
//             Gender Detected: <Text style={styles.bold}>{result.gender}</Text>
//           </Text>

//           {result.gender === "male" ? (
//             <Text style={styles.errorText}>
//               This application is designed exclusively for women.
//             </Text>
//           ) : (
//             <>
//               <Text style={styles.resultText}>
//                 Emotion Detected:{" "}
//                 <Text style={styles.bold}>{result.emotion || "Calm"}</Text>
//               </Text>

//               <TouchableOpacity
//                 style={styles.continueBtn}
//                 onPress={() => navigation.navigate("Instructions")}
//               >
//                 <Text style={styles.btnText}>Continue</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 25,
//     backgroundColor: "#F9FAFB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 10,
//     color: "#1F2937",
//   },
//   subtitle: {
//     fontSize: 14,
//     textAlign: "center",
//     color: "#6B7280",
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 25,
//     elevation: 2,
//   },
//   sentence: {
//     fontSize: 15,
//     color: "#374151",
//     marginVertical: 6,
//   },
//   recordBtn: {
//     backgroundColor: "#2563EB",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   stopBtn: {
//     backgroundColor: "#DC2626",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   continueBtn: {
//     backgroundColor: "#16A34A",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   btnText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loadingText: {
//     textAlign: "center",
//     marginTop: 10,
//     color: "#6B7280",
//   },
//   resultCard: {
//     backgroundColor: "#FFFFFF",
//     padding: 18,
//     borderRadius: 12,
//     marginTop: 20,
//     elevation: 2,
//   },
//   resultTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//     color: "#111827",
//   },
//   resultText: {
//     fontSize: 15,
//     color: "#374151",
//     marginBottom: 6,
//   },
//   bold: {
//     fontWeight: "700",
//   },
//   errorText: {
//     marginTop: 10,
//     color: "#DC2626",
//     fontWeight: "600",
//   },
// });

// import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
// import { Audio } from "expo-av";
// import { useState } from "react";
// import axios from "axios";

// const SENTENCES = [
//   "I feel calm and relaxed today.",
//   "Sometimes I worry about my future.",
//   "I feel supported by my family.",
//   "I often think deeply about my emotions.",
//   "Today has been an emotional day."
// ];

// export default function VoiceScreen({ navigation }) {
//   const [recording, setRecording] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   /* =============================
//      🎤 START RECORDING
//   ============================== */
//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Microphone permission required");
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
//       setResult(null);
//     } catch (err) {
//       Alert.alert("Failed to start recording");
//     }
//   };

//   /* =============================
//      ⏹ STOP & ANALYZE
//   ============================== */
//   const stopRecording = async () => {
//     try {
//       setLoading(true);

//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);

//       await uploadAudio(uri);
//     } catch (err) {
//       Alert.alert("Recording error");
//       setLoading(false);
//     }
//   };

//   /* =============================
//      📤 UPLOAD AUDIO
//   ============================== */
//   const uploadAudio = async (uri) => {
//     const formData = new FormData();

//     formData.append("file", {
//       uri,
//       name: "voice.wav",
//       type: "audio/wav",
//     });

//     try {
//       const res = await axios.post(
//         "http://10.0.2.2:8000/voice/analyze",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("Voice API Response:", res.data);

//       if (!res.data.success) {
//         Alert.alert(res.data.error || "Voice analysis failed");
//         setLoading(false);
//         return;
//       }

//       setResult(res.data);
//     } catch (err) {
//       Alert.alert("Voice analysis failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =============================
//      🧠 UI
//   ============================== */
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Voice Analysis</Text>
//       <Text style={styles.subtitle}>
//         Please read any ONE sentence clearly.
//       </Text>

//       <View style={styles.card}>
//         {SENTENCES.map((s, i) => (
//           <Text key={i} style={styles.sentence}>
//             {i + 1}. {s}
//           </Text>
//         ))}
//       </View>

//       {!recording ? (
//         <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
//           <Text style={styles.btnText}>🎤 Start Recording</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
//           <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
//         </TouchableOpacity>
//       )}

//       {loading && <Text style={styles.loadingText}>Analyzing your voice...</Text>}

//       {result && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>

//           <Text style={styles.resultText}>
//             Gender Detected: <Text style={styles.bold}>{result.gender}</Text>
//           </Text>

//           {!result.allowed ? (
//             <Text style={styles.errorText}>
//               This application is designed exclusively for women.
//             </Text>
//           ) : (
//             <>
//               <Text style={styles.resultText}>
//                 Emotion Detected:{" "}
//                 <Text style={styles.bold}>
//                   {result.emotion || "Calm"}
//                 </Text>
//               </Text>

//               <TouchableOpacity
//                 style={styles.continueBtn}
//                 onPress={() => navigation.navigate("Instructions")}
//               >
//                 <Text style={styles.btnText}>Continue</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// /* =============================
//    🎨 STYLES
// ============================== */
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 25,
//     backgroundColor: "#F9FAFB",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     textAlign: "center",
//     color: "#6B7280",
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 25,
//     elevation: 2,
//   },
//   sentence: {
//     fontSize: 15,
//     marginVertical: 6,
//   },
//   recordBtn: {
//     backgroundColor: "#2563EB",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   stopBtn: {
//     backgroundColor: "#DC2626",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   continueBtn: {
//     backgroundColor: "#16A34A",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   btnText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loadingText: {
//     textAlign: "center",
//     marginTop: 12,
//     color: "#6B7280",
//   },
//   resultCard: {
//     backgroundColor: "#FFFFFF",
//     padding: 18,
//     borderRadius: 12,
//     marginTop: 20,
//   },
//   resultTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//   },
//   resultText: {
//     fontSize: 15,
//     marginBottom: 6,
//   },
//   bold: {
//     fontWeight: "700",
//   },
//   errorText: {
//     marginTop: 10,
//     color: "#DC2626",
//     fontWeight: "600",
//   },
// });

import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Audio } from "expo-av";
import { useState } from "react";
import axios from "axios";

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
     🎤 START RECORDING
  ============================== */
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Microphone permission is required");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Use Android/iOS compatible settings
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setResult(null);
      console.log("Recording started");
    } catch (err) {
      console.error("Recording start error:", err);
      Alert.alert("Error", "Failed to start recording: " + err.message);
    }
  };

  /* =============================
     ⏹ STOP & ANALYZE
  ============================== */
  const stopRecording = async () => {
    if (!recording) {
      Alert.alert("Error", "No active recording");
      return;
    }

    try {
      setLoading(true);

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      console.log("Recording stopped. URI:", uri);

      if (!uri) {
        throw new Error("No recording URI");
      }

      await uploadAudio(uri);
    } catch (err) {
      console.error("Stop recording error:", err);
      Alert.alert("Error", "Failed to process recording: " + err.message);
      setLoading(false);
      setRecording(null);
    }
  };

  /* =============================
     📤 UPLOAD AUDIO
  ============================== */
  const uploadAudio = async (uri) => {
    try {
      console.log("Preparing to upload audio from:", uri);

      // Get file extension
      const fileExtension = uri.split('.').pop().toLowerCase();
      console.log("File extension:", fileExtension);

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: `recording.${fileExtension}`,
        type: `audio/${fileExtension}`,
      });

      console.log("Sending request to backend...");

      const response = await axios.post(
        "http://10.0.2.2:8000/voice/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      console.log("Backend response:", JSON.stringify(response.data, null, 2));

      if (!response.data) {
        throw new Error("Empty response from server");
      }

      if (response.data.success === false) {
        Alert.alert(
          "Analysis Failed",
          response.data.message || response.data.error || "Could not analyze voice"
        );
        setLoading(false);
        return;
      }

      // Success - set result
      console.log("Setting result state...");
      setResult(response.data);
      setLoading(false);

    } catch (err) {
      console.error("Upload error:", err);
      setLoading(false);

      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        Alert.alert(
          "Server Error",
          err.response.data?.message || err.response.data?.error || "Analysis failed"
        );
      } else if (err.request) {
        console.error("No response received");
        Alert.alert(
          "Network Error",
          "Cannot connect to server. Is the backend running?"
        );
      } else {
        Alert.alert("Error", err.message || "Upload failed");
      }
    }
  };

  /* =============================
     🧠 UI
  ============================== */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Voice Analysis</Text>
      <Text style={styles.subtitle}>
        Please read any ONE sentence clearly and loudly.
      </Text>

      <View style={styles.card}>
        {SENTENCES.map((s, i) => (
          <Text key={i} style={styles.sentence}>
            {i + 1}. {s}
          </Text>
        ))}
      </View>

      {/* Recording Controls - only show if no result */}
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

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔄 Analyzing your voice...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      )}

      {/* Results Display */}
      {result && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>✓ Analysis Complete</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Gender Detected:</Text>
            <Text style={[styles.infoValue, { color: result.gender === "female" ? "#16A34A" : "#DC2626" }]}>
              {result.gender === "female" ? "Female ♀" : "Male ♂"}
            </Text>
          </View>

          {result.emotion && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Emotion:</Text>
              <Text style={styles.infoValue}>
                {result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1)}
              </Text>
            </View>
          )}

          {!result.allowed ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Access Restricted</Text>
              <Text style={styles.errorMessage}>
                This application is designed exclusively for pregnant women and female users.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setResult(null);
                  setLoading(false);
                }}
              >
                <Text style={styles.btnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successMessage}>
                You can proceed with the anxiety assessment
              </Text>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigation.navigate("Instructions")}
              >
                <Text style={styles.btnText}>Continue to Assessment →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* =============================
   🎨 STYLES
============================== */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: "#F3F4F6",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sentence: {
    fontSize: 15,
    marginVertical: 7,
    color: "#374151",
    lineHeight: 22,
  },
  recordBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  stopBtn: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  continueBtn: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
  },
  retryBtn: {
    backgroundColor: "#6B7280",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingSubtext: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  errorBox: {
    marginTop: 15,
    padding: 20,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FCA5A5",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorTitle: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  errorMessage: {
    color: "#991B1B",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  successBox: {
    marginTop: 15,
    padding: 20,
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#86EFAC",
    alignItems: "center",
  },
  successIcon: {
    fontSize: 40,
    color: "#16A34A",
    marginBottom: 10,
  },
  successMessage: {
    color: "#065F46",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});