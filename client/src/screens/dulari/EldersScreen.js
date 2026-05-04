import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';



const OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often',     value: 2 },
  { label: 'Always',    value: 3 },
];

const QUESTIONS = [
  'Do you worry that your health may get worse?',
  'Do you feel nervous when thinking about your future?',
  'Do you worry about becoming a burden to your family?',
  'Do you find it difficult to stop worrying once you start?',
  'Do you feel tense or unable to relax?',
  'Do you have trouble sleeping because of worry?',
  'Do you feel your heart beating fast when you are worried?',
  'Do you feel frightened or scared without a clear reason?',
  'Do you avoid activities because you feel anxious or uncomfortable?',
  'Do you feel emotionally overwhelmed by small problems?',
];

const SECTION_LABELS = [
  { title: 'Cognitive / Worry', start: 0, end: 4 },
  { title: 'Somatic / Physical', start: 4, end: 7 },
  { title: 'Affective / Emotional', start: 7, end: 10 },
];

/* ───────────── sub-components ───────────── */

function QuestionCard({ index, text, value, onSelect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{index + 1}. {text}</Text>
      <View style={styles.optionsRow}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.optionBtn, value === opt.value && styles.optionSelected]}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={[styles.optionText, value === opt.value && styles.optionTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* Backend URL – your Mac's local IP so iPhone can reach it */
const BACKEND_URL = 'http://192.168.1.235:3001';
const GAS_HISTORY_KEY = 'elders_gas_history';

function getAnxietyLevelFromScore(score, totalQuestions) {
  if (!Number.isFinite(score) || !Number.isFinite(totalQuestions) || totalQuestions <= 0) {
    return 'Minimal';
  }

  const ratio = score / totalQuestions;
  if (ratio >= 0.75) return 'Severe';
  if (ratio >= 0.5) return 'Moderate';
  if (ratio >= 0.25) return 'Mild';
  return 'Minimal';
}

/* ───────────── main screen ───────────── */

export default function EldersScreen({ navigation }) {
  // Check if any activity was completed within the last 7 days
  React.useEffect(() => {
    const checkRecentActivity = async () => {
      try {
        // Only redirect if not coming from test button
        if (navigation && navigation.getState) {
          const route = navigation.getState().routes[navigation.getState().index];
          if (route && route.name === 'Elders' && route.params && route.params.fromTestButton) {
            return; // Don't redirect, show questionnaire
          }
        }
        const existing = await AsyncStorage.getItem('activity_history');
        const history = existing ? JSON.parse(existing) : [];
        const now = new Date();
        const hasRecentActivity = history.some((record) => {
          const completedDate = new Date(record.completed_at);
          const diffDays = (now - completedDate) / (1000 * 60 * 60 * 24);
          return diffDays < 7;
        });
        if (hasRecentActivity) {
          // Retrieve saved anxiety result
          const savedLevel = await AsyncStorage.getItem('elders_anxiety_level');
          const savedScore = await AsyncStorage.getItem('elders_total_score');
          navigation.replace('RecommendedActivities', {
            anxietyLevel: savedLevel || 'Minimal',
            totalScore: savedScore ? parseInt(savedScore, 10) : 0,
            predictedSongs: [],
          });
        }
      } catch (e) {
        console.warn('Error checking recent activity:', e.message);
      }
    };
    checkRecentActivity();
  }, []);
  /* phase: 'questionnaire' | 'camera' | 'preview' */
  const [phase, setPhase] = useState('questionnaire');

  // Age modal state
  const [showAgeModal, setShowAgeModal] = useState(true);
  const [isOver60, setIsOver60] = useState(null);
  const [showAgeVerificationModal, setShowAgeVerificationModal] = useState(false);
  const [ageVerificationMessage, setAgeVerificationMessage] = useState('');

  /* camera */
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  /* questionnaire */
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [showModal, setShowModal] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [mlPrediction, setMlPrediction] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toWebFile = async (photoObj) => {
    if (Platform.OS !== 'web') return null;
    if (photoObj?.webFile) return photoObj.webFile;
    if (!photoObj?.uri) return null;

    const res = await fetch(photoObj.uri);
    const blob = await res.blob();
    return new File([blob], 'selfie.jpg', { type: blob.type || 'image/jpeg' });
  };

  /* ── camera helpers ── */

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const raw = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        if (Platform.OS === 'web') {
          setPhoto({ uri: raw.uri, webFile: null });
          setPhase('preview');
          return;
        }

        // Convert to JPEG (iOS may capture HEIC)
        const manipulated = await ImageManipulator.manipulateAsync(
          raw.uri,
          [{ resize: { width: 640 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
        );
        setPhoto(manipulated);
        setPhase('preview');
      }
    } catch (e) {
      console.warn('Failed to take photo:', e);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;

        if (Platform.OS === 'web') {
          setPhoto({ uri, webFile: asset.file || null });
          setPhase('preview');
          return;
        }

        const manipulated = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 640 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
        );
        setPhoto(manipulated);
        setPhase('preview');
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    }
  };

  const retake = () => {
    setPhoto(null);
    setPhase('camera');
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    setStatusMessage('Analyzing photo...');
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const file = await toWebFile(photo);
        if (!file) {
          throw new Error('No valid web image file was found. Please retake or select from gallery.');
        }
        formData.append('image', file);
      } else {
        // iOS / Android: RN-native FormData accepts { uri, type, name }
        formData.append('image', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'selfie.jpg',
        });
      }
      formData.append('age', '60');

      const response = await fetch('http://127.0.0.1:5000/predict-emotion-songs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server responded ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const predictedAge = data.predicted_age;

      if (predictedAge === undefined || predictedAge === null) {
        throw new Error('Age prediction response did not include predicted_age.');
      }

      setStatusMessage('');

      if (predictedAge >= 60) {
        setShowAgeVerificationModal(false);
        setAgeVerificationMessage('');
        setPhase('questionnaire');
      } else {
        setAgeVerificationMessage(`Your predicted age is ${predictedAge}. You appear to be below age 60.`);
        setShowAgeVerificationModal(true);
      }
    } catch (error) {
      console.warn('Analyze error:', error);
      const message = error.message || 'Could not reach the age prediction server. Please check your connection and try again.';
      setStatusMessage(Platform.OS === 'web' ? 'Prediction server is not reachable in the browser. Continuing without age check.' : message);

      if (Platform.OS === 'web') {
        setPhase('questionnaire');
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── questionnaire helpers ── */

  const handleSelect = (index, value) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  };

  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    setStatusMessage('Calculating score...');
    try {
      const payload = {};
      answers.forEach((val, i) => {
        payload[`q${i + 1}`] = val;
      });

      const response = await axios.post(
        'http://127.0.0.1:5000/predict-anxiety',
        payload,
        { timeout: 15000 },
      );

      const resultData = response.data;
      setTotalScore(resultData.total_score);
      setMlPrediction(resultData.ml_prediction || '');
      setShowModal(true);
      setStatusMessage('');

      // Always save locally, even if backend save fails.
      try {
        const nowIso = new Date().toISOString();
        await AsyncStorage.setItem('elders_questionnaire_last_filled', nowIso);
        await AsyncStorage.setItem('elders_anxiety_level', resultData.ml_prediction || 'Minimal');
        await AsyncStorage.setItem('elders_total_score', String(resultData.total_score));

        const historyRaw = await AsyncStorage.getItem(GAS_HISTORY_KEY);
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        history.unshift({
          total_score: resultData.total_score,
          ml_prediction: resultData.ml_prediction || 'Minimal',
          answers: resultData.answers || null,
          saved_at: nowIso,
        });
        await AsyncStorage.setItem(GAS_HISTORY_KEY, JSON.stringify(history));
      } catch (localErr) {
        console.warn('Failed to save GAS result locally:', localErr.message);
      }

      // Save the full result to MySQL via our backend
      try {
        await axios.post(`${BACKEND_URL}/save-result`, {
          answers: resultData.answers,
          total_score: resultData.total_score,
          manual_result: resultData.manual_result,
          ml_prediction: resultData.ml_prediction,
        }, { timeout: 10000 });
        console.log('Result saved to database');
      } catch (saveErr) {
        console.warn('Failed to save result to DB:', saveErr.message);
      }
    } catch (error) {
      const localScore = Object.values(answers).filter((a) => a === 'Yes').length;
      const localLevel = getAnxietyLevelFromScore(localScore, questions.length);

      setTotalScore(localScore);
      setMlPrediction(localLevel);
      setShowModal(true);

      const message = Platform.OS === 'web'
        ? 'Prediction server is not reachable in the browser. Showing local result instead.'
        : 'Could not reach the prediction server. Please check your connection and try again.';
      setStatusMessage(message);

      if (Platform.OS !== 'web') {
        Alert.alert('Error', message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── renders ── */

  // ---------- AGE VERIFICATION MODAL ----------
  if (showAgeVerificationModal) {
    return (
      <View style={styles.container}>
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowAgeVerificationModal(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Age Verification</Text>
              <Text style={styles.modalNote}>{ageVerificationMessage}</Text>

              <TouchableOpacity
                style={[styles.button, { marginTop: 16 }]}
                onPress={() => {
                  setShowAgeVerificationModal(false);
                  retake();
                }}
              >
                <Text style={styles.buttonText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { marginTop: 8, backgroundColor: '#007AFF' }]}
                onPress={() => {
                  setShowAgeVerificationModal(false);
                  setPhase('questionnaire');
                }}
              >
                <Text style={styles.buttonText}>Continue Anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }


  // ---------- CAMERA PHASE ----------
  if (phase === 'camera') {
    if (!permission) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4C9F70" />
          <Text style={styles.centerText}>Loading camera permissions…</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.centerText}>We need camera permission to predict your age</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.shutter} onPress={takePhoto}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shutter, { marginTop: 16, backgroundColor: '#4C9F70' }]} onPress={pickImageFromGallery}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---------- PREVIEW PHASE ----------
  if (phase === 'preview') {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: photo?.uri }}
            style={[styles.previewImage, { transform: [{ scaleX: -1 }] }]}
          />
        </View>
        <View style={styles.cameraControls}>
          {statusMessage ? <Text style={styles.previewStatusText}>{statusMessage}</Text> : null}
          {analyzing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.analyzeBtn} onPress={analyzePhoto}>
                <Text style={styles.analyzeBtnText}>Analyze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ---------- QUESTIONNAIRE PHASE ----------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elders Questionnaire</Text>
      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

      <Modal visible={showAgeModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Are you over 60 years old?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 8 }]}
                onPress={() => { setIsOver60(true); setShowAgeModal(false); }}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginLeft: 8, backgroundColor: '#aaa' }]}
                onPress={() => { setIsOver60(false); setShowAgeModal(false); }}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { marginTop: 16, backgroundColor: '#007AFF' }]}
              onPress={() => { setShowAgeModal(false); setPhase('camera'); }}
            >
              <Text style={styles.buttonText}>Predict your age</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {SECTION_LABELS.map((sec) => (
          <View key={sec.title}>
            <Text style={styles.section}>{sec.title}</Text>
            {QUESTIONS.slice(sec.start, sec.end).map((q, i) => {
              const globalIndex = sec.start + i;
              return (
                <QuestionCard
                  key={globalIndex}
                  index={globalIndex}
                  text={q}
                  value={answers[globalIndex]}
                  onSelect={(val) => handleSelect(globalIndex, val)}
                />
              );
            })}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!allAnswered || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: '#007AFF' }]}
          onPress={() => setPhase('camera')}
        >
          <Text style={styles.buttonText}>Predict your age</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>GAS Score</Text>
            <Text style={styles.modalScore}>{totalScore}</Text>
            {mlPrediction ? (
              <Text style={styles.modalPrediction}>Prediction: {mlPrediction}</Text>
            ) : null}
            <Text style={styles.modalNote}>Thank you for completing the questionnaire.</Text>

            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]} 
              onPress={() => {
                setShowModal(false);
                navigation.navigate('RecommendedActivities', {
                  anxietyLevel: mlPrediction || 'Minimal',
                  totalScore,
                  predictedSongs: photo?.songs || [],
                });
              }}
            >
              <Text style={styles.buttonText}>View Activities</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { marginTop: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#4C9F70' }]}
              onPress={() => {
                setShowModal(false);
                setAnswers(Array(10).fill(null));
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
            >
              <Text style={[styles.buttonText, { color: '#4C9F70' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ───────────── styles ───────────── */

const styles = StyleSheet.create({
  /* camera & preview */
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
  previewStatusText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: '90%',
  },
  actionRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  analyzeBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  retakeBtn: {
    backgroundColor: '#4C9F70',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  retakeBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#EAF4F4',
  },
  centerText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusText: {
    backgroundColor: '#FFF4D9',
    color: '#6B4E00',
    borderColor: '#E8C56A',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    textAlign: 'center',
  },

  /* questionnaire */
  container: { flex: 1, backgroundColor: '#EAF4F4' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    fontSize: 16,
    color: '#4C9F70',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '600',
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, color: '#333', marginBottom: 12, fontWeight: '600' },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionBtn: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#4C9F70',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginVertical: 4,
    backgroundColor: '#F6FBF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: { backgroundColor: '#4C9F70', borderColor: '#4C9F70' },
  optionText: { color: '#4C9F70', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  optionTextSelected: { color: '#fff' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#EAF4F4',
  },
  button: { backgroundColor: '#4C9F70', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 18, color: '#FFF', fontWeight: '600' },

  /* modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  modalScore: { fontSize: 36, fontWeight: '800', color: '#4C9F70', marginBottom: 8 },
  modalPrediction: { fontSize: 16, fontWeight: '600', color: '#4C9F70', marginBottom: 8 },
  modalNote: { fontSize: 14, color: '#555' },
});
