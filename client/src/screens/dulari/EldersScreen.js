import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity,
  ScrollView, Modal, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { checkRecentActivity, saveQuestionnaireResult } from './ActivityService';

const ML_SERVER = 'http://127.0.0.1:5000';

const OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Sometimes',  value: 1 },
  { label: 'Often',      value: 2 },
  { label: 'Always',     value: 3 },
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
  { title: 'Cognitive / Worry',     start: 0, end: 4  },
  { title: 'Somatic / Physical',    start: 4, end: 7  },
  { title: 'Affective / Emotional', start: 7, end: 10 },
];

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

// ── Web Webcam Component ───────────────────────────────────────────────────────
function WebCamera({ onCapture, onClose }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setReady(true);
        }
      })
      .catch((e) => {
        console.warn('Webcam error:', e);
        setError('Could not access webcam. Please allow camera permission or use "Upload Photo".');
      });
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth  || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    // Mirror the capture to match what user sees
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      const uri  = URL.createObjectURL(blob);
      onCapture({ uri, file });
    }, 'image/jpeg', 0.9);
  };

  return (
    <View style={wc.container}>
      <Text style={wc.title}>Take a Photo</Text>
      {error ? (
        <View style={wc.errorBox}>
          <Text style={wc.errorText}>{error}</Text>
        </View>
      ) : (
        <video
          ref={videoRef}
          style={{ width: '100%', maxHeight: 360, borderRadius: 12,
                   transform: 'scaleX(-1)', backgroundColor: '#000' }}
          playsInline
          muted
        />
      )}
      <View style={wc.btnRow}>
        {!error && (
          <TouchableOpacity style={wc.snapBtn} onPress={capture} disabled={!ready}>
            <Text style={wc.snapBtnText}>📸 Capture</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={wc.cancelBtn} onPress={onClose}>
          <Text style={wc.cancelBtnText}>✕ Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const wc = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#EAF4F4', padding: 20, alignItems: 'center' },
  title:       { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 16 },
  errorBox:    { backgroundColor: '#ffeeee', padding: 16, borderRadius: 10, marginBottom: 16 },
  errorText:   { color: '#c00', fontSize: 14, textAlign: 'center' },
  btnRow:      { flexDirection: 'row', gap: 16, marginTop: 20 },
  snapBtn:     { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 10 },
  snapBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn:   { backgroundColor: '#aaa', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 10 },
  cancelBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

// ── Age Result Modal (replaces Alert on web) ──────────────────────────────────
function AgeResultModal({ visible, predictedAge, onContinue, onRetake }) {
  if (!visible) return null;
  const isOk = predictedAge === null || predictedAge === undefined || predictedAge >= 60;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {isOk ? '✅ Age Verified' : '⚠️ Age Verification'}
          </Text>
          {predictedAge !== null && predictedAge !== undefined && (
            <Text style={{ fontSize: 18, color: '#333', marginBottom: 8 }}>
              Predicted age: <Text style={{ fontWeight: '700', color: '#4C9F70' }}>{predictedAge}</Text>
            </Text>
          )}
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
            {isOk
              ? 'You appear to be 60 or older. Proceeding to questionnaire.'
              : 'You appear to be below 60. You can retake the photo or continue anyway.'}
          </Text>
          <TouchableOpacity style={[styles.button, { marginBottom: 10 }]} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue to Questionnaire</Text>
          </TouchableOpacity>
          {!isOk && (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={onRetake}>
              <Text style={styles.buttonText}>Retake Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EldersScreen({ navigation, route }) {

  React.useEffect(() => {
    const fromTest = route?.params?.fromTestButton;
    if (fromTest) return;
    checkRecentActivity().then(({ hasRecent, anxietyLevel, totalScore }) => {
      if (hasRecent) {
        navigation.replace('RecommendedActivities', { anxietyLevel, totalScore, predictedSongs: [] });
      }
    });
  }, []);

  // phase: 'questionnaire' | 'webcam' | 'preview'
  const [phase,           setPhase]           = useState('questionnaire');
  const [showAgeModal,    setShowAgeModal]     = useState(true);
  const [photo,           setPhoto]           = useState(null);
  const [analyzing,       setAnalyzing]       = useState(false);
  const [answers,         setAnswers]         = useState(Array(10).fill(null));
  const [showResultModal, setShowResultModal] = useState(false);
  const [totalScore,      setTotalScore]      = useState(0);
  const [mlPrediction,    setMlPrediction]    = useState('');
  const [submitting,      setSubmitting]      = useState(false);

  // Age result modal state
  const [showAgeResult,   setShowAgeResult]   = useState(false);
  const [predictedAge,    setPredictedAge]    = useState(null);

  const fileInputRef = useRef(null);

  // ── pick from file ─────────────────────────────────────────────────────────
  const pickFromFile = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
        .then((result) => {
          if (!result.canceled && result.assets?.length > 0) {
            setPhoto({ uri: result.assets[0].uri, file: null });
            setPhase('preview');
          }
        }).catch(console.warn);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset so same file can be picked again
    e.target.value = '';
    const uri = URL.createObjectURL(file);
    setPhoto({ uri, file });
    setPhase('preview');
  };

  const handleWebcamCapture = (capturedPhoto) => {
    setPhoto(capturedPhoto);
    setPhase('preview');
  };

  // ── analyze photo ──────────────────────────────────────────────────────────
  const analyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        if (photo.file) {
          formData.append('image', photo.file, 'selfie.jpg');
        } else {
          const res  = await fetch(photo.uri);
          const blob = await res.blob();
          formData.append('image', new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
        }
      } else {
        formData.append('image', { uri: photo.uri, type: 'image/jpeg', name: 'selfie.jpg' });
      }
      formData.append('age', '60');

      const response = await fetch(`${ML_SERVER}/predict-emotion-songs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log('Age prediction response:', data);

      // Show result in modal (not Alert — Alert broken on web)
      setPredictedAge(data.predicted_age);
      setShowAgeResult(true);

    } catch (e) {
      console.error('analyzePhoto error:', e);
      // Show error as modal too
      setPredictedAge(null);
      setShowAgeResult(true);
    } finally {
      setAnalyzing(false);
    }
  };

  // ── questionnaire ──────────────────────────────────────────────────────────
  const handleSelect = (index, value) => {
    const next = [...answers]; next[index] = value; setAnswers(next);
  };

  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const payload = {};
      answers.forEach((val, i) => { payload[`q${i + 1}`] = val; });
      const response   = await axios.post(`${ML_SERVER}/predict-anxiety`, payload, { timeout: 15000 });
      const resultData = response.data;
      setTotalScore(resultData.total_score);
      setMlPrediction(resultData.ml_prediction || 'Minimal');
      setShowResultModal(true);
      await saveQuestionnaireResult({
        answers:       resultData.answers,
        total_score:   resultData.total_score,
        manual_result: resultData.manual_result,
        ml_prediction: resultData.ml_prediction,
      });
    } catch (e) {
      console.error('Submit error:', e);
      // show inline error modal
      setMlPrediction('Error');
      setTotalScore(0);
      setShowResultModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── WEBCAM PHASE ───────────────────────────────────────────────────────────
  if (phase === 'webcam') {
    return (
      <WebCamera
        onCapture={handleWebcamCapture}
        onClose={() => setPhase('questionnaire')}
      />
    );
  }

  // ── PREVIEW PHASE ──────────────────────────────────────────────────────────
  if (phase === 'preview') {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Review Your Photo</Text>

        {photo?.uri && (
          <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="contain" />
        )}

        <View style={styles.previewBtnRow}>
          {analyzing ? (
            <ActivityIndicator size="large" color="#4C9F70" />
          ) : (
            <>
              <TouchableOpacity style={styles.analyzeBtn} onPress={analyzePhoto}>
                <Text style={styles.analyzeBtnText}>✓ Analyze Age</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => { setPhoto(null); setPhase('questionnaire'); }}
              >
                <Text style={styles.retakeBtnText}>✕ Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Age Result Modal */}
        <AgeResultModal
          visible={showAgeResult}
          predictedAge={predictedAge}
          onContinue={() => { setShowAgeResult(false); setPhase('questionnaire'); }}
          onRetake={() => { setShowAgeResult(false); setPhoto(null); setPhase('questionnaire'); }}
        />
      </View>
    );
  }

  // ── QUESTIONNAIRE PHASE ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Hidden file input — web only */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      <Text style={styles.title}>Elders Questionnaire</Text>

      {/* Age Modal */}
      <Modal visible={showAgeModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify Your Age</Text>
            <Text style={{ color: '#555', marginBottom: 16, fontSize: 14 }}>
              Are you over 60, or would you like us to predict your age from a photo?
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => setShowAgeModal(false)}>
              <Text style={styles.buttonText}>✅ Yes, I am over 60</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { marginTop: 10, backgroundColor: '#007AFF' }]}
              onPress={() => { setShowAgeModal(false); setPhase('webcam'); }}
            >
              <Text style={styles.buttonText}>📷 Use Webcam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { marginTop: 10, backgroundColor: '#555' }]}
              onPress={() => { setShowAgeModal(false); pickFromFile(); }}
            >
              <Text style={styles.buttonText}>🖼️ Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {SECTION_LABELS.map((sec) => (
          <View key={sec.title}>
            <Text style={styles.section}>{sec.title}</Text>
            {QUESTIONS.slice(sec.start, sec.end).map((q, i) => {
              const idx = sec.start + i;
              return (
                <QuestionCard
                  key={idx} index={idx} text={q}
                  value={answers[idx]}
                  onSelect={(val) => handleSelect(idx, val)}
                />
              );
            })}
          </View>
        ))}
        <View style={{ height: 160 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!allAnswered || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Submit Questionnaire</Text>
          }
        </TouchableOpacity>
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={[styles.photoBtn, { backgroundColor: '#007AFF' }]}
            onPress={() => setPhase('webcam')}
          >
            <Text style={styles.photoBtnText}>📷 Webcam</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoBtn, { backgroundColor: '#555' }]}
            onPress={pickFromFile}
          >
            <Text style={styles.photoBtnText}>🖼️ Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Modal */}
      <Modal visible={showResultModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Your GAS Score</Text>
            <Text style={styles.modalScore}>{totalScore}</Text>
            <Text style={styles.modalPrediction}>Anxiety Level: {mlPrediction}</Text>
            <Text style={styles.modalNote}>Thank you for completing the questionnaire.</Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => {
                setShowResultModal(false);
                navigation.navigate('RecommendedActivities', {
                  anxietyLevel: mlPrediction || 'Minimal',
                  totalScore,
                  predictedSongs: [],
                });
              }}
            >
              <Text style={styles.buttonText}>View Activities</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { marginTop: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#4C9F70' }]}
              onPress={() => {
                setShowResultModal(false);
                setAnswers(Array(10).fill(null));
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#EAF4F4' },
  title:          { fontSize: 24, fontWeight: '700', color: '#333', paddingHorizontal: 16, paddingTop: 16 },
  section:        { fontSize: 16, color: '#4C9F70', paddingHorizontal: 16, marginTop: 8, marginBottom: 8, fontWeight: '600' },
  scrollContent:  { paddingHorizontal: 16, paddingBottom: 100 },
  card:           { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle:      { fontSize: 16, color: '#333', marginBottom: 12, fontWeight: '600' },
  optionsRow:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionBtn:      { width: '48%', borderWidth: 1, borderColor: '#4C9F70', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 6, marginVertical: 4, backgroundColor: '#F6FBF9', alignItems: 'center', justifyContent: 'center' },
  optionSelected: { backgroundColor: '#4C9F70', borderColor: '#4C9F70' },
  optionText:     { color: '#4C9F70', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  optionTextSelected: { color: '#fff' },
  footer:         { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#EAF4F4' },
  button:         { backgroundColor: '#4C9F70', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText:     { fontSize: 16, color: '#FFF', fontWeight: '600' },
  photoRow:       { flexDirection: 'row', gap: 10, marginTop: 10 },
  photoBtn:       { flex: 1, padding: 13, borderRadius: 10, alignItems: 'center' },
  photoBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  previewContainer: { flex: 1, backgroundColor: '#EAF4F4', alignItems: 'center', justifyContent: 'center', padding: 24 },
  previewTitle:   { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 20 },
  previewImage:   { width: '100%', height: 340, borderRadius: 16, marginBottom: 24, backgroundColor: '#ddd' },
  previewBtnRow:  { flexDirection: 'row', gap: 16 },
  analyzeBtn:     { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 10 },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  retakeBtn:      { backgroundColor: '#aaa', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 10 },
  retakeBtnText:  { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard:      { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 420 },
  modalTitle:     { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  modalScore:     { fontSize: 36, fontWeight: '800', color: '#4C9F70', marginBottom: 8 },
  modalPrediction:{ fontSize: 16, fontWeight: '600', color: '#4C9F70', marginBottom: 8 },
  modalNote:      { fontSize: 14, color: '#555' },
});