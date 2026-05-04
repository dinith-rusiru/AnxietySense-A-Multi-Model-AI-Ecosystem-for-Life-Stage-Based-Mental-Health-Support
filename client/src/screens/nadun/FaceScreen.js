
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
  const [noFace, setNoFace] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const BASE_URL =
    Platform.OS === "web" ? "http://localhost:8002" : "http://10.0.2.2:8002";

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
    setNoFace(false);
    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const blob = await fetch(imgUri).then((r) => r.blob());
        formData.append("file", blob, "face.jpg");
      } else {
        formData.append("file", {
          uri: imgUri,
          name: "face.jpg",
          type: "image/jpeg",
        });
      }

      const response = await fetch(`${BASE_URL}/face/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.no_face) {
        // No face was detected in the image
        setEmotion("No face detected");
        setConfidence(null);
        setEmotionScoreState(null);
        setNoFace(true);
      } else {
        setEmotion(data.emotion);
        setConfidence(data.confidence);
        const score = EMOTION_ANXIETY_SCORE[data.emotion] ?? null;
        setEmotionScoreState(score);

        // Replace preview with annotated image (bounding box drawn by backend)
        if (data.annotated_image) {
          setImage(`data:image/jpeg;base64,${data.annotated_image}`);
        }
      }
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

      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          processImage(url);
          closeWebcam();
        },
        "image/jpeg",
        0.8
      );
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

      {loading && (
        <ActivityIndicator color="#38bdf8" style={{ marginTop: 10 }} />
      )}

      {/* Emotion result — red text if no face detected */}
      <Text
        style={[
          styles.result,
          noFace && { color: "#ef4444" },
        ]}
      >
        {noFace
          ? "⚠️ No face detected"
          : `Emotion: ${emotion}${confidence !== null ? ` (${confidence}%)` : ""}`}
      </Text>

      <View style={{ marginTop: 20, width: "100%" }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("Questionnaire1", {
              emotion: noFace ? null : emotion,
              emotionScore: noFace ? null : emotionScoreState,
            })
          }
        >
          <Text style={styles.buttonText}>Do Questionnaire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, { marginTop: 10 }]}
          onPress={() =>
            navigation.navigate("Result1", {
              emotion: image && !noFace ? emotion : null,
              emotionScore: image && !noFace ? emotionScoreState : null,
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
                  objectFit: "cover",
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
                  <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>
                    ✕ Cancel
                  </Text>
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