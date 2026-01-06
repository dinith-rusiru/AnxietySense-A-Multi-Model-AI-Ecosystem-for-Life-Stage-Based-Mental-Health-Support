import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function FaceScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [emotion, setEmotion] = useState("--");
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL =
    Platform.OS === "web"
      ? "http://localhost:8000"
      : "http://10.0.2.2:8000";

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

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

  const detectEmotion = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image first");
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

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={detectEmotion}>
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
});
