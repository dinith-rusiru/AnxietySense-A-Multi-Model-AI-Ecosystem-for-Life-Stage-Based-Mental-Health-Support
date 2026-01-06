import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  if (!permission) {
    // permissions are still loading
    return <View style={styles.center}><Text>Loading camera permissions…</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const result = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        setPhoto(result);
      }
    } catch (e) {
      console.warn('Failed to take photo:', e);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
  };

  const analyzePhoto = () => {
    navigation.navigate('Relax', { uri: photo?.uri });
  };

  return (
    <View style={styles.container}>
      {!photo ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        />
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo?.uri }} style={[styles.preview, styles.unmirror]} />
        </View>
      )}

      <View style={styles.controls}>
        {!photo ? (
          <TouchableOpacity style={styles.shutter} onPress={takePhoto}>
            <Text style={styles.shutterText}>Snap</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.analyzeBtn} onPress={analyzePhoto}>
              <Text style={styles.analyzeText}>Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={clearPhoto}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterText: { fontWeight: 'bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  text: { color: '#333', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#4C9F70', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  previewContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 },
  preview: { width: '90%', height: '80%', resizeMode: 'contain', borderRadius: 12 },
  unmirror: { transform: [{ scaleX: -1 }] },
  analyzeBtn: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  analyzeText: { color: '#fff', fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 16, alignItems: 'center'},
});
