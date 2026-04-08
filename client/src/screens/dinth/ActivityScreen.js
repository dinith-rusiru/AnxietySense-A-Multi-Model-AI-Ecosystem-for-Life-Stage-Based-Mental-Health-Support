import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { saveActivity } from '../../storage/storage';

// ── Activity definitions ──────────────────────────────────────
const ACTIVITIES = [
  { id: 'breathing', icon: '🫁', title: 'Breathing Exercise',   sub: 'Calm your mind',          color: '#3498DB', bestFor: ['HIGH','MODERATE'] },
  { id: 'ballcolor',  icon: '🎯', title: 'Ball Color Game',      sub: 'Focus & relax',            color: '#E74C3C', bestFor: ['HIGH','MODERATE','CALM'] },
  { id: 'coloring',   icon: '🎨', title: 'Free Coloring',        sub: 'Express yourself',         color: '#9B59B6', bestFor: ['HIGH','MODERATE','CALM'] },
  { id: 'bubble',     icon: '🫧', title: 'Pop the Bubbles',      sub: 'Fun stress relief',        color: '#2ECC71', bestFor: ['HIGH','MODERATE','CALM'] },
  { id: 'memory',     icon: '🧩', title: 'Memory Match',         sub: 'Train your brain',         color: '#F39C12', bestFor: ['MODERATE','CALM'] },
];

