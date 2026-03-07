import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { analyzeDrawing } from '../../services/dinth/anxietyService';

const COLORS = [
  { hex:'#FF4444', name:'Red'    },
  { hex:'#FF8C00', name:'Orange' },
  { hex:'#FFD700', name:'Yellow' },
  { hex:'#FF69B4', name:'Pink'   },
  { hex:'#4CAF50', name:'Green'  },
  { hex:'#2196F3', name:'Blue'   },
  { hex:'#9C27B0', name:'Purple' },
  { hex:'#795548', name:'Brown'  },
  { hex:'#607D8B', name:'Gray'   },
  { hex:'#212121', name:'Black'  },
];

const BRUSH_SIZES = [
  { size:6,  label:'S' },
  { size:12, label:'M' },
  { size:20, label:'L' },
];

// ── Zones matching simple house layout ───────────────────────
const ZONES = {
  sky         : { points:[[0,0],[500,0],[500,175],[0,175]]           },
  roof        : { points:[[90,177],[250,65],[410,177]]               },
  wall        : { points:[[110,175],[390,175],[390,340],[110,340]]   },
  door        : { points:[[210,265],[290,265],[290,340],[210,340]]   },
  window_left : { points:[[130,200],[195,200],[195,258],[130,258]]   },
  window_right: { points:[[305,200],[370,200],[370,258],[305,258]]   },
  ground      : { points:[[0,340],[500,340],[500,420],[0,420]]       },
};

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj-xi)*(py-yi))/(yj-yi)+xi)
      inside = !inside;
  }
  return inside;
}

function getZone(x, y) {
  for (const [id, z] of Object.entries(ZONES))
    if (pointInPoly(x, y, z.points)) return id;
  return null;
}

function colorDarkness(hex) {
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return 1 - (r*299 + g*587 + b*114) / 1000 / 255;
}

// ── Draw clean simple house outline ──────────────────────────
function drawHouse(ctx) {
  ctx.clearRect(0, 0, 500, 420);

  // Pure white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 500, 420);

  // All lines same style
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth   = 3;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';

  // ── Ground line ───────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(40, 340);
  ctx.lineTo(460, 340);
  ctx.stroke();

  // ── Walls ─────────────────────────────────────────────────
  ctx.strokeRect(110, 175, 280, 165);

  // ── Roof ──────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(90,  177);
  ctx.lineTo(250, 65);
  ctx.lineTo(410, 177);
  ctx.closePath();
  ctx.stroke();

  // ── Door ──────────────────────────────────────────────────
  ctx.strokeRect(210, 265, 80, 75);

  // ── Door knob ─────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(283, 305, 4, 0, Math.PI * 2);
  ctx.stroke();

  // ── Left window ───────────────────────────────────────────
  ctx.strokeRect(130, 200, 65, 58);
  ctx.beginPath();
  ctx.moveTo(162, 200); ctx.lineTo(162, 258);
  ctx.moveTo(130, 229); ctx.lineTo(195, 229);
  ctx.stroke();

  // ── Right window ──────────────────────────────────────────
  ctx.strokeRect(305, 200, 65, 58);
  ctx.beginPath();
  ctx.moveTo(337, 200); ctx.lineTo(337, 258);
  ctx.moveTo(305, 229); ctx.lineTo(370, 229);
  ctx.stroke();
}

