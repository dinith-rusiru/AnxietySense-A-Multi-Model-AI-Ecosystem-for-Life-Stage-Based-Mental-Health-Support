import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  PanResponder,
  Alert,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle, Rect, Ellipse } from 'react-native-svg';
import { completeActivity } from './ActivityService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─────────── Main Screen ─────────── */

export default function ActivityPlayerScreen({ route, navigation }) {
  const { activity, anxietyLevel } = route.params || {};
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    try {
      await completeActivity(activity.name, anxietyLevel);
      setCompleted(true);
      Alert.alert('Well done!', `You completed "${activity.name}".`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save completion.');
    }
  };

  const renderActivity = () => {
    switch (activity.type) {
      case 'drawing':
        return <FreeDrawing onComplete={handleComplete} />;
      case 'prompt_drawing':
        return <PromptDrawing prompts={activity.prompts} onComplete={handleComplete} />;
      case 'breathing':
        return <BreathingExercise config={activity.config} name={activity.name} onComplete={handleComplete} />;
      case 'colouring':
        return <ColouringActivity onComplete={handleComplete} />;
      case 'muscle_relaxation':
        return <MuscleRelaxation onComplete={handleComplete} />;
      case 'meditation':
        return <BodyScanMeditation onComplete={handleComplete} />;
      case 'nature_sounds':
        return <NatureSoundTherapy onComplete={handleComplete} />;
      case 'journal':
        return <GratitudeJournal onComplete={handleComplete} />;
      case 'music_therapy':
        return <MusicTherapy onComplete={handleComplete} />;
      default:
        return (
          <View style={styles.center}>
            <Text style={styles.infoText}>Activity not yet implemented.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleComplete}>
              <Text style={styles.primaryBtnText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{activity.icon}</Text>
        <Text style={styles.headerTitle}>{activity.name}</Text>
      </View>
      <View style={styles.content}>{renderActivity()}</View>
    </View>
  );
}

/* ═══════════════════════════════════════
   FREE DRAWING
   ═══════════════════════════════════════ */

function FreeDrawing({ onComplete }) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [color, setColor] = useState('#333333');
  const colors = ['#333333', '#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1'];

  // Use refs to track current stroke so PanResponder closures aren't stale
  const currentPathRef = useRef([]);
  const colorRef = useRef(color);
  useEffect(() => { colorRef.current = color; }, [color]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = [{ x: locationX, y: locationY }];
        setCurrentPath([...currentPathRef.current]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current.push({ x: locationX, y: locationY });
        setCurrentPath([...currentPathRef.current]);
      },
      onPanResponderRelease: () => {
        const finished = [...currentPathRef.current];
        const usedColor = colorRef.current;
        setPaths((prev) => [...prev, { points: finished, color: usedColor }]);
        currentPathRef.current = [];
        setCurrentPath([]);
      },
    }),
  ).current;

  return (
    <View style={styles.drawingContainer}>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {paths.map((path, pi) => (
          <DrawPath key={pi} points={path.points} color={path.color} />
        ))}
        {currentPath.length > 0 && <DrawPath points={currentPath} color={color} />}
      </View>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setPaths([]); currentPathRef.current = []; setCurrentPath([]); }}>
          <Text style={styles.secondaryBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onComplete}>
          <Text style={styles.primaryBtnText}>Save & Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DrawPath({ points, color }) {
  if (points.length < 2) return null;
  return (
    <>
      {points.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x - 3,
            top: p.y - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════
   PROMPT DRAWING
   ═══════════════════════════════════════ */

function PromptDrawing({ prompts, onComplete }) {
  const drawPrompts = prompts || [
    'Draw how you feel today',
    'Draw a place that makes you calm',
    'Draw something that makes you smile',
  ];
  const [promptIdx, setPromptIdx] = useState(0);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [color, setColor] = useState('#333333');
  const colors = ['#333333', '#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA'];

  // Use refs to track current stroke so PanResponder closures aren't stale
  const currentPathRef = useRef([]);
  const colorRef = useRef(color);
  useEffect(() => { colorRef.current = color; }, [color]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = [{ x: locationX, y: locationY }];
        setCurrentPath([...currentPathRef.current]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current.push({ x: locationX, y: locationY });
        setCurrentPath([...currentPathRef.current]);
      },
      onPanResponderRelease: () => {
        const finished = [...currentPathRef.current];
        const usedColor = colorRef.current;
        setPaths((prev) => [...prev, { points: finished, color: usedColor }]);
        currentPathRef.current = [];
        setCurrentPath([]);
      },
    }),
  ).current;

  const nextPrompt = () => {
    if (promptIdx < drawPrompts.length - 1) {
      setPromptIdx(promptIdx + 1);
      setPaths([]);
      currentPathRef.current = [];
      setCurrentPath([]);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.drawingContainer}>
      <View style={styles.promptBanner}>
        <Text style={styles.promptText}>
          {promptIdx + 1}/{drawPrompts.length}: {drawPrompts[promptIdx]}
        </Text>
      </View>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {paths.map((path, pi) => (
          <DrawPath key={pi} points={path.points} color={path.color} />
        ))}
        {currentPath.length > 0 && <DrawPath points={currentPath} color={color} />}
      </View>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setPaths([]); currentPathRef.current = []; setCurrentPath([]); }}>
          <Text style={styles.secondaryBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={nextPrompt}>
          <Text style={styles.primaryBtnText}>
            {promptIdx < drawPrompts.length - 1 ? 'Next Prompt' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════
   BREATHING EXERCISE
   ═══════════════════════════════════════ */

function BreathingExercise({ config, name, onComplete }) {
  const { inhale = 4, hold = 2, exhale = 6, cycles = 5 } = config || {};
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale, done
  const [cycle, setCycle] = useState(0);
  const [timer, setTimer] = useState(0);
  const scale = useRef(new Animated.Value(0.5)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startBreathing = () => {
    setPhase('inhale');
    setCycle(1);
    runPhase('inhale', 1);
  };

  const runPhase = (currentPhase, currentCycle) => {
    if (currentCycle > cycles) {
      setPhase('done');
      return;
    }

    let duration;
    let toValue;

    if (currentPhase === 'inhale') {
      duration = inhale * 1000;
      toValue = 1;
      setPhase('inhale');
    } else if (currentPhase === 'hold') {
      duration = hold * 1000;
      toValue = 1;
      setPhase('hold');
    } else {
      duration = exhale * 1000;
      toValue = 0.5;
      setPhase('exhale');
    }

    setTimer(Math.ceil(duration / 1000));
    let remaining = Math.ceil(duration / 1000);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setTimer(Math.max(remaining, 0));
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);

    Animated.timing(scale, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (currentPhase === 'inhale') {
        runPhase('hold', currentCycle);
      } else if (currentPhase === 'hold') {
        runPhase('exhale', currentCycle);
      } else {
        setCycle(currentCycle + 1);
        if (currentCycle + 1 > cycles) {
          setPhase('done');
        } else {
          runPhase('inhale', currentCycle + 1);
        }
      }
    });
  };

  const phaseLabel = {
    ready: 'Tap to begin',
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    done: 'Great job!',
  };

  const phaseColor = {
    ready: '#4C9F70',
    inhale: '#42A5F5',
    hold: '#FFA726',
    exhale: '#66BB6A',
    done: '#4C9F70',
  };

  return (
    <View style={styles.breathingContainer}>
      <Text style={styles.breathingName}>{name}</Text>
      <Text style={styles.breathingInfo}>
        Inhale {inhale}s → Hold {hold}s → Exhale {exhale}s • {cycles} cycles
      </Text>
      <View style={styles.breathingCircleWrap}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              backgroundColor: phaseColor[phase],
              transform: [{ scale }],
            },
          ]}
        >
          <Text style={styles.breathingPhaseText}>{phaseLabel[phase]}</Text>
          {phase !== 'ready' && phase !== 'done' && (
            <Text style={styles.breathingTimer}>{timer}s</Text>
          )}
        </Animated.View>
      </View>
      <Text style={styles.breathingCycle}>
        {phase !== 'ready' && phase !== 'done' ? `Cycle ${cycle} of ${cycles}` : ''}
      </Text>
      {phase === 'ready' && (
        <TouchableOpacity style={styles.primaryBtn} onPress={startBreathing}>
          <Text style={styles.primaryBtnText}>Start Breathing</Text>
        </TouchableOpacity>
      )}
      {phase === 'done' && (
        <TouchableOpacity style={styles.primaryBtn} onPress={onComplete}>
          <Text style={styles.primaryBtnText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════
   COLOURING TEMPLATES
   ═══════════════════════════════════════ */

function ColouringActivity({ onComplete }) {
  const palette = ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#FB8C00', '#8E24AA', '#00ACC1', '#F48FB1', '#6D4C41'];
  const [selectedColor, setSelectedColor] = useState('#E53935');
  const [templateIdx, setTemplateIdx] = useState(0);
  const [regionColors, setRegionColors] = useState({});

  const templates = [
    {
      id: 'butterfly-meadow',
      title: 'Butterfly Meadow',
      viewBox: '0 0 300 300',
      regions: [
        { id: 'background', kind: 'rect', x: 0, y: 0, width: 300, height: 300 },
        { id: 'ground', kind: 'path', d: 'M0 228 C60 208 120 220 180 210 C230 203 270 210 300 205 L300 300 L0 300 Z' },
        { id: 'sun', kind: 'circle', cx: 252, cy: 46, r: 26 },
        { id: 'wing-top-left', kind: 'path', d: 'M148 118 C130 72 80 64 52 95 C40 110 46 132 64 141 C93 156 128 145 148 118 Z' },
        { id: 'wing-bottom-left', kind: 'path', d: 'M148 160 C120 167 90 182 76 206 C64 226 80 244 103 240 C127 236 145 208 148 160 Z' },
        { id: 'wing-top-right', kind: 'path', d: 'M152 118 C170 72 220 64 248 95 C260 110 254 132 236 141 C207 156 172 145 152 118 Z' },
        { id: 'wing-bottom-right', kind: 'path', d: 'M152 160 C180 167 210 182 224 206 C236 226 220 244 197 240 C173 236 155 208 152 160 Z' },
        { id: 'body', kind: 'path', d: 'M142 108 C140 128 140 184 142 220 L158 220 C160 184 160 128 158 108 Z' },
        { id: 'head', kind: 'circle', cx: 150, cy: 96, r: 12 },
        { id: 'spot-left-top', kind: 'circle', cx: 104, cy: 112, r: 10 },
        { id: 'spot-left-bottom', kind: 'circle', cx: 108, cy: 196, r: 9 },
        { id: 'spot-right-top', kind: 'circle', cx: 196, cy: 112, r: 10 },
        { id: 'spot-right-bottom', kind: 'circle', cx: 192, cy: 196, r: 9 },
      ],
      lines: [
        { kind: 'circle', cx: 252, cy: 46, r: 26 },
        { kind: 'path', d: 'M148 118 C130 72 80 64 52 95 C40 110 46 132 64 141 C93 156 128 145 148 118 Z' },
        { kind: 'path', d: 'M148 160 C120 167 90 182 76 206 C64 226 80 244 103 240 C127 236 145 208 148 160 Z' },
        { kind: 'path', d: 'M152 118 C170 72 220 64 248 95 C260 110 254 132 236 141 C207 156 172 145 152 118 Z' },
        { kind: 'path', d: 'M152 160 C180 167 210 182 224 206 C236 226 220 244 197 240 C173 236 155 208 152 160 Z' },
        { kind: 'path', d: 'M142 108 C140 128 140 184 142 220 L158 220 C160 184 160 128 158 108 Z' },
        { kind: 'circle', cx: 150, cy: 96, r: 12 },
        { kind: 'path', d: 'M148 90 C138 74 126 69 116 66' },
        { kind: 'path', d: 'M152 90 C162 74 174 69 184 66' },
        { kind: 'circle', cx: 104, cy: 112, r: 10 },
        { kind: 'circle', cx: 108, cy: 196, r: 9 },
        { kind: 'circle', cx: 196, cy: 112, r: 10 },
        { kind: 'circle', cx: 192, cy: 196, r: 9 },
      ],
    },
    {
      id: 'house-scene',
      title: 'House Scene',
      viewBox: '0 0 300 300',
      regions: [
        { id: 'background', kind: 'rect', x: 0, y: 0, width: 300, height: 300 },
        { id: 'ground', kind: 'path', d: 'M0 205 C48 192 104 201 145 196 C197 191 248 201 300 194 L300 300 L0 300 Z' },
        { id: 'sun', kind: 'circle', cx: 255, cy: 44, r: 28 },
        { id: 'roof', kind: 'path', d: 'M70 142 L150 78 L230 142 Z' },
        { id: 'house-wall', kind: 'rect', x: 82, y: 142, width: 136, height: 104 },
        { id: 'door', kind: 'rect', x: 134, y: 188, width: 34, height: 58 },
        { id: 'window-left', kind: 'rect', x: 100, y: 160, width: 26, height: 26 },
        { id: 'window-right', kind: 'rect', x: 174, y: 160, width: 26, height: 26 },
        { id: 'path', kind: 'path', d: 'M136 246 L164 246 L182 300 L118 300 Z' },
      ],
      lines: [
        { kind: 'circle', cx: 255, cy: 44, r: 28 },
        { kind: 'path', d: 'M70 142 L150 78 L230 142 Z' },
        { kind: 'rect', x: 82, y: 142, width: 136, height: 104 },
        { kind: 'rect', x: 134, y: 188, width: 34, height: 58 },
        { kind: 'rect', x: 100, y: 160, width: 26, height: 26 },
        { kind: 'path', d: 'M113 160 L113 186' },
        { kind: 'path', d: 'M100 173 L126 173' },
        { kind: 'rect', x: 174, y: 160, width: 26, height: 26 },
        { kind: 'path', d: 'M187 160 L187 186' },
        { kind: 'path', d: 'M174 173 L200 173' },
        { kind: 'path', d: 'M151 188 L151 246' },
        { kind: 'circle', cx: 162, cy: 219, r: 2.5 },
        { kind: 'path', d: 'M136 246 L164 246 L182 300 L118 300 Z' },
      ],
    },
    {
      id: 'fish-ocean',
      title: 'Fish Ocean',
      viewBox: '0 0 300 300',
      regions: [
        { id: 'background', kind: 'rect', x: 0, y: 0, width: 300, height: 300 },
        { id: 'water', kind: 'path', d: 'M0 58 C42 48 75 72 120 62 C162 52 202 70 242 60 C263 55 281 54 300 58 L300 300 L0 300 Z' },
        { id: 'fish-body', kind: 'ellipse', cx: 150, cy: 160, rx: 66, ry: 42 },
        { id: 'tail', kind: 'path', d: 'M214 160 L262 124 L262 196 Z' },
        { id: 'fin-top', kind: 'path', d: 'M132 122 C138 102 160 92 176 110 C166 120 156 128 150 140 Z' },
        { id: 'fin-bottom', kind: 'path', d: 'M136 198 C146 220 170 226 182 206 C170 196 160 190 150 180 Z' },
        { id: 'eye-white', kind: 'circle', cx: 112, cy: 152, r: 10 },
        { id: 'eye-pupil', kind: 'circle', cx: 115, cy: 152, r: 4 },
        { id: 'bubble-1', kind: 'circle', cx: 64, cy: 78, r: 10 },
        { id: 'bubble-2', kind: 'circle', cx: 92, cy: 54, r: 6 },
        { id: 'bubble-3', kind: 'circle', cx: 252, cy: 84, r: 8 },
      ],
      lines: [
        { kind: 'path', d: 'M0 58 C42 48 75 72 120 62 C162 52 202 70 242 60 C263 55 281 54 300 58' },
        { kind: 'ellipse', cx: 150, cy: 160, rx: 66, ry: 42 },
        { kind: 'path', d: 'M214 160 L262 124 L262 196 Z' },
        { kind: 'path', d: 'M132 122 C138 102 160 92 176 110 C166 120 156 128 150 140 Z' },
        { kind: 'path', d: 'M136 198 C146 220 170 226 182 206 C170 196 160 190 150 180 Z' },
        { kind: 'circle', cx: 112, cy: 152, r: 10 },
        { kind: 'circle', cx: 115, cy: 152, r: 4 },
        { kind: 'circle', cx: 64, cy: 78, r: 10 },
        { kind: 'circle', cx: 92, cy: 54, r: 6 },
        { kind: 'circle', cx: 252, cy: 84, r: 8 },
      ],
    },
  ];

  const activeTemplate = templates[templateIdx];

  const paintRegion = (regionId) => {
    setRegionColors((prev) => ({ ...prev, [regionId]: selectedColor }));
  };

  const resetPicture = () => {
    setRegionColors({});
  };

  const renderShape = (shape, key, shapeProps) => {
    if (shape.kind === 'rect') {
      return <Rect key={key} {...shapeProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
    }
    if (shape.kind === 'circle') {
      return <Circle key={key} {...shapeProps} cx={shape.cx} cy={shape.cy} r={shape.r} />;
    }
    if (shape.kind === 'ellipse') {
      return <Ellipse key={key} {...shapeProps} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />;
    }
    return <Path key={key} {...shapeProps} d={shape.d} />;
  };

  return (
    <View style={styles.colouringContainer}>
      <Text style={styles.colouringTitle}>Tap a region inside the black lines to color it</Text>
      <View style={styles.templateRow}>
        {templates.map((t, idx) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.templateChip, idx === templateIdx && styles.templateChipActive]}
            onPress={() => {
              setTemplateIdx(idx);
              setRegionColors({});
            }}
          >
            <Text style={[styles.templateChipText, idx === templateIdx && styles.templateChipTextActive]}>
              {t.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.pictureWrap}>
        <Svg width="100%" height="100%" viewBox={activeTemplate.viewBox}>
          {activeTemplate.regions.map((region) => renderShape(
            region,
            `${activeTemplate.id}-${region.id}`,
            {
              fill: regionColors[region.id] || '#FFFFFF',
              stroke: 'transparent',
              strokeWidth: 0,
              onPressIn: () => paintRegion(region.id),
              onPress: () => paintRegion(region.id),
            },
          ))}

          {activeTemplate.lines.map((line, idx) => renderShape(
            line,
            `${activeTemplate.id}-line-${idx}`,
            {
              fill: 'none',
              stroke: '#111111',
              strokeWidth: 3,
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
              pointerEvents: 'none',
            },
          ))}
        </Svg>
      </View>

      <View style={styles.colorRow}>
        {palette.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotActive]}
            onPress={() => setSelectedColor(c)}
          />
        ))}
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetPicture}>
          <Text style={styles.secondaryBtnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onComplete}>
          <Text style={styles.primaryBtnText}>Save & Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════
   PROGRESSIVE MUSCLE RELAXATION
   ═══════════════════════════════════════ */

const MUSCLE_STEPS = [
  { muscle: 'Hands & Fists', tense: 'Clench your fists tightly', hold: 5, relax: 'Release and feel the warmth' },
  { muscle: 'Arms & Biceps', tense: 'Flex your biceps', hold: 5, relax: 'Let your arms go limp' },
  { muscle: 'Shoulders', tense: 'Raise shoulders to your ears', hold: 5, relax: 'Drop them down gently' },
  { muscle: 'Face & Jaw', tense: 'Scrunch your face tightly', hold: 5, relax: 'Soften your expression' },
  { muscle: 'Stomach', tense: 'Tighten your core muscles', hold: 5, relax: 'Let your belly relax' },
  { muscle: 'Legs & Feet', tense: 'Press your feet into the floor', hold: 5, relax: 'Release all tension' },
];

function MuscleRelaxation({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready, tense, hold, relax
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const step = MUSCLE_STEPS[stepIdx];

  const startStep = () => {
    setPhase('tense');
    setTimer(step.hold);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setPhase('relax');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const nextStep = () => {
    if (stepIdx < MUSCLE_STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
      setPhase('ready');
    } else {
      onComplete();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.muscleContainer}>
      <Text style={styles.muscleProgress}>Step {stepIdx + 1} of {MUSCLE_STEPS.length}</Text>
      <Text style={styles.muscleName}>{step.muscle}</Text>

      {phase === 'ready' && (
        <>
          <Text style={styles.muscleInstruction}>Get ready to tense your {step.muscle.toLowerCase()}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={startStep}>
            <Text style={styles.primaryBtnText}>Begin</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === 'tense' && (
        <>
          <Text style={styles.muscleInstruction}>{step.tense}</Text>
          <Text style={styles.muscleTimer}>{timer}s</Text>
          <Text style={styles.musclePhaseLabel}>Tensing…</Text>
        </>
      )}

      {phase === 'relax' && (
        <>
          <Text style={styles.muscleInstruction}>{step.relax}</Text>
          <Text style={styles.musclePhaseLabel}>Relaxing… 😌</Text>
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={nextStep}>
            <Text style={styles.primaryBtnText}>
              {stepIdx < MUSCLE_STEPS.length - 1 ? 'Next Muscle Group' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

/* ═══════════════════════════════════════
   BODY SCAN MEDITATION
   ═══════════════════════════════════════ */

const BODY_SCAN_STEPS = [
  { area: 'Feet', instruction: 'Bring your attention to your feet. Notice any sensations — warmth, tingling, pressure.', duration: 15 },
  { area: 'Legs', instruction: 'Move your awareness up to your legs. Let any tension dissolve.', duration: 15 },
  { area: 'Torso', instruction: 'Focus on your stomach and chest. Notice the gentle rise and fall of your breath.', duration: 15 },
  { area: 'Arms & Hands', instruction: 'Bring attention to your arms and hands. Feel the weight of them resting.', duration: 15 },
  { area: 'Shoulders & Neck', instruction: 'Notice any tightness in your shoulders and neck. Let it release.', duration: 15 },
  { area: 'Head & Face', instruction: 'Bring awareness to your face. Soften your jaw, your eyes, your forehead.', duration: 15 },
];

function BodyScanMeditation({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(-1); // -1 = intro
  const [timer, setTimer] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startMeditation = () => {
    setStepIdx(0);
    runStep(0);
  };

  const runStep = (idx) => {
    if (idx >= BODY_SCAN_STEPS.length) {
      setPlaying(false);
      onComplete();
      return;
    }
    setStepIdx(idx);
    setPlaying(true);
    setTimer(BODY_SCAN_STEPS[idx].duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const nextIdx = idx + 1;
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          runStep(nextIdx);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
  };

  const resume = () => {
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          runStep(stepIdx + 1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const restart = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStepIdx(-1);
    setPlaying(false);
    setTimer(0);
  };

  if (stepIdx === -1) {
    return (
      <View style={styles.meditationContainer}>
        <Text style={styles.meditationTitle}>Body Scan Meditation</Text>
        <Text style={styles.meditationDesc}>
          Find a comfortable position. Close your eyes and follow the guided instructions
          as we scan through each part of your body.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={startMeditation}>
          <Text style={styles.primaryBtnText}>▶ Start Meditation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const step = BODY_SCAN_STEPS[stepIdx] || {};

  return (
    <View style={styles.meditationContainer}>
      <Text style={styles.meditationProgress}>
        {stepIdx + 1} / {BODY_SCAN_STEPS.length}
      </Text>
      <Text style={styles.meditationArea}>{step.area}</Text>
      <Text style={styles.meditationInstruction}>{step.instruction}</Text>
      <Text style={styles.meditationTimer}>{timer}s</Text>
      <View style={styles.btnRow}>
        {playing ? (
          <TouchableOpacity style={styles.secondaryBtn} onPress={pause}>
            <Text style={styles.secondaryBtnText}>⏸ Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.secondaryBtn} onPress={resume}>
            <Text style={styles.secondaryBtnText}>▶ Resume</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryBtn} onPress={restart}>
          <Text style={styles.secondaryBtnText}>↺ Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════
   NATURE SOUND THERAPY
   ═══════════════════════════════════════ */

const SOUND_ASSETS = {
  rain: require('../../../assets/sounds/rain.mp3'),
  forest: require('../../../assets/sounds/forest.mp3'),
  ocean: require('../../../assets/sounds/ocean.mp3'),
};

const SOUNDS = [
  { id: 'rain', label: '🌧️ Rain', color: '#42A5F5' },
  { id: 'forest', label: '🌲 Forest', color: '#66BB6A' },
  { id: 'ocean', label: '🌊 Ocean', color: '#26C6DA' },
];

function NatureSoundTherapy({ onComplete }) {
  const [activeSound, setActiveSound] = useState(null);
  const [timer, setTimer] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    // Configure audio mode for playback
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const playSound = async (soundId) => {
    // Stop previous sound
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) { /* ignore */ }
      soundRef.current = null;
    }

    setActiveSound(soundId);
    setLoading(true);
    setTimer(0);

    try {
      const { sound } = await Audio.Sound.createAsync(
        SOUND_ASSETS[soundId],
        { shouldPlay: true, isLooping: true, volume: 1.0 },
      );
      soundRef.current = sound;
      setPlaying(true);
      setLoading(false);
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.warn('Failed to play sound:', e);
      setLoading(false);
      Alert.alert('Error', 'Failed to load nature sound. Please try again.');
    }
  };

  const stopSound = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) { /* ignore */ }
      soundRef.current = null;
    }
    setPlaying(false);
    setActiveSound(null);
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.soundContainer}>
      <Text style={styles.soundTitle}>Nature Sound Therapy</Text>
      <Text style={styles.soundDesc}>Select a sound to listen to. Let the calming sounds wash away your stress.</Text>

      {SOUNDS.map((sound) => (
        <TouchableOpacity
          key={sound.id}
          style={[
            styles.soundCard,
            activeSound === sound.id && { borderColor: sound.color, borderWidth: 2 },
          ]}
          onPress={() => playSound(sound.id)}
          disabled={loading}
        >
          <Text style={styles.soundLabel}>{sound.label}</Text>
          {activeSound === sound.id && loading && (
            <Text style={[styles.soundPlaying, { color: sound.color }]}>Loading…</Text>
          )}
          {activeSound === sound.id && playing && !loading && (
            <Text style={[styles.soundPlaying, { color: sound.color }]}>♪ Playing</Text>
          )}
        </TouchableOpacity>
      ))}

      {playing && (
        <View style={styles.soundPlayerRow}>
          <Text style={styles.soundTimer}>{formatTimer(timer)}</Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={stopSound}>
            <Text style={styles.secondaryBtnText}>⏹ Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={async () => { await stopSound(); onComplete(); }}>
        <Text style={styles.primaryBtnText}>Complete</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ═══════════════════════════════════════
   GRATITUDE JOURNAL
   ═══════════════════════════════════════ */

function GratitudeJournal({ onComplete }) {
  const [entries, setEntries] = useState(['', '', '']);

  const updateEntry = (index, text) => {
    const next = [...entries];
    next[index] = text;
    setEntries(next);
  };

  const allFilled = entries.every((e) => e.trim().length > 0);

  return (
    <ScrollView contentContainerStyle={styles.journalContainer}>
      <Text style={styles.journalTitle}>Gratitude Journal</Text>
      <Text style={styles.journalDesc}>Write 3 things you are grateful for today.</Text>

      {entries.map((entry, i) => (
        <View key={i} style={styles.journalInputWrap}>
          <Text style={styles.journalLabel}>{i + 1}. I am grateful for…</Text>
          <TextInput
            style={styles.journalInput}
            placeholder="Type here…"
            placeholderTextColor="#aaa"
            value={entry}
            onChangeText={(text) => updateEntry(i, text)}
            multiline
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.primaryBtn, !allFilled && { opacity: 0.5 }]}
        onPress={allFilled ? onComplete : undefined}
        disabled={!allFilled}
      >
        <Text style={styles.primaryBtnText}>Save & Complete</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ═══════════════════════════════════════
   MUSIC THERAPY
   ═══════════════════════════════════════ */

function MusicTherapy({ onComplete }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [songs, setSongs] = useState([]);
  const [mood, setMood] = useState('');
  const [teenageYearRange, setTeenageYearRange] = useState('');
  const [phase, setPhase] = useState('camera'); // camera | preview | songs

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const raw = await cameraRef.current.takePictureAsync({ quality: 0.8 });
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

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 640 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
        );
        setPhoto(manipulated);
        setPhase('preview');
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
    }
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const res = await fetch(photo.uri);
        const blob = await res.blob();
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        formData.append('image', file);
      } else {
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
      setSongs(data.recommended_songs || []);
      setMood(data.mood || '');
      setTeenageYearRange(data.teenage_year_range || '');
      setPhase('songs');
    } catch (error) {
      console.warn('Analyze error:', error);
      Alert.alert('Error', error.message || 'Could not reach the prediction server.');
    } finally {
      setAnalyzing(false);
    }
  };

  const openYouTubeSearch = async (songName) => {
    const query = encodeURIComponent(songName);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch (e) {
      console.warn('Failed to open YouTube:', e);
    }
  };

  // Camera phase
  if (phase === 'camera') {
    if (!permission) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4C9F70" />
          <Text style={styles.infoText}>Loading camera permissions…</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.infoText}>Camera permission is needed for music suggestions</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={mtStyles.cameraContainer}>
        <CameraView ref={cameraRef} style={mtStyles.camera} facing="front" />
        <View style={mtStyles.controls}>
          <TouchableOpacity style={mtStyles.shutter} onPress={takePhoto}>
            <View style={mtStyles.shutterInner} />
          </TouchableOpacity>
          <TouchableOpacity style={mtStyles.galleryBtn} onPress={pickFromGallery}>
            <Text style={mtStyles.galleryBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Preview phase
  if (phase === 'preview') {
    return (
      <View style={mtStyles.cameraContainer}>
        <View style={mtStyles.previewWrap}>
          <Image source={{ uri: photo?.uri }} style={[mtStyles.previewImage, { transform: [{ scaleX: -1 }] }]} />
        </View>
        <View style={mtStyles.controls}>
          {analyzing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity style={mtStyles.analyzeBtn} onPress={analyzePhoto}>
                <Text style={mtStyles.analyzeBtnText}>Get Songs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mtStyles.retakeBtn} onPress={() => { setPhoto(null); setPhase('camera'); }}>
                <Text style={mtStyles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Songs phase
  return (
    <View style={mtStyles.songsContainer}>
      <Text style={mtStyles.songsTitle}>Your Song Recommendations</Text>
      {mood ? <Text style={mtStyles.moodText}>Detected mood: {mood}</Text> : null}
      {teenageYearRange ? <Text style={mtStyles.rangeText}>Teenage year range: {teenageYearRange}</Text> : null}

      {songs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>No song recommendations available.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={mtStyles.songList}>
          {songs.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={mtStyles.songCard}
              onPress={() => openYouTubeSearch(s.song_name)}
              activeOpacity={0.8}
            >
              <View style={mtStyles.playIcon}>
                <Text style={mtStyles.playIconText}>▶</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={mtStyles.songName}>{s.song_name}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                  {s.mood ? <Text style={mtStyles.songTag}>{s.mood}</Text> : null}
                  {s.year ? <Text style={mtStyles.songTag}>{s.year}</Text> : null}
                </View>
                <Text style={mtStyles.youtubeLink}>Search on YouTube</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16, marginBottom: 16 }]} onPress={onComplete}>
        <Text style={styles.primaryBtnText}>Complete Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

const mtStyles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: {
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
  galleryBtn: {
    marginTop: 16,
    backgroundColor: '#4C9F70',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  galleryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  songsContainer: { flex: 1, backgroundColor: '#EAF4F4', padding: 16 },
  songsTitle: { fontSize: 22, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 8 },
  moodText: { fontSize: 16, color: '#4C9F70', fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  rangeText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 16 },
  songList: { gap: 12, paddingBottom: 16 },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  playIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  playIconText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  songName: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' },
  songTag: {
    fontSize: 12,
    color: '#4C9F70',
    backgroundColor: '#E0F2E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
    overflow: 'hidden',
  },
  youtubeLink: { fontSize: 13, color: '#007AFF' },
});

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerIcon: { fontSize: 28, marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  content: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  infoText: { fontSize: 16, color: '#555', marginBottom: 16 },

  /* Buttons */
  primaryBtn: {
    backgroundColor: '#4C9F70',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 140,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4C9F70',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#4C9F70', fontWeight: '600', fontSize: 14 },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  /* Drawing */
  drawingContainer: { flex: 1 },
  canvas: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: { borderColor: '#333', borderWidth: 3 },
  promptBanner: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
  },
  promptText: { fontSize: 16, fontWeight: '600', color: '#4C9F70', textAlign: 'center' },

  /* Breathing */
  breathingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  breathingName: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  breathingInfo: { fontSize: 13, color: '#888', marginBottom: 24, textAlign: 'center' },
  breathingCircleWrap: { alignItems: 'center', justifyContent: 'center', height: 220, marginVertical: 20 },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingPhaseText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  breathingTimer: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  breathingCycle: { fontSize: 14, color: '#666', marginBottom: 16 },

  /* Colouring */
  colouringContainer: { flex: 1, alignItems: 'center', paddingTop: 16 },
  colouringTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10, textAlign: 'center', paddingHorizontal: 16 },
  templateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  templateChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bdd6d6',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  templateChipActive: {
    backgroundColor: '#4C9F70',
    borderColor: '#4C9F70',
  },
  templateChipText: { color: '#2f4f4f', fontSize: 13, fontWeight: '600' },
  templateChipTextActive: { color: '#fff' },
  pictureWrap: {
    width: SCREEN_WIDTH - 32,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d3e4e4',
    marginBottom: 8,
  },

  /* Muscle Relaxation */
  muscleContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muscleProgress: { fontSize: 14, color: '#888', marginBottom: 8 },
  muscleName: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 16 },
  muscleInstruction: { fontSize: 16, color: '#555', textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  muscleTimer: { fontSize: 48, fontWeight: '800', color: '#4C9F70', marginBottom: 8 },
  musclePhaseLabel: { fontSize: 18, fontWeight: '600', color: '#4C9F70' },

  /* Meditation */
  meditationContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  meditationTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  meditationDesc: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  meditationProgress: { fontSize: 14, color: '#888', marginBottom: 8 },
  meditationArea: { fontSize: 24, fontWeight: '700', color: '#4C9F70', marginBottom: 12 },
  meditationInstruction: { fontSize: 16, color: '#555', textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  meditationTimer: { fontSize: 36, fontWeight: '800', color: '#4C9F70', marginBottom: 16 },

  /* Nature Sounds */
  soundContainer: { flex: 1, padding: 24, alignItems: 'center' },
  soundTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  soundDesc: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
  soundCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  soundLabel: { fontSize: 18, fontWeight: '600', color: '#333' },
  soundPlaying: { fontSize: 14, fontWeight: '600' },
  soundPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  soundTimer: { fontSize: 20, fontWeight: '700', color: '#4C9F70' },

  /* Journal */
  journalContainer: { flexGrow: 1, padding: 24 },
  journalTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  journalDesc: { fontSize: 15, color: '#555', marginBottom: 20 },
  journalInputWrap: { marginBottom: 16 },
  journalLabel: { fontSize: 14, fontWeight: '600', color: '#4C9F70', marginBottom: 6 },
  journalInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
