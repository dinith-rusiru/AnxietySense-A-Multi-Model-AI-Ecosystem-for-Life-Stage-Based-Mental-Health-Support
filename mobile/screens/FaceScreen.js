// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";

// export default function FaceScreen({ navigation }) {
//   const cameraRef = useRef(null);

//   const [permission, requestPermission] = useCameraPermissions();
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [facing, setFacing] = useState("front");

//   if (!permission) return <View />;

//   if (!permission.granted) {
//     return (
//       <View style={styles.center}>
//         <Text style={{ color: "#fff" }}>Camera permission required</Text>
//         <TouchableOpacity onPress={requestPermission}>
//           <Text style={{ color: "#38bdf8", marginTop: 10 }}>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const detectEmotion = async () => {
//     if (!cameraRef.current) return;

//     setLoading(true);

//     try {
//       const photo = await cameraRef.current.takePictureAsync({
//         quality: 0.7,
//       });

//       const formData = new FormData();
//       formData.append("file", {
//         uri: photo.uri,
//         name: "face.jpg",
//         type: "image/jpeg",
//       });

//       const response = await fetch(
//         "http://10.0.2.2:8000/face/predict",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const data = await response.json();
//       setEmotion(data.emotion);
//       setConfidence(data.confidence);
//     } catch (error) {
//       Alert.alert("Error", "Cannot connect to server");
//     }

//     setLoading(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Face Emotion Detection</Text>

//       <CameraView
//         ref={cameraRef}
//         style={styles.camera}
//         facing={facing}
//       />

//       <TouchableOpacity style={styles.button} onPress={detectEmotion}>
//         <Text style={styles.buttonText}>Detect Emotion</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator color="#38bdf8" />}

//       <Text style={styles.result}>
//         Emotion: {emotion}
//         {confidence !== null && ` (${confidence}%)`}
//       </Text>

//       <TouchableOpacity
//         style={styles.nextButton}
//         onPress={() => navigation.navigate("Questionnaire")}
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
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#020617",
//   },
//   title: {
//     color: "#ffffff",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   camera: {
//     width: 300,
//     height: 380,
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: 15,
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




// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// export default function FaceScreen({ navigation }) {
//   const [image, setImage] = useState(null);
//   const [emotion, setEmotion] = useState("--");
//   const [confidence, setConfidence] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // -------------------------
//   // Pick image from gallery
//   // -------------------------
//   const pickImage = async () => {
//     const permission =
//       await ImagePicker.requestMediaLibraryPermissionsAsync();

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

//   // -------------------------
//   // Upload image & detect emotion
//   // -------------------------
//   const detectEmotion = async () => {
//     if (!image) {
//       Alert.alert("No Image", "Please select an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", {
//         uri: image,
//         name: "face.jpg",
//         type: "image/jpeg",
//       });

//       const response = await fetch(
//         "http://10.0.2.2:8000/face/predict",
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       const data = await response.json();
//       setEmotion(data.emotion);
//       setConfidence(data.confidence);
//     } catch (error) {
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

//       <TouchableOpacity style={styles.button} onPress={pickImage}>
//         <Text style={styles.buttonText}>Upload Image</Text>
//       </TouchableOpacity>

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
//         onPress={() => navigation.navigate("Questionnaire")}
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


import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function FaceScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [emotion, setEmotion] = useState("--");
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pick image from gallery
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

  // Upload image & detect emotion
  const detectEmotion = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        name: "face.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(
        "http://10.0.2.2:8000/face/predict",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      setEmotion(data.emotion);
      setConfidence(data.confidence);
    } catch (error) {
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

      <TouchableOpacity
        style={[styles.button, { marginTop: 10 }]}
        onPress={detectEmotion}
      >
        <Text style={styles.buttonText}>Detect Emotion</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          color="#38bdf8"
          style={{ marginTop: 10 }}
        />
      )}

      <Text style={styles.result}>
        Emotion: {emotion}
        {confidence !== null && ` (${confidence}%)`}
      </Text>

      {/* <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (emotion === "--") {
            Alert.alert(
              "Detect Emotion",
              "Please detect emotion first"
            );
            return;
          }

          navigation.navigate("Questionnaire", {
            emotion: emotion, // ✅ PASS EMOTION
          });
        }}
      >
        <Text style={styles.nextText}>Continue</Text>
      </TouchableOpacity> */}


      <TouchableOpacity
  style={styles.nextButton}
  onPress={() => {
    navigation.navigate("Questionnaire", {
      emotion: emotion, // can be "--" or actual emotion
    });
  }}
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