// ═════════════════════════════════════════════════════════════
export default function DrawingScreen({ navigation, route }) {
  const { cameraResult, cameraImageUri } = route.params;

  const canvasRef       = useRef(null);
  const isDrawing       = useRef(false);
  const lastPos         = useRef(null);
  const strokeCount     = useRef(0);
  const colorUsage      = useRef({});
  const zoneStrokes     = useRef({});
  const zoneDarkness    = useRef({});
  const crossings       = useRef(0);
  const pauses          = useRef([]);
  const paintedPixels   = useRef({});
  const overpaintPixels = useRef(0);
  const lastStrokeTime  = useRef(Date.now());
  const sessionStart    = useRef(Date.now());

  const [color,    setColor]    = useState('#FF4444');
  const [brush,    setBrush]    = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawHouse(canvasRef.current.getContext('2d'));
      sessionStart.current   = Date.now();
      lastStrokeTime.current = Date.now();
    }
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const sx   = canvas.width  / rect.width;
    const sy   = canvas.height / rect.height;
    const cx   = e.touches ? e.touches[0].clientX : e.clientX;
    const cy   = e.touches ? e.touches[0].clientY : e.clientY;
    return { x:(cx - rect.left)*sx, y:(cy - rect.top)*sy };
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

    ctx.strokeStyle = c;
    ctx.lineWidth   = brush;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (!isEraser) {
      strokeCount.current++;
      const dark = colorDarkness(color);
      colorUsage.current[color] = (colorUsage.current[color] || 0) + 1;

      const zone = getZone(pos.x, pos.y);
      const prev = getZone(lastPos.current.x, lastPos.current.y);

      if (zone) {
        zoneStrokes.current[zone] = (zoneStrokes.current[zone] || 0) + 1;
        if (!zoneDarkness.current[zone])
          zoneDarkness.current[zone] = { total:0, count:0 };
        zoneDarkness.current[zone].total += dark;
        zoneDarkness.current[zone].count++;
      }

      if (prev && zone && prev !== zone) crossings.current++;

      const pk = `${Math.floor(pos.x/4)}_${Math.floor(pos.y/4)}`;
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
    strokeCount.current     = 0;
    colorUsage.current      = {};
    zoneStrokes.current     = {};
    zoneDarkness.current    = {};
    crossings.current       = 0;
    pauses.current          = [];
    paintedPixels.current   = {};
    overpaintPixels.current = 0;
    sessionStart.current    = Date.now();
    drawHouse(canvasRef.current.getContext('2d'));
  };

  const finishDrawing = async () => {
    setLoading(true);
    try {
      const metrics = {
        totalStrokes   : strokeCount.current,
        colorUsage     : { ...colorUsage.current },
        zoneStrokes    : { ...zoneStrokes.current },
        zoneDarkness   : JSON.parse(JSON.stringify(zoneDarkness.current)),
        crossings      : crossings.current,
        pauses         : [...pauses.current],
        overpaintPixels: overpaintPixels.current,
        duration       : Date.now() - sessionStart.current,
      };

      const drawingImageUri = canvasRef.current.toDataURL('image/png');
      const data = await analyzeDrawing(metrics, cameraResult.anxiety_score);

      navigation.navigate('FinalResultScreen', {
        cameraResult,
        drawingResult  : data,
        cameraImageUri,
        drawingImageUri,
      });
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>🎨 Color the House</Text>
      <Text style={styles.subtitle}>Step 3 of 3 — Color any way you like!</Text>

      {/* Canvas */}
      <View style={styles.canvasBox}>
        <canvas
          ref={canvasRef}
          width={500}
          height={420}
          style={{
            width     : '100%',
            height    : '100%',
            cursor    : isEraser ? 'cell' : 'crosshair',
            touchAction: 'none',
            display   : 'block',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </View>

      {/* Color palette */}
      <View style={styles.palette}>
        {COLORS.map(c => (
          <TouchableOpacity
            key={c.hex}
            onPress={() => { setColor(c.hex); setIsEraser(false); }}
            style={[
              styles.colorBtn,
              { backgroundColor: c.hex },
              color === c.hex && !isEraser && styles.colorSelected,
            ]}
          />
        ))}
        <TouchableOpacity
          onPress={() => setIsEraser(!isEraser)}
          style={[styles.eraserBtn, isEraser && styles.eraserActive]}
        >
          <Text style={{ fontSize:18 }}>🧹</Text>
        </TouchableOpacity>
      </View>

      {/* Brush sizes */}
      <View style={styles.brushRow}>
        <Text style={styles.brushLabel}>Size:</Text>
        {BRUSH_SIZES.map(b => (
          <TouchableOpacity
            key={b.size}
            onPress={() => setBrush(b.size)}
            style={[
              styles.brushBtn,
              { width: b.size+24, height: b.size+24, borderRadius: (b.size+24)/2 },
              brush === b.size && { backgroundColor: isEraser ? '#555' : color, borderColor:'#fff' },
            ]}
          >
            <Text style={[styles.brushText, brush === b.size && { color:'#fff' }]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.btnRow}>
        {loading ? (
          <ActivityIndicator size='large' color='#2ECC71' />
        ) : (
          <>
            <TouchableOpacity style={styles.btnGray} onPress={resetCanvas}>
              <Text style={styles.btnText}>🔄 Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGreen} onPress={finishDrawing}>
              <Text style={styles.btnText}>✅ Done → Report</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container    : { flex:1, backgroundColor:'#1a1a2e', alignItems:'center', padding:12 },
  title        : { fontSize:20, fontWeight:'bold', color:'#fff', marginTop:8 },
  subtitle     : { fontSize:12, color:'#3498DB', fontWeight:'bold', marginBottom:10 },
  canvasBox    : {
    width       : '100%',
    flex        : 1,
    borderRadius: 16,
    overflow    : 'hidden',
    borderWidth : 3,
    borderColor : '#3498DB',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  palette      : {
    flexDirection : 'row',
    flexWrap      : 'wrap',
    justifyContent: 'center',
    gap           : 10,
    marginBottom  : 10,
  },
  colorBtn     : {
    width       : 34,
    height      : 34,
    borderRadius: 17,
    borderWidth : 2,
    borderColor : 'rgba(255,255,255,0.2)',
  },
  colorSelected: {
    borderColor : '#fff',
    borderWidth : 3,
    transform   : [{ scale: 1.25 }],
  },
  eraserBtn    : {
    width          : 34,
    height         : 34,
    borderRadius   : 17,
    borderWidth    : 2,
    borderColor    : '#555',
    backgroundColor: '#fff',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  eraserActive : { borderColor:'#3498DB', backgroundColor:'#EBF5FB' },
  brushRow     : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 10,
    marginBottom  : 12,
  },
  brushLabel   : { color:'#aaa', fontSize:13, fontWeight:'bold' },
  brushBtn     : {
    backgroundColor: '#2a2a3e',
    borderWidth    : 2,
    borderColor    : '#444',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  brushText    : { color:'#aaa', fontSize:11, fontWeight:'bold' },
  btnRow       : { flexDirection:'row', gap:14, paddingBottom:8 },
  btnGreen     : {
    backgroundColor  : '#2ECC71',
    paddingVertical  : 13,
    paddingHorizontal: 28,
    borderRadius     : 12,
  },
  btnGray      : {
    backgroundColor  : '#555',
    paddingVertical  : 13,
    paddingHorizontal: 20,
    borderRadius     : 12,
  },
  btnText      : { color:'#fff', fontWeight:'bold', fontSize:14 },
});