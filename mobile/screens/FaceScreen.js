// // import React, { useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   Image,
// //   Platform,
// // } from "react-native";
// // import * as ImagePicker from "expo-image-picker";

// // export default function FaceScreen({ navigation }) {
// //   const [image, setImage] = useState(null);
// //   const [emotion, setEmotion] = useState("--");
// //   const [confidence, setConfidence] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   const BASE_URL =
// //     Platform.OS === "web"
// //       ? "http://localhost:8000"
// //       : "http://10.0.2.2:8000";

// //   const pickImage = async () => {
// //     const permission =
// //       await ImagePicker.requestMediaLibraryPermissionsAsync();

// //     if (!permission.granted) {
// //       Alert.alert("Permission required", "Gallery access is needed");
// //       return;
// //     }

// //     const result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       quality: 0.8,
// //     });

// //     if (!result.canceled) {
// //       setImage(result.assets[0].uri);
// //       setEmotion("--");
// //       setConfidence(null);
// //     }
// //   };

// //   const detectEmotion = async () => {
// //     if (!image) {
// //       Alert.alert("No Image", "Please select an image first");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const formData = new FormData();

// //       if (Platform.OS === "web") {
// //         const blob = await fetch(image).then((r) => r.blob());
// //         formData.append("file", blob, "face.jpg");
// //       } else {
// //         formData.append("file", {
// //           uri: image,
// //           name: "face.jpg",
// //           type: "image/jpeg",
// //         });
// //       }

// //       console.log("📡 Sending image to:", `${BASE_URL}/face/predict`);

// //       const response = await fetch(`${BASE_URL}/face/predict`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       const data = await response.json();
// //       console.log("✅ Emotion response:", data);

// //       setEmotion(data.emotion);
// //       setConfidence(data.confidence);
// //     } catch (error) {
// //       console.log("❌ Emotion error:", error);
// //       Alert.alert("Error", "Cannot connect to server");
// //     }

// //     setLoading(false);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Face Emotion Detection</Text>

// //       {image ? (
// //         <Image source={{ uri: image }} style={styles.preview} />
// //       ) : (
// //         <View style={styles.placeholder}>
// //           <Text style={{ color: "#94a3b8" }}>No image selected</Text>
// //         </View>
// //       )}

// //       <TouchableOpacity style={styles.button} onPress={pickImage}>
// //         <Text style={styles.buttonText}>Upload Image</Text>
// //       </TouchableOpacity>

// //       <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={detectEmotion}>
// //         <Text style={styles.buttonText}>Detect Emotion</Text>
// //       </TouchableOpacity>

// //       {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

// //       <Text style={styles.result}>
// //         Emotion: {emotion}
// //         {confidence !== null && ` (${confidence}%)`}
// //       </Text>

// //       <TouchableOpacity
// //         style={styles.nextButton}
// //         onPress={() => navigation.navigate("Questionnaire", { emotion })}
// //       >
// //         <Text style={styles.nextText}>Continue</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#020617",
// //     alignItems: "center",
// //     padding: 20,
// //   },
// //   title: {
// //     color: "#ffffff",
// //     fontSize: 22,
// //     fontWeight: "bold",
// //     marginBottom: 15,
// //   },
// //   preview: {
// //     width: 300,
// //     height: 380,
// //     borderRadius: 16,
// //     marginBottom: 15,
// //   },
// //   placeholder: {
// //     width: 300,
// //     height: 380,
// //     borderRadius: 16,
// //     borderWidth: 1,
// //     borderColor: "#334155",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginBottom: 15,
// //   },
// //   button: {
// //     backgroundColor: "#38bdf8",
// //     padding: 14,
// //     borderRadius: 12,
// //     width: 300,
// //     alignItems: "center",
// //   },
// //   buttonText: {
// //     fontWeight: "bold",
// //     color: "#020617",
// //   },
// //   result: {
// //     color: "#ffffff",
// //     fontSize: 18,
// //     marginTop: 15,
// //   },
// //   nextButton: {
// //     marginTop: 20,
// //     borderWidth: 1,
// //     borderColor: "#38bdf8",
// //     padding: 12,
// //     borderRadius: 12,
// //     width: 300,
// //     alignItems: "center",
// //   },
// //   nextText: {
// //     color: "#38bdf8",
// //     fontWeight: "bold",
// //   },
// // });



// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Platform,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// export default function FaceScreen({ navigation }) {
//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);

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

//   // Capture image from camera
//   //  // Capture image from camera
//   const captureImage = async () => {
//     try {
//       // Request camera permission
//       const permission = await ImagePicker.requestCameraPermissionsAsync();

//       if (!permission.granted) {
//         Alert.alert("Permission required", "Camera access is needed");
//         return;
//       }

//       // Launch camera with proper settings
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//         cameraType: ImagePicker.CameraType.front, // Use front camera for selfies
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

//         <TouchableOpacity style={styles.halfButton} onPress={captureImage}>
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

export default function FaceScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [emotion, setEmotion] = useState("--");
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const BASE_URL =
    Platform.OS === "web"
      ? "http://localhost:8000"
      : "http://10.0.2.2:8000";

  // Pick image from gallery
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
      setImage(result.assets[0].uri);
      setEmotion("--");
      setConfidence(null);
    }
  };

  // Open webcam (Web-specific)
  const openWebcam = async () => {
    if (Platform.OS === "web") {
      setShowCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Webcam error:", error);
        Alert.alert("Error", "Cannot access webcam. Please check permissions and connection.");
        setShowCamera(false);
      }
    } else {
      // Mobile - use native camera
      captureImageMobile();
    }
  };

  // Capture from webcam (Web)
  const captureFromWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setImage(url);
        setEmotion("--");
        setConfidence(null);
        closeWebcam();
      }, "image/jpeg", 0.8);
    }
  };

  // Close webcam
  const closeWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Mobile camera capture
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
        setImage(result.assets[0].uri);
        setEmotion("--");
        setConfidence(null);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const detectEmotion = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select or capture an image first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const blob = await fetch(image).then((r) => r.blob());
        formData.append("file", blob, "face.jpg");
      } else {
        formData.append("file", {
          uri: image,
          name: "face.jpg",
          type: "image/jpeg",
        });
      }

      console.log("📡 Sending image to:", `${BASE_URL}/face/predict`);

      const response = await fetch(`${BASE_URL}/face/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("✅ Emotion response:", data);

      setEmotion(data.emotion);
      setConfidence(data.confidence);
    } catch (error) {
      console.log("❌ Emotion error:", error);
      Alert.alert("Error", "Cannot connect to server");
    }

    setLoading(false);
  };

  // Webcam Modal (Web only)
  const WebcamModal = () => {
    if (Platform.OS !== "web") return null;

    return (
      <Modal
        visible={showCamera}
        transparent={true}
        animationType="fade"
        onRequestClose={closeWebcam}
      >
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
                objectFit: "cover"
              }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.captureButton]} 
                onPress={captureFromWebcam}
              >
                <Text style={styles.modalButtonText}>📸 Capture</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeWebcam}
              >
                <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>✕ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.halfButton} onPress={pickImage}>
          <Text style={styles.buttonText}>📁 Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.halfButton} onPress={openWebcam}>
          <Text style={styles.buttonText}>📷 Camera</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, { marginTop: 10 }]} 
        onPress={detectEmotion}
      >
        <Text style={styles.buttonText}>Detect Emotion</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />}

      <Text style={styles.result}>
        Emotion: {emotion}
        {confidence !== null && ` (${confidence}%)`}
      </Text>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => navigation.navigate("Questionnaire", { emotion })}
      >
        <Text style={styles.nextText}>Continue</Text>
      </TouchableOpacity>

      {Platform.OS === "web" && <WebcamModal />}
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
  buttonRow: {
    flexDirection: "row",
    width: 300,
    justifyContent: "space-between",
  },
  halfButton: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 12,
    width: 145,
    alignItems: "center",
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