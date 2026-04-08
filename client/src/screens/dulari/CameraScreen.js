// ─────────────────────────────────────────────────────────────────────────────
// CameraScreen.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const ML_SERVER = 'http://127.0.0.1:5000';
export function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto]       = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  if (!permission) return <View style={cs.center}><ActivityIndicator size="large" color="#4C9F70" /></View>;
  if (!permission.granted) return (
    <View style={cs.center}>
      <Text style={cs.text}>We need your permission to use the camera.</Text>
      <TouchableOpacity style={cs.button} onPress={requestPermission}><Text style={cs.buttonText}>Grant Permission</Text></TouchableOpacity>
    </View>
  );

  const takePhoto = async () => {
    try {
      const raw = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const m   = await ImageManipulator.manipulateAsync(raw.uri, [{ resize: { width: 640 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
      setPhoto(m);
    } catch (e) { console.warn('takePhoto error:', e); }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (!result.canceled && result.assets?.length > 0) {
        const m = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 640 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
        setPhoto(m);
      }
    } catch (e) { console.warn('Gallery error:', e); }
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const res = await fetch(photo.uri); const blob = await res.blob();
        formData.append('image', new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
      } else {
        formData.append('image', { uri: photo.uri, type: 'image/jpeg', name: 'selfie.jpg' });
      }
      formData.append('age', '60');
      const response = await fetch(`${ML_SERVER}/predict-emotion-songs`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const data = await response.json();
      navigation.navigate('Relax', {
        recommendedSongs: data.recommended_songs || [],
        mood:             data.mood || '',
        predictedAge:     data.predicted_age,
        teenageYearRange: data.teenage_year_range || '',
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not reach the prediction server.');
    } finally { setAnalyzing(false); }
  };

  return (
    <View style={cs.container}>
      {!photo ? (
        <>
          <CameraView ref={cameraRef} style={cs.camera} facing="front" />
          <View style={cs.controls}>
            <TouchableOpacity style={cs.shutter} onPress={takePhoto}><Text style={cs.shutterText}>📸</Text></TouchableOpacity>
            <TouchableOpacity style={[cs.button, { marginTop: 16 }]} onPress={pickFromGallery}><Text style={cs.buttonText}>Gallery</Text></TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={cs.previewContainer}>
            <Image source={{ uri: photo.uri }} style={[cs.preview, { transform: [{ scaleX: -1 }] }]} />
          </View>
          <View style={cs.controls}>
            {analyzing ? <ActivityIndicator size="large" color="#fff" /> : (
              <View style={cs.actionRow}>
                <TouchableOpacity style={cs.analyzeBtn} onPress={analyzePhoto}><Text style={cs.analyzeText}>Analyze</Text></TouchableOpacity>
                <TouchableOpacity style={cs.button} onPress={() => setPhoto(null)}><Text style={cs.buttonText}>Retake</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const cs = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#000' },
  camera:          { flex: 1 },
  controls:        { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  shutter:         { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterText:     { fontSize: 32 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#EAF4F4' },
  text:            { color: '#333', marginBottom: 12, textAlign: 'center' },
  button:          { backgroundColor: '#4C9F70', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  buttonText:      { color: '#fff', fontWeight: '600', fontSize: 15 },
  previewContainer:{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  preview:         { width: '90%', height: '80%', resizeMode: 'contain', borderRadius: 12 },
  analyzeBtn:      { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  analyzeText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  actionRow:       { flexDirection: 'row', gap: 16, alignItems: 'center' },
});

export default CameraScreen;