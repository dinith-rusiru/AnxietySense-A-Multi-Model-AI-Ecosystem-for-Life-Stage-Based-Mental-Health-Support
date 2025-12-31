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

  /* ---------------------------
     🎤 Start Recording
  ---------------------------- */
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Microphone access is needed.");
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
    } catch (error) {
      console.log(error);
      Alert.alert("Failed to start recording");
    }
  };

  /* ---------------------------
     ⏹ Stop & Upload
  ---------------------------- */
  const stopRecording = async () => {
    try {
      setLoading(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await uploadAudio(uri);
    } catch (error) {
      console.log(error);
      Alert.alert("Recording error");
      setLoading(false);
    }
  };

  /* ---------------------------
     📤 Upload Audio
  ---------------------------- */
  const uploadAudio = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "voice.wav",
      type: "audio/wav",
    });

    try {
      const res = await axios.post(
        "http://10.0.2.2:8000/voice/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Voice analysis failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
  ============================ */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Voice Analysis</Text>
      <Text style={styles.subtitle}>
        Please read any ONE sentence clearly.
      </Text>

      <View style={styles.card}>
        {SENTENCES.map((sentence, index) => (
          <Text key={index} style={styles.sentence}>
            {index + 1}. {sentence}
          </Text>
        ))}
      </View>

      {!recording ? (
        <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
          <Text style={styles.btnText}>🎤 Start Recording</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
          <Text style={styles.btnText}>⏹ Stop & Analyze</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <Text style={styles.loadingText}>Analyzing your voice...</Text>
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Result</Text>

          <Text style={styles.resultText}>
            Gender Detected: <Text style={styles.bold}>{result.gender}</Text>
          </Text>

          {result.gender === "male" ? (
            <Text style={styles.errorText}>
              This application is designed exclusively for women.
            </Text>
          ) : (
            <>
              <Text style={styles.resultText}>
                Emotion Detected:{" "}
                <Text style={styles.bold}>{result.emotion || "Calm"}</Text>
              </Text>

              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigation.navigate("Instructions")}
              >
                <Text style={styles.btnText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    elevation: 2,
  },
  sentence: {
    fontSize: 15,
    color: "#374151",
    marginVertical: 6,
  },
  recordBtn: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  stopBtn: {
    backgroundColor: "#DC2626",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  continueBtn: {
    backgroundColor: "#16A34A",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    color: "#6B7280",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  resultText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
  },
  bold: {
    fontWeight: "700",
  },
  errorText: {
    marginTop: 10,
    color: "#DC2626",
    fontWeight: "600",
  },
});

// import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
// import { Audio } from "expo-av";
// import { useState } from "react";
// import { analyzeVoice } from "../api/api";

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
//     } catch (err) {
//       Alert.alert("Failed to start recording");
//     }
//   };

//   // ⏹ Stop & Analyze
//   const stopRecording = async () => {
//     try {
//       setLoading(true);
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);

//       const res = await analyzeVoice(uri);

//       // ❌ VALIDATION FIX
//       if (!res.data.success) {
//         Alert.alert("Voice Error", res.data.error);
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

//       {loading && <Text style={styles.loadingText}>Analyzing...</Text>}

//       {/* ✅ SHOW RESULT ONLY IF SUCCESS */}
//       {result?.success && (
//         <View style={styles.resultCard}>
//           <Text style={styles.resultTitle}>Analysis Result</Text>

//           <Text style={styles.resultText}>
//             Gender Detected: <Text style={styles.bold}>{result.gender}</Text>
//           </Text>

//           {result.gender === "male" && (
//             <Text style={styles.errorText}>
//               This application is designed exclusively for women.
//             </Text>
//           )}

//           {result.gender === "female" && (
//             <>
//               <Text style={styles.resultText}>
//                 Emotion Detected: <Text style={styles.bold}>{result.emotion}</Text>
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

// /* ---------------- STYLES ---------------- */

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
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 20,
//     color: "#6B7280",
//   },
//   card: {
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 25,
//   },
//   sentence: {
//     fontSize: 15,
//     marginVertical: 5,
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
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   loadingText: {
//     marginTop: 10,
//     textAlign: "center",
//   },
//   resultCard: {
//     backgroundColor: "#FFF",
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