// ════════════════════════════════════════════════════════════════
// Breathing game
// ════════════════════════════════════════════════════════════════
function BreathingGame({ onComplete }) {
  const scale     = useRef(new Animated.Value(1)).current;
  const [phase,   setPhase]   = useState('inhale'); // inhale | hold | exhale
  const [count,   setCount]   = useState(4);
  const [rounds,  setRounds]  = useState(0);
  const [done,    setDone]    = useState(false);

  const PHASES = { inhale: { next: 'hold', dur: 4, label: 'Breathe IN 🌬️', col: '#3498DB' },
                   hold:   { next: 'exhale',dur: 4, label: 'Hold 🤫',       col: '#9B59B6' },
                   exhale: { next: 'inhale',dur: 6, label: 'Breathe OUT 😮‍💨',col: '#2ECC71' } };

  useEffect(() => {
    if (done) return;
    const cfg = PHASES[phase];
    setCount(cfg.dur);
    Animated.timing(scale, { toValue: phase === 'inhale' ? 1.7 : phase === 'hold' ? 1.7 : 1, duration: cfg.dur * 1000, useNativeDriver: true }).start();
    const timer = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(timer);
          setPhase(p => {
            const next = PHASES[p].next;
            if (next === 'inhale') {
              setRounds(r => {
                if (r + 1 >= 3) { setDone(true); onComplete(85); }
                return r + 1;
              });
            }
            return next;
          });
          return PHASES[cfg.next].dur;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  if (done) return (
    <View style={ag.center}>
      <Text style={{ fontSize: 60 }}>🌟</Text>
      <Text style={ag.doneTitle}>Amazing job!</Text>
      <Text style={ag.doneSub}>You completed 3 breathing cycles</Text>
    </View>
  );

  const cfg = PHASES[phase];
  return (
    <View style={ag.center}>
      <Text style={[ag.phaseLabel, { color: cfg.col }]}>{cfg.label}</Text>
      <Animated.View style={[ag.circle, { backgroundColor: cfg.col + '33', borderColor: cfg.col, transform: [{ scale }] }]}>
        <Text style={[ag.countNum, { color: cfg.col }]}>{count}</Text>
      </Animated.View>
      <Text style={ag.roundTxt}>Round {rounds + 1} of 3</Text>
      <View style={ag.dotsRow}>
        {[0,1,2].map(i => <View key={i} style={[ag.dot, i < rounds && { backgroundColor: '#2ECC71' }]} />)}
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// Ball color game — tap the correct color
// ════════════════════════════════════════════════════════════════
const BALL_COLORS = [
  { name: 'Red',    hex: '#E74C3C' }, { name: 'Blue',   hex: '#3498DB' },
  { name: 'Green',  hex: '#2ECC71' }, { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Purple', hex: '#9B59B6' }, { name: 'Orange', hex: '#E67E22' },
];

function BallColorGame({ onComplete }) {
  const [target,   setTarget]   = useState(null);
  const [score,    setScore]    = useState(0);
  const [feedback, setFeedback] = useState('');
  const [round,    setRound]    = useState(1);
  const [done,     setDone]     = useState(false);
  const totalRounds = 8;

  useEffect(() => { pickTarget(); }, []);

  const pickTarget = () => {
    const t = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
    setTarget(t); setFeedback('');
  };

  const handleTap = (color) => {
    const correct = color.name === target.name;
    setFeedback(correct ? '✅ Correct!' : '❌ Try again!');
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => {
        if (round >= totalRounds) { setDone(true); onComplete(Math.round((newScore / totalRounds) * 100)); }
        else { setRound(r => r + 1); pickTarget(); }
      }, 700);
    } else {
      setTimeout(() => setFeedback(''), 600);
    }
  };

  // Shuffle displayed balls
  const shuffled = [...BALL_COLORS].sort(() => Math.random() - 0.5);

  if (done) return (
    <View style={ag.center}>
      <Text style={{ fontSize: 60 }}>{score >= 6 ? '🏆' : '⭐'}</Text>
      <Text style={ag.doneTitle}>Score: {score}/{totalRounds}</Text>
      <Text style={ag.doneSub}>{score >= 6 ? 'Excellent focus!' : 'Great effort! Keep practising.'}</Text>
    </View>
  );

  return (
    <View style={ag.center}>
      <Text style={ag.roundTxt}>Round {round}/{totalRounds}  ·  Score: {score}</Text>
      <Text style={ag.promptTxt}>Tap the</Text>
      <Text style={[ag.targetName, { color: target?.hex }]}>{target?.name} Ball</Text>
      {feedback ? <Text style={ag.feedbackTxt}>{feedback}</Text> : <Text style={ag.feedbackTxt}> </Text>}
      <View style={ag.ballGrid}>
        {shuffled.map(c => (
          <TouchableOpacity key={c.name} onPress={() => handleTap(c)} style={[ag.ball, { backgroundColor: c.hex }]}>
            <View style={ag.ballInner} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// Free coloring mini canvas
// ════════════════════════════════════════════════════════════════
const MINI_COLORS = ['#E74C3C','#F39C12','#F1C40F','#2ECC71','#3498DB','#9B59B6','#E91E63','#00BCD4','#795548','#212121'];

function ColoringGame({ onComplete }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);
  const [color, setColor] = useState('#E74C3C');
  const [strokes, setStrokes] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,400,300);
    // Draw simple flower/sun template
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(200,140,70,0,Math.PI*2); ctx.stroke();
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      ctx.beginPath(); ctx.moveTo(200+75*Math.cos(a),140+75*Math.sin(a));
      ctx.lineTo(200+105*Math.cos(a),140+105*Math.sin(a)); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(200,140,30,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,0.06)'; ctx.font='11px Arial'; ctx.textAlign='center';
    ctx.fillText('Color me!', 200, 260);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width/rect.width, sy = canvas.height/rect.height;
    const cx = e.touches?e.touches[0].clientX:e.clientX;
    const cy = e.touches?e.touches[0].clientY:e.clientY;
    return {x:(cx-rect.left)*sx, y:(cy-rect.top)*sy};
  };

  const startDraw = (e) => { e.preventDefault(); drawing.current=true; lastPos.current=getPos(e,canvasRef.current); };
  const draw = (e) => {
    e.preventDefault();
    if(!drawing.current) return;
    const canvas=canvasRef.current, ctx=canvas.getContext('2d');
    const pos=getPos(e,canvas);
    ctx.strokeStyle=color; ctx.lineWidth=18; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(lastPos.current.x,lastPos.current.y); ctx.lineTo(pos.x,pos.y); ctx.stroke();
    lastPos.current=pos;
    setStrokes(s=>s+1);
  };
  const stopDraw = () => { drawing.current=false; };

  return (
    <View style={ag.center}>
      <Text style={ag.promptTxt}>Color freely — no rules! 🎨</Text>
      <View style={{borderRadius:12,overflow:'hidden',borderWidth:2,borderColor:'#3498DB',marginVertical:10}}>
        <canvas ref={canvasRef} width={400} height={300}
          style={{display:'block',touchAction:'none',cursor:'crosshair',maxWidth:'100%'}}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}/>
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:8,marginBottom:10}}>
        {MINI_COLORS.map(c=>(
          <TouchableOpacity key={c} onPress={()=>setColor(c)}
            style={{width:32,height:32,borderRadius:16,backgroundColor:c,borderWidth:color===c?3:1,borderColor:color===c?'#fff':'rgba(255,255,255,0.2)'}}/>
        ))}
      </View>
      {strokes > 20 && (
        <TouchableOpacity style={[ag.doneBtn,{backgroundColor:'#9B59B6'}]} onPress={()=>onComplete(90)}>
          <Text style={ag.doneBtnTxt}>✅ I'm done!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// Pop bubbles game
// ════════════════════════════════════════════════════════════════
function BubbleGame({ onComplete }) {

  const total = 15;
  const gameDuration = 30;
  const pointsPerPop = 10;

  const [bubbles, setBubbles] = useState(() => generateBubbles());
  const [popped, setPopped] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const poppedRef = useRef(0);
  const scoreRef = useRef(0);
  const completedRef = useRef(false);

  function generateBubbles() {
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      x: 6 + Math.random() * 82,
      y: 6 + Math.random() * 80,
      size: 34 + Math.random() * 34,
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)].hex,
      alive: true,
      floatY: new Animated.Value(0),
      popScale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));
  }

  const finishGame = (result) => {
    if (completedRef.current) return;
    completedRef.current = true;
    const safe = Math.max(0, Math.min(100, Math.round(result)));
    setFinalScore(safe);
    setDone(true);
    onComplete(safe);
  };

  useEffect(() => {
    const loops = bubbles.map((bubble) => (
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble.floatY, {
            toValue: -8,
            duration: 1200 + Math.random() * 600,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.floatY, {
            toValue: 8,
            duration: 1200 + Math.random() * 600,
            useNativeDriver: true,
          }),
        ])
      )
    ));

    loops.forEach((a) => a.start());
    return () => loops.forEach((a) => a.stop());
  }, [bubbles]);

  useEffect(() => {
    poppedRef.current = popped;
  }, [popped]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          const timeoutResult = Math.max(20, Math.round((scoreRef.current / (total * pointsPerPop)) * 100));
          finishGame(timeoutResult);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [done]);

  const popBubble = (id) => {
    if (done) return;

    const target = bubbles.find((b) => b.id === id);
    if (!target || !target.alive) return;

    Animated.parallel([
      Animated.timing(target.popScale, {
        toValue: 1.8,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(target.opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, alive: false } : b)));
    });

    const newPopped = poppedRef.current + 1;
    const newScore = scoreRef.current + pointsPerPop;
    poppedRef.current = newPopped;
    scoreRef.current = newScore;
    setPopped(newPopped);
    setScore(newScore);

    if (newPopped >= total) {
      const completionResult = Math.min(100, 60 + timeLeft * 2);
      finishGame(completionResult);
    }
  };

  if (done) return (
    <View style={ag.center}>
      <Text style={{ fontSize: 60 }}>{popped >= total ? '🎉' : '⏰'}</Text>
      <Text style={ag.doneTitle}>Final Score: {finalScore}%</Text>
      <Text style={ag.doneSub}>
        {popped >= total
          ? `Awesome! You popped all ${total} bubbles.`
          : `Time's up! You popped ${popped}/${total} bubbles.`}
      </Text>
    </View>
  );

  const timerPct = Math.max(0, (timeLeft / gameDuration) * 100);

  return (
    <View style={ag.center}>
      <Text style={ag.promptTxt}>Pop bubbles before time runs out!</Text>
      <Text style={[ag.roundTxt, { marginTop: 0 }]}>Popped: {popped}/{total}  •  Score: {score}</Text>

      <View style={{ width: '100%', marginTop: 8, marginBottom: 10 }}>
        <View style={{ height: 10, borderRadius: 6, backgroundColor: '#21344f', overflow: 'hidden' }}>
          <View style={{ width: `${timerPct}%`, height: '100%', backgroundColor: timeLeft <= 8 ? '#E74C3C' : '#2ECC71' }} />
        </View>
        <Text style={[ag.promptTxt, { marginTop: 6, marginBottom: 0 }]}>Time Left: {timeLeft}s</Text>
      </View>

      <View style={{ width: '100%', height: 340, backgroundColor: '#0a1929', borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
        {bubbles.filter((b) => b.alive).map((b) => (
          <Animated.View
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              transform: [{ translateY: b.floatY }, { scale: b.popScale }],
              opacity: b.opacity,
            }}
          >
            <TouchableOpacity
              onPress={() => popBubble(b.id)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: b.size / 2,
                backgroundColor: `${b.color}55`,
                borderWidth: 2,
                borderColor: b.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: b.size * 0.4 }}>🫧</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// Memory match game
// ════════════════════════════════════════════════════════════════
const CARD_EMOJIS = ['🌟','🎈','🌈','🦋','🌸','🐬','🍕','🎸'];

function MemoryGame({ onComplete }) {
  const [cards, setCards]     = useState(() => {
    const c = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
    return c;
  });
  const [selected, setSelected] = useState([]);
  const [moves, setMoves]       = useState(0);
  const [done, setDone]         = useState(false);

  const flip = (id) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newSel = [...selected, id];
    setCards(c => c.map(x => x.id === id ? { ...x, flipped: true } : x));
    setSelected(newSel);

    if (newSel.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSel.map(sid => cards.find(c => c.id === sid));
      if (a.emoji === b.emoji) {
        setCards(c => c.map(x => newSel.includes(x.id) ? { ...x, matched: true } : x));
        setSelected([]);
        const allMatched = cards.filter(x => !x.matched).length === 2;
        if (allMatched) { setDone(true); onComplete(Math.max(40, 100 - moves * 3)); }
      } else {
        setTimeout(() => {
          setCards(c => c.map(x => newSel.includes(x.id) ? { ...x, flipped: false } : x));
          setSelected([]);
        }, 800);
      }
    }
  };

  if (done) return (
    <View style={ag.center}>
      <Text style={{ fontSize: 56 }}>🏆</Text>
      <Text style={ag.doneTitle}>You matched them all!</Text>
      <Text style={ag.doneSub}>In {moves} moves</Text>
    </View>
  );

  return (
    <View style={ag.center}>
      <Text style={ag.promptTxt}>Match the pairs! Moves: {moves}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 8, justifyContent: 'center', marginTop: 8 }}>
        {cards.map(card => (
          <TouchableOpacity key={card.id} onPress={() => flip(card.id)}
            style={[ag.memCard, card.matched && ag.memMatched, card.flipped && !card.matched && ag.memFlipped]}>
            <Text style={{ fontSize: 26 }}>{card.flipped || card.matched ? card.emoji : '❓'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════════
// Main ActivityScreen
// ════════════════════════════════════════════════════════════════
export default function ActivityScreen({ navigation, route }) {
  const { level = 'MODERATE', combinedScore = 50 } = route.params || {};
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores]         = useState({});

  const LEVEL_COLOR = { HIGH: '#E74C3C', MODERATE: '#F39C12', CALM: '#2ECC71' };
  const color = LEVEL_COLOR[level] || '#3498DB';

  const recommended = ACTIVITIES.filter(a => a.bestFor.includes(level));
  const others      = ACTIVITIES.filter(a => !a.bestFor.includes(level));

  const handleComplete = async (actId, score) => {
    setScores(s => ({ ...s, [actId]: score }));
    await saveActivity({ activityId: actId, score, anxietyLevel: level });
    setActiveGame(null);
  };

  const renderGame = () => {
    if (!activeGame) return null;
    const props = { onComplete: (score) => handleComplete(activeGame, score) };
    switch (activeGame) {
      case 'breathing': return <BreathingGame {...props} />;
      case 'ballcolor' : return <BallColorGame {...props} />;
      case 'coloring'  : return <ColoringGame  {...props} />;
      case 'bubble'    : return <BubbleGame    {...props} />;
      case 'memory'    : return <MemoryGame    {...props} />;
      default: return null;
    }
  };

  const ActivityCard = ({ act }) => (
    <TouchableOpacity style={[styles.actCard, { borderLeftColor: act.color }]} onPress={() => setActiveGame(act.id)}>
      <View style={[styles.actIconBox, { backgroundColor: act.color + '22' }]}>
        <Text style={styles.actIcon}>{act.icon}</Text>
      </View>
      <View style={styles.actInfo}>
        <Text style={styles.actTitle}>{act.title}</Text>
        <Text style={styles.actSub}>{act.sub}</Text>
      </View>
      {scores[act.id] != null && (
        <View style={[styles.actScore, { backgroundColor: act.color }]}>
          <Text style={styles.actScoreTxt}>{scores[act.id]}%</Text>
        </View>
      )}
      <Text style={styles.actArrow}>▶</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      {/* Game modal */}
      <Modal visible={!!activeGame} animationType='slide' presentationStyle='pageSheet'>
        <View style={styles.gameModal}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>
              {ACTIVITIES.find(a => a.id === activeGame)?.icon} {ACTIVITIES.find(a => a.id === activeGame)?.title}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveGame(null)}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            {renderGame()}
          </ScrollView>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎮 Activities</Text>

        <View style={[styles.levelBadge, { backgroundColor: color + '22', borderColor: color }]}>
          <Text style={[styles.levelTxt, { color }]}>
            {level === 'HIGH' ? '🔴 High anxiety detected — these activities will help calm your mind'
             : level === 'MODERATE' ? '🟡 Moderate anxiety — fun activities to lift your mood!'
             : '🟢 You\'re calm — enjoy these fun activities!'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>⭐ Recommended for you</Text>
        {recommended.map(a => <ActivityCard key={a.id} act={a} />)}

        {others.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>🎲 More activities</Text>
            {others.map(a => <ActivityCard key={a.id} act={a} />)}
          </>
        )}

        <TouchableOpacity style={styles.weeklyBtn} onPress={() => navigation.navigate('WeeklyScreen')}>
          <Text style={styles.weeklyTxt}>📊 View Weekly Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const ag = StyleSheet.create({
  center    : { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  phaseLabel: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  circle    : { width: 160, height: 160, borderRadius: 80, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  countNum  : { fontSize: 52, fontWeight: '900' },
  roundTxt  : { color: '#aaa', fontSize: 14, marginTop: 16 },
  dotsRow   : { flexDirection: 'row', gap: 10, marginTop: 12 },
  dot       : { width: 14, height: 14, borderRadius: 7, backgroundColor: '#444', borderWidth: 2, borderColor: '#888' },
  promptTxt : { color: '#aaa', fontSize: 15, marginBottom: 8 },
  targetName: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
  feedbackTxt:{ fontSize: 22, fontWeight: 'bold', marginBottom: 10, minHeight: 30 },
  ballGrid  : { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 8 },
  ball      : { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  ballInner : { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.35)', position: 'absolute', top: 12, left: 14 },
  doneTitle : { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 10 },
  doneSub   : { color: '#aaa', fontSize: 15, marginTop: 6 },
  doneBtn   : { marginTop: 16, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  doneBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  memCard   : { width: 58, height: 58, backgroundColor: '#16213e', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2a2a4e' },
  memFlipped: { backgroundColor: '#0f3460', borderColor: '#3498DB' },
  memMatched: { backgroundColor: '#0d3b1e', borderColor: '#2ECC71' },
});

const styles = StyleSheet.create({
  container  : { padding: 16, paddingBottom: 40 },
  backBtn    : { padding: 6, marginBottom: 4 },
  backText   : { color: '#3498DB', fontSize: 14, fontWeight: 'bold' },
  title      : { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 12 },
  levelBadge : { borderRadius: 12, borderWidth: 1.5, padding: 12, marginBottom: 20 },
  levelTxt   : { fontSize: 13, fontWeight: '600', lineHeight: 20 },
  sectionTitle:{ fontSize: 13, color: '#aaa', fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  actCard    : { backgroundColor: '#16213e', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, gap: 12 },
  actIconBox : { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actIcon    : { fontSize: 26 },
  actInfo    : { flex: 1 },
  actTitle   : { color: '#fff', fontSize: 15, fontWeight: '800' },
  actSub     : { color: '#aaa', fontSize: 12, marginTop: 2 },
  actScore   : { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  actScoreTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  actArrow   : { color: '#555', fontSize: 14 },
  gameModal  : { flex: 1, backgroundColor: '#1a1a2e' },
  gameHeader : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  gameTitle  : { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn   : { backgroundColor: '#2a2a3e', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  closeTxt   : { color: '#aaa', fontSize: 16 },
  weeklyBtn  : { marginTop: 20, backgroundColor: '#16213e', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a4e' },
  weeklyTxt  : { color: '#3498DB', fontSize: 15, fontWeight: 'bold' },
});
