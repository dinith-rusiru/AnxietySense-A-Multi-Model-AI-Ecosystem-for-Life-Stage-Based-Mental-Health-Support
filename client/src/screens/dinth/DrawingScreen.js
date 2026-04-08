import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { predictDrawing } from '../../services/dinth/anxietyService';

const COLORS = [
  { hex: '#FF4444', name: 'Red'    },
  { hex: '#FF8C00', name: 'Orange' },
  { hex: '#FFD700', name: 'Yellow' },
  { hex: '#FF69B4', name: 'Pink'   },
  { hex: '#4CAF50', name: 'Green'  },
  { hex: '#2196F3', name: 'Blue'   },
  { hex: '#9C27B0', name: 'Purple' },
  { hex: '#00BCD4', name: 'Cyan'   },
  { hex: '#795548', name: 'Brown'  },
  { hex: '#607D8B', name: 'Gray'   },
  { hex: '#212121', name: 'Black'  },
];

const BRUSH_SIZES = [
  { size: 5,  label: 'S' },
  { size: 12, label: 'M' },
  { size: 22, label: 'L' },
];

// Behavioral tracking helpers
function colorDarkness(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 1 - (r * 299 + g * 587 + b * 114) / 1000 / 255;
}

function drawBlankCanvas(ctx) {
  ctx.clearRect(0, 0, 500, 430);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 500, 430);
}

