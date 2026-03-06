import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { predictAnxiety } from '../../services/dinth/anxietyService';

const PREDICTION_INTERVAL = 2000; // predict every 2 seconds

export default function ChildScreen({ navigation }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);

  const [camReady,    setCamReady]    = useState(false);
  const [error,       setError]       = useState(null);
  const [facing,      setFacing]      = useState('user');
  const [predicting,  setPredicting]  = useState(false);
  const [liveResult,  setLiveResult]  = useState(null);
  const [isRealTime,  setIsRealTime]  = useState(false);
  const [captured,    setCaptured]    = useState(null);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    startCamera('user');
    return () => {
      stopRealTime();
      stopCamera();
    };
  }, []);

  // ── Camera ────────────────────────────────────────────────
  const startCamera = async (facingMode = 'user') => {
    stopRealTime();
    stopCamera();
    setCamReady(false);
    setLiveResult(null);
    setError(null);
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
    } catch (e) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCamReady(false);
  };

  const flipCamera = () => {
    const newFacing = facing === 'user' ? 'environment' : 'user';
    setFacing(newFacing);
    startCamera(newFacing);
  };

  // ── Capture frame as dataUrl ──────────────────────────────
  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [facing]);

  // ── Real-time prediction loop ─────────────────────────────
  const startRealTime = () => {
    if (!camReady) return;
    setIsRealTime(true);
    setLiveResult(null);

    intervalRef.current = setInterval(async () => {
      if (predicting) return;
      const frame = captureFrame();
      if (!frame) return;

      try {
        setPredicting(true);
        const result = await predictAnxiety(frame);
        if (result?.data) setLiveResult(result.data);
      } catch (e) {
        // silently skip failed frames
      } finally {
        setPredicting(false);
      }
    }, PREDICTION_INTERVAL);
  };

  const stopRealTime = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRealTime(false);
    setPredicting(false);
  };

  // ── Single capture & analyze ──────────────────────────────
  const takePicture = () => {
    stopRealTime();
    const frame = captureFrame();
    if (frame) setCaptured(frame);
  };

  const analyzeImage = async () => {
    if (!captured) return;
    try {
      setLoading(true);
      const result = await predictAnxiety(captured);
      stopCamera();
      navigation.navigate('ResultScreen', {
        result  : result.data,
        imageUri: captured,
      });
      setCaptured(null);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCaptured(null);
    startCamera(facing);
  };

  // ── Upload photo ──────────────────────────────────────────
  const choosePhoto = () => {
    stopRealTime();
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader  = new FileReader();
      reader.onload = (ev) => {
        setCaptured(ev.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ── Anxiety level colors ──────────────────────────────────
  const LEVEL_COLORS = {
    HIGH    : '#E74C3C',
    MODERATE: '#F39C12',
    CALM    : '#2ECC71',
  };

  const EMOTION_COLORS = {
    Natural: '#2ECC71',
    anger  : '#E74C3C',
    fear   : '#9B59B6',
    joy    : '#F39C12',
    sadness: '#3498DB',
  };

  const LEVEL_EMOJI = {
    HIGH: '🔴', MODERATE: '🟡', CALM: '🟢'
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.btnBlue}
          onPress={() => startCamera(facing)}>
          <Text style={styles.btnText}>🔄 Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>👶 Child Anxiety Scan</Text>

      {/* ── Camera / Preview ── */}
      <View style={styles.cameraBox}>
        {captured ? (
          // Show captured image
          <img
            src={captured}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt='captured'
          />
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>

            {/* Live video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width    : '100%',
                height   : '100%',
                objectFit: 'cover',
                transform: facing === 'user' ? 'scaleX(-1)' : 'none',
              }}
            />

            {/* Face guide oval */}
            <div style={overlayStyle}>
              <div style={ovalStyle} />
              <span style={guideTextStyle}>👤 Align face here</span>
            </div>

            {/* ── Real-time result overlay ── */}
            {isRealTime && liveResult && (
              <div style={{
                ...liveOverlayStyle,
                borderColor: LEVEL_COLORS[liveResult.anxiety_level] || '#fff',
              }}>

                {/* Top bar — emotion + confidence */}
                <div style={{
                  ...topBarStyle,
                  backgroundColor: LEVEL_COLORS[liveResult.anxiety_level] + 'DD',
                }}>
                  <span style={emotionTextStyle}>
                    {LEVEL_EMOJI[liveResult.anxiety_level]}
                    {'  '}
                    {liveResult.emotion.toUpperCase()}
                    {'  '}
                    <span style={{ fontSize: 13, opacity: 0.9 }}>
                      {liveResult.confidence}%
                    </span>
                  </span>
                  <span style={anxietyTextStyle}>
                    Anxiety: {liveResult.anxiety_score}/100
                    {'  '}
                    {liveResult.anxiety_level}
                  </span>
                </div>

                {/* Bottom bar — all emotion bars */}
                <div style={bottomBarStyle}>
                  {liveResult.all_emotions &&
                    Object.entries(liveResult.all_emotions).map(([em, pct]) => (
                      <div key={em} style={barRowStyle}>
                        <span style={barLabelStyle}>{em}</span>
                        <div style={barBgStyle}>
                          <div style={{
                            height         : '100%',
                            width          : `${Math.min(pct, 100)}%`,
                            backgroundColor: EMOTION_COLORS[em] || '#888',
                            borderRadius   : 4,
                            transition     : 'width 0.4s ease',
                          }} />
                        </div>
                        <span style={barPctStyle}>{pct}%</span>
                      </div>
                    ))
                  }
                </div>

                {/* Predicting spinner */}
                {predicting && (
                  <div style={spinnerStyle}>
                    <span style={{ color: '#fff', fontSize: 11 }}>
                      🔄 Analyzing...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Real-time OFF — show start hint */}
            {!isRealTime && camReady && (
              <div style={hintStyle}>
                <span style={{ color: '#fff', fontSize: 12 }}>
                  Press <b>▶ Live</b> for real-time detection
                </span>
              </div>
            )}

          </div>
        )}
      </View>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Buttons ── */}
      <View style={styles.btnArea}>
        {loading ? (
          <ActivityIndicator size='large' color='#3498DB' />
        ) : captured ? (
          // After capture
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnRed} onPress={retake}>
              <Text style={styles.btnText}>🔄 Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGreen} onPress={analyzeImage}>
              <Text style={styles.btnText}>🔍 Analyze</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Live camera buttons
          <View style={styles.row}>

            {/* Flip */}
            <TouchableOpacity style={styles.btnGray} onPress={flipCamera}>
              <Text style={styles.btnText}>🔃</Text>
            </TouchableOpacity>

            {/* Live toggle */}
            {isRealTime ? (
              <TouchableOpacity style={styles.btnOrange} onPress={stopRealTime}>
                <Text style={styles.btnText}>⏹ Stop Live</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btnGreen, !camReady && styles.btnDisabled]}
                onPress={startRealTime}
                disabled={!camReady}
              >
                <Text style={styles.btnText}>
                  {camReady ? '▶ Live' : '⏳...'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Capture single */}
            <TouchableOpacity
              style={[styles.btnBlue, !camReady && styles.btnDisabled]}
              onPress={takePicture}
              disabled={!camReady}
            >
              <Text style={styles.btnText}>📸</Text>
            </TouchableOpacity>

            {/* Upload */}
            <TouchableOpacity style={styles.btnPurple} onPress={choosePhoto}>
              <Text style={styles.btnText}>🖼️</Text>
            </TouchableOpacity>

          </View>
        )}
      </View>

    </View>
  );
}

// ── Web overlay styles ────────────────────────────────────────
const overlayStyle = {
  position      : 'absolute',
  top           : 0, left: 0, right: 0, bottom: 0,
  display       : 'flex',
  flexDirection : 'column',
  alignItems    : 'center',
  justifyContent: 'center',
  pointerEvents : 'none',
};

const ovalStyle = {
  width       : 200,
  height      : 260,
  borderRadius: '50%',
  border      : '2px dashed rgba(52,152,219,0.7)',
};

const guideTextStyle = {
  color       : 'rgba(255,255,255,0.7)',
  fontSize    : 12,
  marginTop   : 8,
  background  : 'rgba(0,0,0,0.3)',
  padding     : '3px 10px',
  borderRadius: 20,
};

const liveOverlayStyle = {
  position     : 'absolute',
  top          : 0, left: 0, right: 0, bottom: 0,
  border       : '3px solid',
  borderRadius : 14,
  pointerEvents: 'none',
  display      : 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const topBarStyle = {
  display      : 'flex',
  flexDirection: 'column',
  alignItems   : 'center',
  padding      : '8px 16px',
  borderRadius : '12px 12px 0 0',
};

const emotionTextStyle = {
  color     : '#fff',
  fontSize  : 18,
  fontWeight: 'bold',
};

const anxietyTextStyle = {
  color    : 'rgba(255,255,255,0.9)',
  fontSize : 12,
  marginTop: 2,
};

const bottomBarStyle = {
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding        : '8px 12px',
  borderRadius   : '0 0 12px 12px',
};

const barRowStyle = {
  display      : 'flex',
  flexDirection: 'row',
  alignItems   : 'center',
  marginBottom : 4,
};

const barLabelStyle = {
  color    : '#fff',
  fontSize : 11,
  width    : 60,
};

const barBgStyle = {
  flex           : 1,
  height         : 8,
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderRadius   : 4,
  marginHorizontal: 6,
  overflow       : 'hidden',
};

const barPctStyle = {
  color    : '#aaa',
  fontSize : 10,
  width    : 35,
  textAlign: 'right',
};

const spinnerStyle = {
  position  : 'absolute',
  top       : 8,
  right     : 8,
  background: 'rgba(0,0,0,0.5)',
  padding   : '3px 8px',
  borderRadius: 10,
};

const hintStyle = {
  position        : 'absolute',
  bottom          : 12,
  left            : 0,
  right           : 0,
  display         : 'flex',
  justifyContent  : 'center',
  alignItems      : 'center',
  pointerEvents   : 'none',
};

// ── RN Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex           : 1,
    backgroundColor: '#1a1a2e',
    alignItems     : 'center',
    padding        : 12,
  },
  center: {
    flex           : 1,
    backgroundColor: '#1a1a2e',
    alignItems     : 'center',
    justifyContent : 'center',
    padding        : 24,
  },
  title: {
    fontSize  : 20,
    fontWeight: 'bold',
    color     : '#fff',
    marginTop : 8,
    marginBottom: 8,
  },
  cameraBox: {
    width       : '100%',
    flex        : 1,
    borderRadius: 16,
    overflow    : 'hidden',
    borderWidth : 2,
    borderColor : '#3498DB',
    marginBottom: 10,
  },
  btnArea: {
    width        : '100%',
    alignItems   : 'center',
    paddingBottom: 8,
  },
  row: {
    flexDirection : 'row',
    gap           : 10,
    flexWrap      : 'wrap',
    justifyContent: 'center',
  },
  btnBlue: {
    backgroundColor  : '#3498DB',
    paddingVertical  : 13,
    paddingHorizontal: 22,
    borderRadius     : 12,
  },
  btnGreen: {
    backgroundColor  : '#2ECC71',
    paddingVertical  : 13,
    paddingHorizontal: 22,
    borderRadius     : 12,
  },
  btnRed: {
    backgroundColor  : '#E74C3C',
    paddingVertical  : 13,
    paddingHorizontal: 22,
    borderRadius     : 12,
  },
  btnOrange: {
    backgroundColor  : '#E67E22',
    paddingVertical  : 13,
    paddingHorizontal: 22,
    borderRadius     : 12,
  },
  btnGray: {
    backgroundColor  : '#555',
    paddingVertical  : 13,
    paddingHorizontal: 18,
    borderRadius     : 12,
  },
  btnPurple: {
    backgroundColor  : '#9B59B6',
    paddingVertical  : 13,
    paddingHorizontal: 18,
    borderRadius     : 12,
  },
  btnDisabled: { backgroundColor: '#333' },
  btnText: {
    color     : '#fff',
    fontWeight: 'bold',
    fontSize  : 14,
  },
  errorText: {
    color       : '#E74C3C',
    fontSize    : 15,
    textAlign   : 'center',
    marginBottom: 20,
  },
});
// ```

// ## What this does
// ```
// ▶ Live button    → starts predicting every 2 seconds
//                    shows emotion + anxiety score overlay
//                    shows all 5 emotion bars live
//                    border color changes with anxiety level

// ⏹ Stop Live      → stops real-time prediction

// 📸 button        → captures single frame → go to ResultScreen

// 🖼️ button        → upload photo from device

// 🔃 button        → flip camera front/back