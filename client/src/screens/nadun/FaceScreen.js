// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   Modal,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// export default function FaceScreen({ navigation }) {
//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const BASE_URL =
//     Platform.OS === "web"
//       ? "http://localhost:8000"
//       : "http://10.0.2.2:8000";

//   // Pick image from gallery
//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       Alert.alert("Permission required", "Gallery access is needed");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setEmotion("--");
//       setConfidence(null);
//     }
//   };

//   // Open webcam (Web-specific)
//   const openWebcam = async () => {
//     if (Platform.OS === "web") {
//       setShowCamera(true);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             width: { ideal: 640 },
//             height: { ideal: 480 },
//             facingMode: "user"
//           }
//         });
//         streamRef.current = stream;
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (error) {
//         console.error("Webcam error:", error);
//         Alert.alert("Error", "Cannot access webcam. Please check permissions and connection.");
//         setShowCamera(false);
//       }
//     } else {
//       // Mobile - use native camera
//       captureImageMobile();
//     }
//   };

//   // Capture from webcam (Web)
//   const captureFromWebcam = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(videoRef.current, 0, 0);
      
//       canvas.toBlob((blob) => {
//         const url = URL.createObjectURL(blob);
//         setImage(url);
//         setEmotion("--");
//         setConfidence(null);
//         closeWebcam();
//       }, "image/jpeg", 0.8);
//     }
//   };

//   // Close webcam
//   const closeWebcam = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     setShowCamera(false);
//   };

//   // Mobile camera capture
//   const captureImageMobile = async () => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();

//       if (!permission.granted) {
//         Alert.alert("Permission required", "Camera access is needed");
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.front,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setImage(result.assets[0].uri);
//         setEmotion("--");
//         setConfidence(null);
//       }
//     } catch (error) {
//       console.log("Camera error:", error);
//       Alert.alert("Error", "Failed to open camera");
//     }
//   };

//   const detectEmotion = async () => {
//     if (!image) {
//       Alert.alert("No Image", "Please select or capture an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         const blob = await fetch(image).then((r) => r.blob());
//         formData.append("file", blob, "face.jpg");
//       } else {
//         formData.append("file", {
//           uri: image,
//           name: "face.jpg",
//           type: "image/jpeg",
//         });
//       }

//       console.log("📡 Sending image to:", `${BASE_URL}/face/predict`);

//       //API CALL

//       const response = await fetch(`${BASE_URL}/face/predict`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       console.log("✅ Emotion response:", data);

//       setEmotion(data.emotion);
//       setConfidence(data.confidence);
//     } catch (error) {
//       console.log("❌ Emotion error:", error);
//       Alert.alert("Error", "Cannot connect to server");
//     }

//     setLoading(false);
//   };

//   // Webcam Modal (Web only)
//   const WebcamModal = () => {
//     if (Platform.OS !== "web") return null;

//     return (
//       <Modal
//         visible={showCamera}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeWebcam}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Capture from Webcam</Text>
            
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               style={{
//                 width: 640,
//                 height: 480,
//                 borderRadius: 12,
//                 backgroundColor: "#000",
//                 maxWidth: "90vw",
//                 maxHeight: "60vh",
//                 objectFit: "cover"
//               }}
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.captureButton]} 
//                 onPress={captureFromWebcam}
//               >
//                 <Text style={styles.modalButtonText}>📸 Capture</Text>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.cancelButton]} 
//                 onPress={closeWebcam}
//               >
//                 <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>✕ Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Face Emotion Detection</Text>

//       {image ? (
//         <Image source={{ uri: image }} style={styles.preview} />
//       ) : (
//         <View style={styles.placeholder}>
//           <Text style={{ color: "#94a3b8" }}>No image selected</Text>
//         </View>
//       )}

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
//           <Text style={styles.buttonText}>📁 Gallery</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
//           <Text style={styles.buttonText}>📷 Camera</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity 
//         style={[styles.button, { marginTop: 10 }]} 
//         onPress={detectEmotion}
//       >
//         <Text style={styles.buttonText}>Detect Emotion</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

//       <Text style={styles.result}>
//         Emotion: {emotion}
//         {confidence !== null && ` (${confidence}%)`}
//       </Text>

//       <TouchableOpacity
//         style={styles.nextButton}
//         onPress={() => navigation.navigate("Questionnaire", { emotion })}
//       >
//         <Text style={styles.nextText}>Continue</Text>
//       </TouchableOpacity>

//       {Platform.OS === "web" && <WebcamModal />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#020617",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     color: "#ffffff",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   preview: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     marginBottom: 15,
//   },
//   placeholder: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#334155",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     width: 300,
//     justifyContent: "space-between",
//   },
//   halfButton: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 145,
//     alignItems: "center",
//   },
//   button: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   buttonText: {
//     fontWeight: "bold",
//     color: "#020617",
//   },
//   result: {
//     color: "#ffffff",
//     fontSize: 18,
//     marginTop: 15,
//   },
//   nextButton: {
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//     padding: 12,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   nextText: {
//     color: "#38bdf8",
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     maxWidth: "95%",
//   },
//   modalTitle: {
//     color: "#ffffff",
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     marginTop: 20,
//     gap: 10,
//   },
//   modalButton: {
//     padding: 14,
//     borderRadius: 12,
//     minWidth: 120,
//     alignItems: "center",
//   },
//   captureButton: {
//     backgroundColor: "#38bdf8",
//   },
//   cancelButton: {
//     backgroundColor: "#1e293b",
//     borderWidth: 1,
//     borderColor: "#ef4444",
//   },
//   modalButtonText: {
//     fontWeight: "bold",
//     color: "#020617",
//     fontSize: 16,
//   },
// });

// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   Modal,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useNavigation } from "@react-navigation/native";

// /* =======================
//    EMOTION → HEURISTIC ANXIETY SCORE
// ======================= */
// const EMOTION_ANXIETY_SCORE = {
//   Angry: 60,
//   Disgust: 50,
//   Fear: 80,
//   Sad: 70,
//   Surprise: 40,
//   Happy: 10,
//   Neutral: 20,
// };

// /* =======================
//    UTILITY FUNCTIONS
// ======================= */
// const getAnxietyLevelFromScore = (score) => {
//   if (score <= 20) return "Normal";
//   if (score <= 40) return "Mild";
//   if (score <= 60) return "Moderate";
//   if (score <= 80) return "Severe";
//   return "Extremely Severe";
// };

// // Combine emotion and questionnaire scores
// const combineScores = (emotionScore, questionnaireScore = null) => {
//   let finalScore;

//   if (questionnaireScore !== null) {
//     const normalizedQ = (questionnaireScore / 63) * 100;
//     finalScore = 0.6 * normalizedQ + 0.4 * emotionScore;
//   } else {
//     finalScore = emotionScore;
//   }

//   return getAnxietyLevelFromScore(finalScore);
// };

// export default function FaceScreen() {
//   const navigation = useNavigation();

//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [emotionScore, setEmotionScore] = useState(null);
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const BASE_URL =
//     Platform.OS === "web" ? "http://localhost:8000" : "http://10.0.2.2:8000";

//   /* =======================
//      IMAGE PICK / CAMERA
//   ======================== */
//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert("Permission required", "Gallery access is needed");
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setEmotion("--");
//       setEmotionScore(null);
//       setConfidence(null);
//     }
//   };

//   const openWebcam = async () => {
//     if (Platform.OS === "web") {
//       setShowCamera(true);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;
//       } catch (error) {
//         console.error("Webcam error:", error);
//         Alert.alert("Error", "Cannot access webcam. Please check permissions.");
//         setShowCamera(false);
//       }
//     } else {
//       captureImageMobile();
//     }
//   };

//   const captureFromWebcam = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(videoRef.current, 0, 0);

//       canvas.toBlob((blob) => {
//         const url = URL.createObjectURL(blob);
//         setImage(url);
//         setEmotion("--");
//         setEmotionScore(null);
//         setConfidence(null);
//         closeWebcam();
//       }, "image/jpeg", 0.8);
//     }
//   };

//   const closeWebcam = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setShowCamera(false);
//   };

//   const captureImageMobile = async () => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Camera access is needed");
//         return;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.front,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setImage(result.assets[0].uri);
//         setEmotion("--");
//         setEmotionScore(null);
//         setConfidence(null);
//       }
//     } catch (error) {
//       console.log("Camera error:", error);
//       Alert.alert("Error", "Failed to open camera");
//     }
//   };

//   /* =======================
//      EMOTION DETECTION
//   ======================== */
//   const detectEmotion = async () => {
//     if (!image) {
//       Alert.alert("No Image", "Please select or capture an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       if (Platform.OS === "web") {
//         const blob = await fetch(image).then((r) => r.blob());
//         formData.append("file", blob, "face.jpg");
//       } else {
//         formData.append("file", { uri: image, name: "face.jpg", type: "image/jpeg" });
//       }

//       const response = await fetch(`${BASE_URL}/face/predict`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       setEmotion(data.emotion);
//       setConfidence(data.confidence);

//       const score = EMOTION_ANXIETY_SCORE[data.emotion] ?? 20;
//       setEmotionScore(score);

//       // Do NOT navigate, only update the detected emotion and score
//     } catch (error) {
//       console.log("❌ Emotion error:", error);
//       Alert.alert("Error", "Cannot connect to server");
//     }

//     setLoading(false);
//   };

//   /* =======================
//      WEBCAM MODAL (WEB ONLY)
//   ======================== */
//   const WebcamModal = () => {
//     if (Platform.OS !== "web") return null;
//     return (
//       <Modal visible={showCamera} transparent={true} animationType="fade" onRequestClose={closeWebcam}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Capture from Webcam</Text>
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               style={{
//                 width: 640,
//                 height: 480,
//                 borderRadius: 12,
//                 backgroundColor: "#000",
//                 maxWidth: "90vw",
//                 maxHeight: "60vh",
//                 objectFit: "cover",
//               }}
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={[styles.modalButton, styles.captureButton]} onPress={captureFromWebcam}>
//                 <Text style={styles.modalButtonText}>📸 Capture</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeWebcam}>
//                 <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>✕ Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Face Emotion Detection</Text>

//       {image ? (
//         <Image source={{ uri: image }} style={styles.preview} />
//       ) : (
//         <View style={styles.placeholder}>
//           <Text style={{ color: "#94a3b8" }}>No image selected</Text>
//         </View>
//       )}

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
//           <Text style={styles.buttonText}>📁 Gallery</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
//           <Text style={styles.buttonText}>📷 Camera</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={detectEmotion}>
//         <Text style={styles.buttonText}>Detect Emotion</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

//       <Text style={styles.result}>
//         Emotion: {emotion}
//         {confidence !== null && ` (${confidence}%)`}
//       </Text>

//       {emotionScore !== null && (
//         <Text style={styles.result}>Anxiety Score: {emotionScore}</Text>
//       )}

//       <TouchableOpacity
//         style={styles.nextButton}
//         onPress={() => navigation.navigate("Questionnaire", { emotion, emotionScore })}
//       >
//         <Text style={styles.nextText}>Continue</Text>
//       </TouchableOpacity>

//       {Platform.OS === "web" && <WebcamModal />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#020617", alignItems: "center", padding: 20 },
//   title: { color: "#ffffff", fontSize: 22, fontWeight: "bold", marginBottom: 15 },
//   preview: { width: 300, height: 380, borderRadius: 16, marginBottom: 15 },
//   placeholder: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#334155",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonRow: { flexDirection: "row", width: 300, justifyContent: "space-between" },
//   halfButton: { backgroundColor: "#38bdf8", padding: 14, borderRadius: 12, width: 145, alignItems: "center" },
//   button: { backgroundColor: "#38bdf8", padding: 14, borderRadius: 12, width: 300, alignItems: "center" },
//   buttonText: { fontWeight: "bold", color: "#020617" },
//   result: { color: "#ffffff", fontSize: 18, marginTop: 15 },
//   nextButton: { marginTop: 20, borderWidth: 1, borderColor: "#38bdf8", padding: 12, borderRadius: 12, width: 300, alignItems: "center" },
//   nextText: { color: "#38bdf8", fontWeight: "bold" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.9)", justifyContent: "center", alignItems: "center" },
//   modalContent: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, alignItems: "center", maxWidth: "95%" },
//   modalTitle: { color: "#ffffff", fontSize: 20, fontWeight: "bold", marginBottom: 15 },
//   modalButtons: { flexDirection: "row", marginTop: 20, gap: 10 },
//   modalButton: { padding: 14, borderRadius: 12, minWidth: 120, alignItems: "center" },
//   captureButton: { backgroundColor: "#38bdf8" },
//   cancelButton: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#ef4444" },
//   modalButtonText: { fontWeight: "bold", color: "#020617", fontSize: 16 },
// });



// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   Modal,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useNavigation } from "@react-navigation/native";

// /* =======================
//    EMOTION → HEURISTIC ANXIETY SCORE
// ======================= */
// const EMOTION_ANXIETY_SCORE = {
//   Angry: 60,
//   Disgust: 50,
//   Fear: 80,
//   Sad: 70,
//   Surprise: 40,
//   Happy: 10,
//   Neutral: 20,
// };

// /* =======================
//    UTILITY FUNCTIONS
// ======================= */
// const getAnxietyLevelFromScore = (score) => {
//   if (score <= 20) return "Normal";
//   if (score <= 40) return "Mild";
//   if (score <= 60) return "Moderate";
//   if (score <= 80) return "Severe";
//   return "Extremely Severe";
// };

// // Combine emotion and questionnaire scores
// const combineScores = (emotionScore, questionnaireScore = null) => {
//   let finalScore;

//   if (questionnaireScore !== null) {
//     // Normalize questionnaire score to 0-100
//     const normalizedQ = (questionnaireScore / 63) * 100;

//     // Weighted average: 0.6 questionnaire, 0.4 emotion
//     finalScore = 0.6 * normalizedQ + 0.4 * emotionScore;
//   } else {
//     finalScore = emotionScore;
//   }

//   return getAnxietyLevelFromScore(finalScore);
// };

// export default function FaceScreen() {
//   const navigation = useNavigation();

//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const [showNextOptions, setShowNextOptions] = useState(false);
//   const [emotionScoreState, setEmotionScoreState] = useState(null);

//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const BASE_URL =
//     Platform.OS === "web" ? "http://localhost:8000" : "http://10.0.2.2:8000";

//   /* =======================
//      IMAGE PICK / CAMERA
//   ======================== */
//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert("Permission required", "Gallery access is needed");
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setEmotion("--");
//       setConfidence(null);
//       setShowNextOptions(false);
//     }
//   };

//   const openWebcam = async () => {
//     if (Platform.OS === "web") {
//       setShowCamera(true);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;
//       } catch (error) {
//         console.error("Webcam error:", error);
//         Alert.alert("Error", "Cannot access webcam. Please check permissions.");
//         setShowCamera(false);
//       }
//     } else {
//       captureImageMobile();
//     }
//   };

//   const captureFromWebcam = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(videoRef.current, 0, 0);

//       canvas.toBlob((blob) => {
//         const url = URL.createObjectURL(blob);
//         setImage(url);
//         setEmotion("--");
//         setConfidence(null);
//         setShowNextOptions(false);
//         closeWebcam();
//       }, "image/jpeg", 0.8);
//     }
//   };

//   const closeWebcam = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setShowCamera(false);
//   };

//   const captureImageMobile = async () => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Camera access is needed");
//         return;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.front,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setImage(result.assets[0].uri);
//         setEmotion("--");
//         setConfidence(null);
//         setShowNextOptions(false);
//       }
//     } catch (error) {
//       console.log("Camera error:", error);
//       Alert.alert("Error", "Failed to open camera");
//     }
//   };

//   /* =======================
//      EMOTION DETECTION
//   ======================== */
//   const detectEmotion = async () => {
//     if (!image) {
//       Alert.alert("No Image", "Please select or capture an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       if (Platform.OS === "web") {
//         const blob = await fetch(image).then((r) => r.blob());
//         formData.append("file", blob, "face.jpg");
//       } else {
//         formData.append("file", { uri: image, name: "face.jpg", type: "image/jpeg" });
//       }

//       const response = await fetch(`${BASE_URL}/face/predict`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       setEmotion(data.emotion);
//       setConfidence(data.confidence);

//       // Heuristic anxiety score
//       const emotionScore = EMOTION_ANXIETY_SCORE[data.emotion] ?? 20;
//       setEmotionScoreState(emotionScore);

//       // Show next options (Questionnaire / Skip)
//       setShowNextOptions(true);

//     } catch (error) {
//       console.log("❌ Emotion error:", error);
//       Alert.alert("Error", "Cannot connect to server");
//     }

//     setLoading(false);
//   };

//   /* =======================
//      WEBCAM MODAL (WEB ONLY)
//   ======================== */
//   const WebcamModal = () => {
//     if (Platform.OS !== "web") return null;
//     return (
//       <Modal visible={showCamera} transparent={true} animationType="fade" onRequestClose={closeWebcam}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Capture from Webcam</Text>
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               style={{
//                 width: 640,
//                 height: 480,
//                 borderRadius: 12,
//                 backgroundColor: "#000",
//                 maxWidth: "90vw",
//                 maxHeight: "60vh",
//                 objectFit: "cover",
//               }}
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={[styles.modalButton, styles.captureButton]} onPress={captureFromWebcam}>
//                 <Text style={styles.modalButtonText}>📸 Capture</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeWebcam}>
//                 <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>✕ Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Face Emotion Detection</Text>

//       {image ? (
//         <Image source={{ uri: image }} style={styles.preview} />
//       ) : (
//         <View style={styles.placeholder}>
//           <Text style={{ color: "#94a3b8" }}>No image selected</Text>
//         </View>
//       )}

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
//           <Text style={styles.buttonText}>📁 Gallery</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
//           <Text style={styles.buttonText}>📷 Camera</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={detectEmotion}>
//         <Text style={styles.buttonText}>Detect Emotion</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

//       <Text style={styles.result}>
//         Emotion: {emotion}
//         {confidence !== null && ` (${confidence}%)`}
//       </Text>

//       {/* =======================
//           SHOW NEXT OPTIONS
//       ======================== */}
//       {showNextOptions && (
//         <View style={{ marginTop: 20, width: "100%" }}>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() =>
//               navigation.navigate("Questionnaire", {
//                 emotion,
//                 emotionScore: emotionScoreState,
//               })
//             }
//           >
//             <Text style={styles.buttonText}>Do Questionnaire</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.nextButton, { marginTop: 10 }]}
//             onPress={() =>
//               navigation.navigate("Result", {
//                 emotion,
//                 emotionScore: emotionScoreState,
//                 questionnaireScore: null,
//               })
//             }
//           >
//             <Text style={styles.nextText}>Skip to Result</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {Platform.OS === "web" && <WebcamModal />}
//     </View>
//   );
// }

// /* =======================
//      STYLES
// ======================= */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#020617",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     color: "#ffffff",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   preview: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     marginBottom: 15,
//   },
//   placeholder: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#334155",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     width: 300,
//     justifyContent: "space-between",
//   },
//   halfButton: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 145,
//     alignItems: "center",
//   },
//   button: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   buttonText: {
//     fontWeight: "bold",
//     color: "#020617",
//   },
//   result: {
//     color: "#ffffff",
//     fontSize: 18,
//     marginTop: 15,
//   },
//   nextButton: {
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//     padding: 12,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   nextText: {
//     color: "#38bdf8",
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     maxWidth: "95%",
//   },
//   modalTitle: {
//     color: "#ffffff",
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     marginTop: 20,
//     gap: 10,
//   },
//   modalButton: {
//     padding: 14,
//     borderRadius: 12,
//     minWidth: 120,
//     alignItems: "center",
//   },
//   captureButton: {
//     backgroundColor: "#38bdf8",
//   },
//   cancelButton: {
//     backgroundColor: "#1e293b",
//     borderWidth: 1,
//     borderColor: "#ef4444",
//   },
//   modalButtonText: {
//     fontWeight: "bold",
//     color: "#020617",
//     fontSize: 16,
//   },
// });




// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   Modal,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useNavigation } from "@react-navigation/native";

// /* =======================
//    EMOTION → HEURISTIC ANXIETY SCORE
// ======================= */
// const EMOTION_ANXIETY_SCORE = {
//   Angry: 60,
//   Disgust: 50,
//   Fear: 80,
//   Sad: 70,
//   Surprise: 40,
//   Happy: 10,
//   Neutral: 20,
// };

// /* =======================
//    UTILITY FUNCTIONS
// ======================= */
// const getAnxietyLevelFromScore = (score) => {
//   if (score <= 20) return "Normal";
//   if (score <= 40) return "Mild";
//   if (score <= 60) return "Moderate";
//   if (score <= 80) return "Severe";
//   return "Extremely Severe";
// };

// export default function FaceScreen() {
//   const navigation = useNavigation();

//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const [emotionScoreState, setEmotionScoreState] = useState(20);

//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const BASE_URL =
//     Platform.OS === "web" ? "http://localhost:8000" : "http://10.0.2.2:8000";

//   /* =======================
//      IMAGE PICK / CAMERA
//   ======================== */
//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert("Permission required", "Gallery access is needed");
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setEmotion("--");
//       setConfidence(null);
//       setEmotionScoreState(20);
//     }
//   };

//   const openWebcam = async () => {
//     if (Platform.OS === "web") {
//       setShowCamera(true);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;
//       } catch (error) {
//         console.error("Webcam error:", error);
//         Alert.alert("Error", "Cannot access webcam. Please check permissions.");
//         setShowCamera(false);
//       }
//     } else {
//       captureImageMobile();
//     }
//   };

//   const captureFromWebcam = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(videoRef.current, 0, 0);

//       canvas.toBlob((blob) => {
//         const url = URL.createObjectURL(blob);
//         setImage(url);
//         setEmotion("--");
//         setConfidence(null);
//         setEmotionScoreState(20);
//         closeWebcam();
//       }, "image/jpeg", 0.8);
//     }
//   };

//   const closeWebcam = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setShowCamera(false);
//   };

//   const captureImageMobile = async () => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Camera access is needed");
//         return;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.front,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setImage(result.assets[0].uri);
//         setEmotion("--");
//         setConfidence(null);
//         setEmotionScoreState(20);
//       }
//     } catch (error) {
//       console.log("Camera error:", error);
//       Alert.alert("Error", "Failed to open camera");
//     }
//   };

//   /* =======================
//      EMOTION DETECTION
//   ======================== */
//   const detectEmotion = async () => {
//     if (!image) {
//       Alert.alert("No Image", "Please select or capture an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       if (Platform.OS === "web") {
//         const blob = await fetch(image).then((r) => r.blob());
//         formData.append("file", blob, "face.jpg");
//       } else {
//         formData.append("file", { uri: image, name: "face.jpg", type: "image/jpeg" });
//       }

//       const response = await fetch(`${BASE_URL}/face/predict`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       setEmotion(data.emotion);
//       setConfidence(data.confidence);

//       const emotionScore = EMOTION_ANXIETY_SCORE[data.emotion] ?? 20;
//       setEmotionScoreState(emotionScore);
//     } catch (error) {
//       console.log("❌ Emotion error:", error);
//       Alert.alert("Error", "Cannot connect to server");
//     }

//     setLoading(false);
//   };

//   /* =======================
//      WEBCAM MODAL (WEB ONLY)
//   ======================== */
//   const WebcamModal = () => {
//     if (Platform.OS !== "web") return null;
//     return (
//       <Modal visible={showCamera} transparent={true} animationType="fade" onRequestClose={closeWebcam}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Capture from Webcam</Text>
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               style={{
//                 width: 640,
//                 height: 480,
//                 borderRadius: 12,
//                 backgroundColor: "#000",
//                 maxWidth: "90vw",
//                 maxHeight: "60vh",
//                 objectFit: "cover",
//               }}
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={[styles.modalButton, styles.captureButton]} onPress={captureFromWebcam}>
//                 <Text style={styles.modalButtonText}>📸 Capture</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeWebcam}>
//                 <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>✕ Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Face Emotion Detection</Text>

//       {image ? (
//         <Image source={{ uri: image }} style={styles.preview} />
//       ) : (
//         <View style={styles.placeholder}>
//           <Text style={{ color: "#94a3b8" }}>No image selected</Text>
//         </View>
//       )}

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
//           <Text style={styles.buttonText}>📁 Gallery</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
//           <Text style={styles.buttonText}>📷 Camera</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={detectEmotion}>
//         <Text style={styles.buttonText}>Detect Emotion</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

//       <Text style={styles.result}>
//         Emotion: {emotion}
//         {confidence !== null && ` (${confidence}%)`}
//       </Text>

//       {/* =======================
//           ALWAYS SHOW NEXT OPTIONS
//       ======================== */}
//       <View style={{ marginTop: 20, width: "100%" }}>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() =>
//             navigation.navigate("Questionnaire", {
//               emotion,
//               emotionScore: emotionScoreState,
//             })
//           }
//         >
//           <Text style={styles.buttonText}>Do Questionnaire</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.nextButton, { marginTop: 10 }]}
//           onPress={() =>
//             navigation.navigate("Result", {
//               emotion,
//               emotionScore: emotionScoreState,
//               questionnaireScore: null,
//             })
//           }
//         >
//           <Text style={styles.nextText}>Skip to Result</Text>
//         </TouchableOpacity>
//       </View>

//       {Platform.OS === "web" && <WebcamModal />}
//     </View>
//   );
// }

// /* =======================
//      STYLES
// ======================= */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#020617",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     color: "#ffffff",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   preview: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     marginBottom: 15,
//   },
//   placeholder: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#334155",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     width: 300,
//     justifyContent: "space-between",
//   },
//   halfButton: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 145,
//     alignItems: "center",
//   },
//   button: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   buttonText: {
//     fontWeight: "bold",
//     color: "#020617",
//   },
//   result: {
//     color: "#ffffff",
//     fontSize: 18,
//     marginTop: 15,
//   },
//   nextButton: {
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//     padding: 12,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   nextText: {
//     color: "#38bdf8",
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     maxWidth: "95%",
//   },
//   modalTitle: {
//     color: "#ffffff",
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     marginTop: 20,
//     gap: 10,
//   },
//   modalButton: {
//     padding: 14,
//     borderRadius: 12,
//     minWidth: 120,
//     alignItems: "center",
//   },
//   captureButton: {
//     backgroundColor: "#38bdf8",
//   },
//   cancelButton: {
//     backgroundColor: "#1e293b",
//     borderWidth: 1,
//     borderColor: "#ef4444",
//   },
//   modalButtonText: {
//     fontWeight: "bold",
//     color: "#020617",
//     fontSize: 16,
//   },
// });



// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
//   Modal,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useNavigation } from "@react-navigation/native";

// /* =======================
//    EMOTION → HEURISTIC ANXIETY SCORE
// ======================= */
// const EMOTION_ANXIETY_SCORE = {
//   Angry: 60,
//   Disgust: 50,
//   Fear: 80,
//   Sad: 70,
//   Surprise: 40,
//   Happy: 10,
//   Neutral: 20,
// };

// export default function FaceScreen() {
//   const navigation = useNavigation();

//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const [emotionScoreState, setEmotionScoreState] = useState(null);

//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const BASE_URL =
//     Platform.OS === "web" ? "http://localhost:8000" : "http://10.0.2.2:8000";

//   /* =======================
//      IMAGE PICK / CAMERA
//   ======================== */
//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert("Permission required", "Gallery access is needed");
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setEmotion("--");
//       setConfidence(null);
//       setEmotionScoreState(null);
//     }
//   };

//   const openWebcam = async () => {
//     if (Platform.OS === "web") {
//       setShowCamera(true);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
//         });
//         streamRef.current = stream;
//         if (videoRef.current) videoRef.current.srcObject = stream;
//       } catch (error) {
//         console.error("Webcam error:", error);
//         Alert.alert("Error", "Cannot access webcam. Please check permissions.");
//         setShowCamera(false);
//       }
//     } else {
//       captureImageMobile();
//     }
//   };

//   const captureFromWebcam = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(videoRef.current, 0, 0);

//       canvas.toBlob((blob) => {
//         const url = URL.createObjectURL(blob);
//         setImage(url);
//         setEmotion("--");
//         setConfidence(null);
//         setEmotionScoreState(null);
//         closeWebcam();
//       }, "image/jpeg", 0.8);
//     }
//   };

//   const closeWebcam = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setShowCamera(false);
//   };

//   const captureImageMobile = async () => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();
//       if (!permission.granted) {
//         Alert.alert("Permission required", "Camera access is needed");
//         return;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.front,
//       });
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         setImage(result.assets[0].uri);
//         setEmotion("--");
//         setConfidence(null);
//         setEmotionScoreState(null);
//       }
//     } catch (error) {
//       console.log("Camera error:", error);
//       Alert.alert("Error", "Failed to open camera");
//     }
//   };

//   /* =======================
//      EMOTION DETECTION
//   ======================== */
//   const detectEmotion = async () => {
//     if (!image) {
//       Alert.alert("No Image", "Please select or capture an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         const blob = await fetch(image).then((r) => r.blob());
//         formData.append("file", blob, "face.jpg");
//       } else {
//         formData.append("file", { uri: image, name: "face.jpg", type: "image/jpeg" });
//       }

//       const response = await fetch(`${BASE_URL}/face/predict`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       setEmotion(data.emotion);
//       setConfidence(data.confidence);

//       const emotionScore = EMOTION_ANXIETY_SCORE[data.emotion] ?? null;
//       setEmotionScoreState(emotionScore);
//     } catch (error) {
//       console.log("❌ Emotion error:", error);
//       Alert.alert("Error", "Cannot connect to server");
//     }

//     setLoading(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Face Emotion Detection</Text>

//       {image ? (
//         <Image source={{ uri: image }} style={styles.preview} />
//       ) : (
//         <View style={styles.placeholder}>
//           <Text style={{ color: "#94a3b8" }}>No image selected</Text>
//         </View>
//       )}

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
//           <Text style={styles.buttonText}>📁 Gallery</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
//           <Text style={styles.buttonText}>📷 Camera</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={detectEmotion}>
//         <Text style={styles.buttonText}>Detect Emotion</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

//       <Text style={styles.result}>
//         Emotion: {emotion}
//         {confidence !== null && ` (${confidence}%)`}
//       </Text>

//       <View style={{ marginTop: 20, width: "100%" }}>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() =>
//             navigation.navigate("Questionnaire", {
//               emotion,
//               emotionScore: emotionScoreState,
//             })
//           }
//         >
//           <Text style={styles.buttonText}>Do Questionnaire</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.nextButton, { marginTop: 10 }]}
//           onPress={() =>
//             navigation.navigate("Result", {
//               emotion: image ? emotion : null,
//               emotionScore: image ? emotionScoreState : null,
//               questionnaireScore: null,
//             })
//           }
//         >
//           <Text style={styles.nextText}>Skip to Result</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#020617",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     color: "#ffffff",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   preview: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     marginBottom: 15,
//   },
//   placeholder: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#334155",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     width: 300,
//     justifyContent: "space-between",
//   },
//   halfButton: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 145,
//     alignItems: "center",
//   },
//   button: {
//     backgroundColor: "#38bdf8",
//     padding: 14,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   buttonText: {
//     fontWeight: "bold",
//     color: "#020617",
//   },
//   result: {
//     color: "#ffffff",
//     fontSize: 18,
//     marginTop: 15,
//   },
//   nextButton: {
//     marginTop: 20,
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//     padding: 12,
//     borderRadius: 12,
//     width: 300,
//     alignItems: "center",
//   },
//   nextText: {
//     color: "#38bdf8",
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     maxWidth: "95%",
//   },
//   modalTitle: {
//     color: "#ffffff",
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     marginTop: 20,
//     gap: 10,
//   },
//   modalButton: {
//     padding: 14,
//     borderRadius: 12,
//     minWidth: 120,
//     alignItems: "center",
//   },
//   captureButton: {
//     backgroundColor: "#38bdf8",
//   },
//   cancelButton: {
//     backgroundColor: "#1e293b",
//     borderWidth: 1,
//     borderColor: "#ef4444",
//   },
//   modalButtonText: {
//     fontWeight: "bold",
//     color: "#020617",
//     fontSize: 16,
//   },
// });





import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

/* =======================
   EMOTION → HEURISTIC ANXIETY SCORE
======================= */
const EMOTION_ANXIETY_SCORE = {
  Angry: 60,
  Disgust: 50,
  Fear: 80,
  Sad: 70,
  Surprise: 40,
  Happy: 10,
  Neutral: 20,
};

export default function FaceScreen() {
  const navigation = useNavigation();

  const [image, setImage] = useState(null);
  const [emotion, setEmotion] = useState("--");
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [emotionScoreState, setEmotionScoreState] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const BASE_URL =
    Platform.OS === "web" ? "http://localhost:8000" : "http://10.0.2.2:8000";

  /* =======================
     IMAGE PICK / CAMERA
  ======================== */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is needed");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const openWebcam = async () => {
    if (Platform.OS === "web") {
      setShowCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        streamRef.current = stream;
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        }, 100);
      } catch (error) {
        console.error("Webcam error:", error);
        Alert.alert("Error", "Cannot access webcam. Please check permissions.");
        setShowCamera(false);
      }
    } else {
      captureImageMobile();
    }
  };

  /* =======================
     PROCESS IMAGE & DETECT EMOTION
  ======================== */
  const processImage = async (imgUri) => {
    setImage(imgUri);
    setEmotion("--");
    setConfidence(null);
    setEmotionScoreState(null);
    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const blob = await fetch(imgUri).then((r) => r.blob());
        formData.append("file", blob, "face.jpg");
      } else {
        formData.append("file", { uri: imgUri, name: "face.jpg", type: "image/jpeg" });
      }

      const response = await fetch(`${BASE_URL}/face/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setEmotion(data.emotion);
      setConfidence(data.confidence);
      const score = EMOTION_ANXIETY_SCORE[data.emotion] ?? null;
      setEmotionScoreState(score);
    } catch (error) {
      console.log("❌ Emotion error:", error);
      Alert.alert("Error", "Cannot connect to server");
    }

    setLoading(false);
  };

  /* =======================
     CAPTURE FUNCTIONS
  ======================== */
  const captureFromWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        processImage(url); // <-- detect immediately
        closeWebcam();
      }, "image/jpeg", 0.8);
    }
  };

  const closeWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImageMobile = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Camera access is needed");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  /* =======================
     RENDER
  ======================== */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Face Emotion Detection</Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ color: "#94a3b8" }}>No image selected</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
          <Text style={styles.buttonText}>📁 Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
          <Text style={styles.buttonText}>📷 Camera</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

      <Text style={styles.result}>
        Emotion: {emotion} {confidence !== null && `(${confidence}%)`}
      </Text>

      <View style={{ marginTop: 20, width: "100%" }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("Questionnaire1", {
              emotion,
              emotionScore: emotionScoreState,
            })
          }
        >
          <Text style={styles.buttonText}>Do Questionnaire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, { marginTop: 10 }]}
          onPress={() =>
            navigation.navigate("Result1", {
              emotion: image ? emotion : null,
              emotionScore: image ? emotionScoreState : null,
              questionnaireScore: null,
            })
          }
        >
          <Text style={styles.nextText}>Skip to Result</Text>
        </TouchableOpacity>
      </View>

      {/* =======================
          Webcam Modal (Web only)
      ======================== */}
      {Platform.OS === "web" && (
        <Modal visible={showCamera} transparent={true} animationType="fade" onRequestClose={closeWebcam}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Capture from Webcam</Text>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: 640,
                  height: 480,
                  borderRadius: 12,
                  backgroundColor: "#000",
                  maxWidth: "90vw",
                  maxHeight: "60vh",
                  objectFit: "cover",
                }}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.captureButton]} onPress={captureFromWebcam}>
                  <Text style={styles.modalButtonText}>📸 Capture</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeWebcam}>
                  <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>✕ Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  preview: {
    width: 300,
    height: 380,
    borderRadius: 16,
    marginBottom: 15,
  },
  placeholder: {
    width: 300,
    height: 380,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  halfButton: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 12,
    width: 145,
    alignItems: "center",
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 12,
    width: 300,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#020617",
  },
  result: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 15,
  },
  nextButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#38bdf8",
    padding: 12,
    borderRadius: 12,
    width: 300,
    alignItems: "center",
  },
  nextText: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    maxWidth: "95%",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    padding: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#38bdf8",
  },
  cancelButton: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  modalButtonText: {
    fontWeight: "bold",
    color: "#020617",
    fontSize: 16,
  },
});