export default function DrawingScreen({ navigation, route }) {
  const { cameraResult, cameraImageUri } = route.params;

  const canvasRef       = useRef(null);
  const isDrawing       = useRef(false);
  const lastPos         = useRef(null);
  const strokeCount     = useRef(0);
  const colorUsage      = useRef({});
  const pauses          = useRef([]);
  const paintedPixels   = useRef({});
  const overpaintPixels = useRef(0);
  const lastStrokeTime  = useRef(Date.now());
  const sessionStart    = useRef(Date.now());

  const [color,    setColor]    = useState('#212121');
  const [brush,    setBrush]    = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [mode,     setMode]     = useState('draw');
  const [uploadPreview, setUploadPreview] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawBlankCanvas(canvasRef.current.getContext('2d'));
      resetTracking();
    }
  }, []);

  const resetTracking = () => {
    strokeCount.current     = 0;
    colorUsage.current      = {};
    pauses.current          = [];
    paintedPixels.current   = {};
    overpaintPixels.current = 0;
    sessionStart.current    = Date.now();
    lastStrokeTime.current  = Date.now();
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current   = getPos(e, canvasRef.current);
    const gap = Date.now() - lastStrokeTime.current;
    if (gap > 3000) pauses.current.push(gap);
    lastStrokeTime.current = Date.now();
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    const c      = isEraser ? '#FFFFFF' : color;

    ctx.strokeStyle = c; ctx.lineWidth = brush;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (!isEraser) {
      strokeCount.current++;
      const dark = colorDarkness(color);
      colorUsage.current[color] = (colorUsage.current[color] || 0) + 1;
      const pk = `${Math.floor(pos.x / 4)}_${Math.floor(pos.y / 4)}`;
      paintedPixels.current[pk] = (paintedPixels.current[pk] || 0) + 1;
      if (paintedPixels.current[pk] > 3) overpaintPixels.current++;
    }
    lastPos.current = pos;
  }, [color, brush, isEraser]);

  const stopDraw = useCallback(() => {
    isDrawing.current      = false;
    lastStrokeTime.current = Date.now();
  }, []);

  const resetCanvas = () => {
    drawBlankCanvas(canvasRef.current.getContext('2d'));
    resetTracking();
  };

  const handleUpload = () => {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setUploadPreview(ev.target.result);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const finishDrawing = async () => {
    setLoading(true);
    try {
      let imageDataUrl;

      if (mode === 'upload') {
        if (!uploadPreview) { alert('Please upload a drawing first.'); setLoading(false); return; }
        imageDataUrl = uploadPreview;
      } else {
        imageDataUrl = canvasRef.current.toDataURL('image/png');
      }

      const modelResult = await predictDrawing(imageDataUrl);

      const metrics = {
        totalStrokes   : strokeCount.current,
        colorUsage     : { ...colorUsage.current },
        pauses         : [...pauses.current],
        overpaintPixels: overpaintPixels.current,
        duration       : Date.now() - sessionStart.current,
        mode,
      };

      navigation.navigate('DrawingResultScreen', {
        cameraResult,
        cameraImageUri,
        drawingImageUri    : imageDataUrl,
        drawingModelResult : modelResult.data,
        drawingMetrics     : metrics,
      });
    } catch (e) {
      alert('Error analyzing drawing: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🎨 Drawing Analysis</Text>
      <Text style={styles.subtitle}>Step 3 of 3 — Draw your family</Text>

      {/* Instruction card */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionIcon}>👨‍👩‍👧‍👦</Text>
        <Text style={styles.instructionText}>
          Please draw a picture of <Text style={styles.instructionBold}>your family</Text>.
          Include every member — take your time and use any colors you like.
        </Text>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'draw' && styles.modeBtnActive]}
          onPress={() => { setMode('draw'); setUploadPreview(null); }}>
          <Text style={[styles.modeTxt, mode === 'draw' && { color: '#fff' }]}>✏️ Draw</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'upload' && styles.modeBtnActive]}
          onPress={() => setMode('upload')}>
          <Text style={[styles.modeTxt, mode === 'upload' && { color: '#fff' }]}>🖼️ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas or Upload */}
      <View style={styles.canvasBox}>
        {mode === 'draw' ? (
          <canvas
            ref={canvasRef}
            width={500} height={430}
            style={{ width: '100%', height: '100%', cursor: isEraser ? 'cell' : 'crosshair', touchAction: 'none', display: 'block' }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f3460', flexDirection: 'column', gap: 12 }}>
            {uploadPreview ? (
              <img src={uploadPreview} alt='drawing' style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
            ) : (
              <>
                <span style={{ fontSize: 48 }}>🖼️</span>
                <span style={{ color: '#aaa', fontSize: 14 }}>Tap below to upload a drawing</span>
              </>
            )}
          </div>
        )}
      </View>

      {/* Draw mode controls */}
      {mode === 'draw' && (
        <>
          <View style={styles.palette}>
            {COLORS.map(c => (
              <TouchableOpacity key={c.hex}
                onPress={() => { setColor(c.hex); setIsEraser(false); }}
                style={[styles.colorBtn, { backgroundColor: c.hex },
                  color === c.hex && !isEraser && styles.colorSelected]} />
            ))}
            <TouchableOpacity onPress={() => setIsEraser(!isEraser)}
              style={[styles.eraserBtn, isEraser && styles.eraserActive]}>
              <Text style={{ fontSize: 16 }}>🧹</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brushRow}>
            <Text style={styles.brushLabel}>Brush:</Text>
            {BRUSH_SIZES.map(b => (
              <TouchableOpacity key={b.size} onPress={() => setBrush(b.size)}
                style={[styles.brushBtn, { width: b.size + 22, height: b.size + 22, borderRadius: (b.size + 22) / 2 },
                  brush === b.size && { backgroundColor: isEraser ? '#555' : color, borderColor: '#fff' }]}>
                <Text style={[styles.brushTxt, brush === b.size && { color: '#fff' }]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Action buttons */}
      <View style={styles.btnRow}>
        {loading ? (
          <ActivityIndicator size='large' color='#2ECC71' />
        ) : (
          <>
            {mode === 'draw' ? (
              <TouchableOpacity style={styles.btnGray} onPress={resetCanvas}>
                <Text style={styles.btnText}>🔄 Reset</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnBlue} onPress={handleUpload}>
                <Text style={styles.btnText}>📁 {uploadPreview ? 'Change' : 'Upload'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnGreen} onPress={finishDrawing}>
              <Text style={styles.btnText}>✅ Analyze →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container       : { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', padding: 10 },
  backBtn         : { alignSelf: 'flex-start', padding: 6 },
  backText        : { color: '#3498DB', fontSize: 14, fontWeight: 'bold' },
  title           : { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  subtitle        : { fontSize: 12, color: '#3498DB', fontWeight: 'bold', marginBottom: 8 },

  instructionCard : {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f3460', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 10, width: '100%',
    borderLeftWidth: 4, borderLeftColor: '#3498DB',
  },
  instructionIcon : { fontSize: 26, marginRight: 10 },
  instructionText : { flex: 1, color: '#ccc', fontSize: 13, lineHeight: 19 },
  instructionBold : { color: '#fff', fontWeight: 'bold' },

  modeRow         : { flexDirection: 'row', backgroundColor: '#0f3460', borderRadius: 12, padding: 4, gap: 4, marginBottom: 8 },
  modeBtn         : { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 9 },
  modeBtnActive   : { backgroundColor: '#3498DB' },
  modeTxt         : { color: '#aaa', fontWeight: 'bold', fontSize: 13 },

  canvasBox       : { width: '100%', flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: '#3498DB', marginBottom: 8, backgroundColor: '#fff' },
  palette         : { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 8 },
  colorBtn        : { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  colorSelected   : { borderColor: '#fff', borderWidth: 3, transform: [{ scale: 1.2 }] },
  eraserBtn       : { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#555', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  eraserActive    : { borderColor: '#3498DB' },
  brushRow        : { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  brushLabel      : { color: '#aaa', fontSize: 13, fontWeight: 'bold' },
  brushBtn        : { backgroundColor: '#2a2a3e', borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  brushTxt        : { color: '#aaa', fontSize: 10, fontWeight: 'bold' },
  btnRow          : { flexDirection: 'row', gap: 12, paddingBottom: 6 },
  btnGreen        : { backgroundColor: '#2ECC71', paddingVertical: 13, paddingHorizontal: 28, borderRadius: 12 },
  btnGray         : { backgroundColor: '#555', paddingVertical: 13, paddingHorizontal: 20, borderRadius: 12 },
  btnBlue         : { backgroundColor: '#3498DB', paddingVertical: 13, paddingHorizontal: 20, borderRadius: 12 },
  btnText         : { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});