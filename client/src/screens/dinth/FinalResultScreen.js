import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';

const LEVEL_CONFIG = {
  HIGH    : { color:'#E74C3C', emoji:'🔴', label:'HIGH ANXIETY'     },
  MODERATE: { color:'#F39C12', emoji:'🟡', label:'MODERATE ANXIETY' },
  CALM    : { color:'#2ECC71', emoji:'🟢', label:'CALM'             },
};

const EMOTION_COLORS = {
  Natural:'#2ECC71', anger:'#E74C3C', fear:'#9B59B6', joy:'#F39C12', sadness:'#3498DB',
};

export default function FinalResultScreen({ navigation, route }) {
  const { cameraResult, drawingResult, cameraImageUri, drawingImageUri } = route.params;

  const camLvl  = LEVEL_CONFIG[cameraResult.anxiety_level]  || LEVEL_CONFIG.CALM;
  const drawLvl = LEVEL_CONFIG[drawingResult.drawing.level] || LEVEL_CONFIG.CALM;
  const combLvl = LEVEL_CONFIG[drawingResult.combined_level]|| LEVEL_CONFIG.CALM;

  return (
    <ScrollView style={{ backgroundColor:'#1a1a2e' }} contentContainerStyle={styles.container}>

      <Text style={styles.title}>📋 Full Assessment Report</Text>

      {/* ── Combined score ── */}
      <View style={[styles.bigBadge, { backgroundColor: combLvl.color }]}>
        <Text style={styles.bigEmoji}>{combLvl.emoji}</Text>
        <Text style={styles.bigLabel}>COMBINED RESULT</Text>
        <Text style={styles.bigLevel}>{combLvl.label}</Text>
        <Text style={styles.bigScore}>{drawingResult.combined_score} / 100</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width:`${Math.min(drawingResult.combined_score,100)}%` }]} />
        </View>
        <Text style={styles.bigNote}>Camera is primary · Drawing adds behavioral detail</Text>
      </View>

      {/* ── Side by side scores ── */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreCard, { borderTopColor: camLvl.color }]}>
          <Text style={styles.scTitle}>📷 Face Scan</Text>
          <Text style={[styles.scNum, { color: camLvl.color }]}>{cameraResult.anxiety_score}</Text>
          <Text style={styles.scLevel}>{camLvl.emoji} {cameraResult.anxiety_level}</Text>
          <Text style={styles.scEmotion}>{cameraResult.emotion.toUpperCase()}</Text>
          <Text style={styles.scConf}>{cameraResult.confidence}% conf.</Text>
          <Text style={styles.scWeight}>Weight: 70%</Text>
        </View>

        <Text style={styles.plus}>+</Text>

        <View style={[styles.scoreCard, { borderTopColor: drawLvl.color }]}>
          <Text style={styles.scTitle}>🎨 Drawing</Text>
          <Text style={[styles.scNum, { color: drawLvl.color }]}>{drawingResult.drawing.total}</Text>
          <Text style={styles.scLevel}>{drawLvl.emoji} {drawingResult.drawing.level}</Text>
          <Text style={styles.scEmotion}>{drawingResult.drawing.colorCount} colors</Text>
          <Text style={styles.scConf}>{drawingResult.drawing.flags.length} flag(s)</Text>
          <Text style={styles.scWeight}>Weight: 30%</Text>
        </View>
      </View>

      {/* ── Images ── */}
      <View style={styles.imagesRow}>
        {cameraImageUri && (
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>📷 Face Scan</Text>
            <Image source={{ uri: cameraImageUri }} style={styles.image} />
          </View>
        )}
        {drawingImageUri && (
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>🎨 Drawing</Text>
            <Image source={{ uri: drawingImageUri }} style={styles.image} />
          </View>
        )}
      </View>

      {/* ── Face emotion breakdown ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📷 FACE EMOTION BREAKDOWN</Text>
        {Object.entries(cameraResult.all_emotions).map(([em, pct]) => (
          <View key={em} style={styles.barRow}>
            <Text style={styles.barLabel}>{em}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width:`${Math.min(pct,100)}%`, backgroundColor: EMOTION_COLORS[em]||'#888' }]} />
            </View>
            <Text style={styles.barPct}>{pct}%</Text>
          </View>
        ))}
      </View>

      {/* ── Drawing score breakdown ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎨 DRAWING SCORE BREAKDOWN</Text>
        {[
          { label:'Color Darkness',     value:drawingResult.drawing.scores.darkness,     max:25, icon:'🎨' },
          { label:'Boundary Crossings', value:drawingResult.drawing.scores.crossing,     max:25, icon:'✏️' },
          { label:'Zone Avoidance',     value:drawingResult.drawing.scores.avoidance,    max:20, icon:'🚫' },
          { label:'Hesitation',         value:drawingResult.drawing.scores.hesitation,   max:15, icon:'⏸️' },
          { label:'Overpainting',       value:drawingResult.drawing.scores.overpainting, max:15, icon:'🖌️' },
        ].map(item => {
          const pct = item.value / item.max;
          const bc  = pct>0.66?'#E74C3C':pct>0.33?'#F39C12':'#2ECC71';
          return (
            <View key={item.label} style={{ marginBottom:10 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:3 }}>
                <Text style={styles.barLabel}>{item.icon} {item.label}</Text>
                <Text style={{ color:'#fff', fontSize:11 }}>{item.value}/{item.max}</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width:`${pct*100}%`, backgroundColor:bc }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Drawing flags ── */}
      {drawingResult.drawing.flags.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ DRAWING BEHAVIORAL FLAGS</Text>
          {drawingResult.drawing.flags.map((f,i) => (
            <View key={i} style={[styles.flagRow, { borderLeftColor: f.severity==='high'?'#E74C3C':'#F39C12' }]}>
              <Text>{f.severity==='high'?'🔴':'🟡'}</Text>
              <Text style={styles.flagText}>{f.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Recommendations ── */}
      <View style={[styles.card, { borderLeftWidth:4, borderLeftColor: combLvl.color }]}>
        <Text style={styles.cardTitle}>💡 CLINICAL RECOMMENDATIONS</Text>
        {drawingResult.recommendations.map((r,i) => (
          <View key={i} style={styles.recRow}>
            <Text style={[styles.recArrow, { color: combLvl.color }]}>→</Text>
            <Text style={styles.recText}>{r}</Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        ⚠️ Research tool only. Not a standalone clinical diagnosis. All findings must be interpreted by a qualified mental health professional.
      </Text>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btnBlue} onPress={() => navigation.navigate('ChildScreen')}>
          <Text style={styles.btnText}>🔄 New Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGray} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container  : { alignItems:'center', padding:16, paddingBottom:40 },
  title      : { fontSize:22, fontWeight:'bold', color:'#fff', marginBottom:14 },

  bigBadge   : { width:'100%', borderRadius:18, padding:22, alignItems:'center', marginBottom:16 },
  bigEmoji   : { fontSize:48, marginBottom:4 },
  bigLabel   : { fontSize:13, color:'rgba(255,255,255,0.8)', letterSpacing:2, fontWeight:'bold' },
  bigLevel   : { fontSize:22, fontWeight:'bold', color:'#fff', marginTop:4 },
  bigScore   : { fontSize:40, fontWeight:'900', color:'#fff', marginTop:4 },
  progressBg : { width:'100%', height:10, backgroundColor:'rgba(0,0,0,0.2)', borderRadius:5, marginTop:12, overflow:'hidden' },
  progressFill:{ height:'100%', backgroundColor:'rgba(255,255,255,0.55)', borderRadius:5 },
  bigNote    : { color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:8 },

  scoreRow   : { flexDirection:'row', width:'100%', alignItems:'center', marginBottom:14, gap:8 },
  scoreCard  : { flex:1, backgroundColor:'#16213e', borderRadius:14, padding:14, borderTopWidth:4, alignItems:'center' },
  scTitle    : { color:'#aaa', fontSize:11, marginBottom:6, letterSpacing:1 },
  scNum      : { fontSize:32, fontWeight:'900' },
  scLevel    : { color:'#fff', fontSize:13, marginTop:2 },
  scEmotion  : { color:'#ddd', fontSize:12, marginTop:4, fontWeight:'bold' },
  scConf     : { color:'#888', fontSize:11 },
  scWeight   : { color:'#555', fontSize:10, marginTop:4, fontStyle:'italic' },
  plus       : { color:'#555', fontSize:24, fontWeight:'bold' },

  imagesRow  : { flexDirection:'row', gap:12, marginBottom:14, width:'100%' },
  imageBox   : { flex:1, alignItems:'center' },
  imageLabel : { color:'#aaa', fontSize:12, marginBottom:6 },
  image      : { width:'100%', height:120, borderRadius:12, borderWidth:2, borderColor:'#3498DB' },

  card       : { width:'100%', backgroundColor:'#16213e', borderRadius:14, padding:16, marginBottom:14 },
  cardTitle  : { fontSize:11, color:'#aaa', marginBottom:12, letterSpacing:1.2 },
  barRow     : { flexDirection:'row', alignItems:'center', marginBottom:8 },
  barLabel   : { width:72, color:'#ddd', fontSize:12 },
  barBg      : { flex:1, height:10, backgroundColor:'#0f3460', borderRadius:5, overflow:'hidden', marginHorizontal:8 },
  barFill    : { height:'100%', borderRadius:5 },
  barPct     : { width:38, color:'#aaa', fontSize:11, textAlign:'right' },
  flagRow    : { flexDirection:'row', gap:8, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:8, padding:10, marginBottom:8, borderLeftWidth:4, alignItems:'center' },
  flagText   : { flex:1, color:'#ddd', fontSize:13 },
  recRow     : { flexDirection:'row', gap:8, marginBottom:8, alignItems:'flex-start' },
  recArrow   : { fontWeight:'900', fontSize:14, marginTop:1 },
  recText    : { flex:1, color:'#ddd', fontSize:13, lineHeight:20 },
  disclaimer : { color:'#555', fontSize:11, textAlign:'center', marginBottom:16, lineHeight:16 },
  btnRow     : { flexDirection:'row', gap:12 },
  btnBlue    : { backgroundColor:'#3498DB', paddingVertical:13, paddingHorizontal:26, borderRadius:12 },
  btnGray    : { backgroundColor:'#444',    paddingVertical:13, paddingHorizontal:26, borderRadius:12 },
  btnText    : { color:'#fff', fontWeight:'bold', fontSize:15 },
});