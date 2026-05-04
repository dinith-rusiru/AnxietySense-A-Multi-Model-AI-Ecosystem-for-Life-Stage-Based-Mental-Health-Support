import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { predictAnxiety } from '../../services/dinth/anxietyService';

const PREDICTION_INTERVAL = 2000;
const EMOTION_COLORS = { Natural:'#2ECC71', anger:'#E74C3C', fear:'#9B59B6', joy:'#F39C12', sadness:'#3498DB' };
const LEVEL_COLORS   = { HIGH:'#E74C3C', MODERATE:'#F39C12', CALM:'#2ECC71' };
const LEVEL_EMOJI    = { HIGH:'🔴', MODERATE:'🟡', CALM:'🟢' };

export default function ChildScreen({ navigation }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);

  const [camReady,   setCamReady]   = useState(false);
  const [error,      setError]      = useState(null);
  const [facing,     setFacing]     = useState('user');
  const [predicting, setPredicting] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [captured,   setCaptured]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [faceError,  setFaceError]  = useState(null);

  useEffect(() => {
    startCamera('user');
    return () => { stopRealTime(); stopCamera(); };
  }, []);

  const startCamera = async (facingMode = 'user') => {
    stopRealTime(); stopCamera();
    setCamReady(false); setLiveResult(null); setError(null); setFaceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCamReady(true);
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamReady(false);
  };

  const captureFrame = useCallback(() => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (facing === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [facing]);

  const handleResult = (result) => {
    if (result?.success && result?.data) {
      setLiveResult(result.data);
      setFaceError(null);
      return { ok: true };
    }
    setFaceError(result?.error || 'No face detected');
    setLiveResult(null);
    return { ok: false };
  };

  const startRealTime = () => {
    if (!camReady) return;
    setIsRealTime(true); setLiveResult(null); setFaceError(null);
    intervalRef.current = setInterval(async () => {
      if (predicting) return;
      const frame = captureFrame();
      if (!frame) return;
      try {
        setPredicting(true);
        const result = await predictAnxiety(frame);
        handleResult(result);
      } catch (e) {
        console.warn('realtime predict error:', e.message);
      } finally { setPredicting(false); }
    }, PREDICTION_INTERVAL);
  };

  const stopRealTime = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsRealTime(false); setPredicting(false);
  };

  const takePicture = () => {
    stopRealTime();
    setFaceError(null);
    const f = captureFrame();
    if (f) setCaptured(f);
  };

  const proceedToResult = async () => {
    if (!captured) return;
    try {
      setLoading(true);
      setFaceError(null);
      const result = await predictAnxiety(captured);
      const { ok } = handleResult(result);

      if (!ok) {
        setLoading(false);
        return;
      }

      stopCamera();
      navigation.navigate('ResultScreen', {
        cameraResult: result.data,
        imageUri    : captured,
      });
      setCaptured(null);
    } catch (e) {
      alert('Prediction failed: ' + e.message);
    } finally { setLoading(false); }
  };

  const choosePhoto = () => {
    stopRealTime();
    setFaceError(null);
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { setCaptured(ev.target.result); stopCamera(); };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const resetAll = () => {
    setCaptured(null);
    setFaceError(null);
    startCamera(facing);
  };

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.btnBlue} onPress={() => startCamera(facing)}>
        <Text style={styles.btnText}>🔄 Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => { stopCamera(); navigation.goBack(); }}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>👶 Face Scan</Text>
      <Text style={styles.subtitle}>Step 1 of 3 — Detect emotion</Text>

      <View style={styles.cameraBox}>
        {captured ? (
          <img src={captured} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt='captured' />
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facing === 'user' ? 'scaleX(-1)' : 'none' }} />

            {/* Oval face guide */}
            <div style={S.overlay}>
              <div style={S.oval} />
              <span style={S.guideText}>👤 Align face here</span>
            </div>

            {/* Live result overlay */}
            {isRealTime && liveResult && (
              <div style={{ ...S.liveBox, borderColor: LEVEL_COLORS[liveResult.anxiety_level] || '#fff' }}>
                <div style={{ ...S.topBar, background: (LEVEL_COLORS[liveResult.anxiety_level] || '#333') + 'DD' }}>
                  <span style={S.emotionTxt}>
                    {LEVEL_EMOJI[liveResult.anxiety_level]}{'  '}
                    {liveResult.emotion.toUpperCase()}{'  '}
                    <span style={{ fontSize: 13, opacity: 0.9 }}>{liveResult.confidence}%</span>
                  </span>
                  <span style={S.anxietyTxt}>
                    Anxiety: {liveResult.anxiety_score}/100 · {liveResult.anxiety_level}
                  </span>
                </div>
                <div style={S.bottomBar}>
                  {Object.entries(liveResult.all_emotions).map(([em, pct]) => (
                    <div key={em} style={S.barRow}>
                      <span style={S.barLbl}>{em}</span>
                      <div style={S.barBg}>
                        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, backgroundColor: EMOTION_COLORS[em] || '#888', borderRadius: 4, transition: 'width 0.4s' }} />
                      </div>
                      <span style={S.barPct}>{pct}%</span>
                    </div>
                  ))}
                </div>
                {predicting && (
                  <div style={S.spinner}><span style={{ color: '#fff', fontSize: 11 }}>🔄 Analyzing...</span></div>
                )}
              </div>
            )}

            {/* Live no-face warning */}
            {isRealTime && faceError && !liveResult && (
              <div style={S.noFaceBox}>
                <span style={{ fontSize: 28 }}>⚠️</span>
                <span style={S.noFaceText}>{faceError}</span>
              </div>
            )}

            {!isRealTime && camReady && (
              <div style={S.hint}>
                <span style={{ color: '#fff', fontSize: 12 }}>Press <b>▶ Live</b> for real-time detection</span>
              </div>
            )}
          </div>
        )}
      </View>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Face / classifier error message */}
      {faceError && (
        <View style={styles.faceErrorBox}>
          <Text style={styles.faceErrorText}>⚠️ {faceError}</Text>
          <Text style={styles.faceErrorSub}>Please make sure the child's face is clearly visible.</Text>
        </View>
      )}

      <View style={styles.btnArea}>
        {loading ? ( 
          <ActivityIndicator size='large' color='#3498DB' />
        ) : captured ? (
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnRed} onPress={resetAll}>
              <Text style={styles.btnText}>🔄 Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGreen} onPress={proceedToResult}>
              <Text style={styles.btnText}>📊 See Result →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnGray} onPress={() => {
              const nf = facing === 'user' ? 'environment' : 'user';
              setFacing(nf); startCamera(nf);
            }}>
              <Text style={styles.btnText}>🔃</Text>
            </TouchableOpacity>
            {isRealTime ? (
              <TouchableOpacity style={styles.btnOrange} onPress={stopRealTime}>
                <Text style={styles.btnText}>⏹ Stop</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btnGreen, !camReady && styles.btnDisabled]} onPress={startRealTime} disabled={!camReady}>
                <Text style={styles.btnText}>{camReady ? '▶ Live' : '⏳...'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btnBlue, !camReady && styles.btnDisabled]} onPress={takePicture} disabled={!camReady}>
              <Text style={styles.btnText}>📸</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPurple} onPress={choosePhoto}>
              <Text style={styles.btnText}>🖼️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const S = {
  overlay   : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  oval      : { width: 200, height: 260, borderRadius: '50%', border: '2px dashed rgba(52,152,219,0.8)' },
  guideText : { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 8, background: 'rgba(0,0,0,0.3)', padding: '3px 10px', borderRadius: 20 },
  liveBox   : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '3px solid', borderRadius: 14, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  topBar    : { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px', borderRadius: '12px 12px 0 0' },
  emotionTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  anxietyTxt: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },
  bottomBar : { background: 'rgba(0,0,0,0.72)', padding: '8px 12px', borderRadius: '0 0 12px 12px' },
  barRow    : { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  barLbl    : { color: '#fff', fontSize: 11, width: 60 },
  barBg     : { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginLeft: 6, marginRight: 6, overflow: 'hidden' },
  barPct    : { color: '#aaa', fontSize: 10, width: 35, textAlign: 'right' },
  spinner   : { position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 10 },
  hint      : { position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' },
  noFaceBox : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(231,76,60,0.45)', pointerEvents: 'none' },
  noFaceText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'center', padding: '0 20px' },
};

const styles = StyleSheet.create({
  container    : { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', padding: 12 },
  center       : { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  backBtn      : { alignSelf: 'flex-start', padding: 8 },
  backText     : { color: '#3498DB', fontSize: 14, fontWeight: 'bold' },
  title        : { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  subtitle     : { fontSize: 12, color: '#3498DB', fontWeight: 'bold', marginBottom: 10 },
  cameraBox    : { width: '100%', flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#3498DB', marginBottom: 10 },
  btnArea      : { width: '100%', alignItems: 'center', paddingBottom: 8 },
  row          : { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  btnBlue      : { backgroundColor: '#3498DB', paddingVertical: 13, paddingHorizontal: 22, borderRadius: 12 },
  btnGreen     : { backgroundColor: '#2ECC71', paddingVertical: 13, paddingHorizontal: 22, borderRadius: 12 },
  btnRed       : { backgroundColor: '#E74C3C', paddingVertical: 13, paddingHorizontal: 22, borderRadius: 12 },
  btnOrange    : { backgroundColor: '#E67E22', paddingVertical: 13, paddingHorizontal: 22, borderRadius: 12 },
  btnGray      : { backgroundColor: '#555', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12 },
  btnPurple    : { backgroundColor: '#9B59B6', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12 },
  btnDisabled  : { backgroundColor: '#333' },
  btnText      : { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  errorText    : { color: '#E74C3C', fontSize: 15, textAlign: 'center', marginBottom: 20 },
  faceErrorBox : { width: '100%', backgroundColor: '#3d1515', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E74C3C' },
  faceErrorText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  faceErrorSub : { color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 3 },
});