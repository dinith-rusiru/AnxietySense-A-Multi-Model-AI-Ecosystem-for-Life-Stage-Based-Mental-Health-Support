import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';

const LEVEL_CONFIG = {
  HIGH    : { color:'#E74C3C', emoji:'🔴', label:'HIGH ANXIETY'     },
  MODERATE: { color:'#F39C12', emoji:'🟡', label:'MODERATE ANXIETY' },
  CALM    : { color:'#2ECC71', emoji:'🟢', label:'CALM'             },
};

const EMOTION_COLORS = {
  Natural:'#2ECC71', anger:'#E74C3C', fear:'#9B59B6', joy:'#F39C12', sadness:'#3498DB',
};

const RECOMMENDATIONS = {
  HIGH    : '⚠️ Child shows signs of high anxiety. Please consult a specialist and provide a calm, safe environment.',
  MODERATE: '⚡ Child shows moderate anxiety. Monitor closely and provide reassurance.',
  CALM    : '✅ Child appears calm and comfortable. Keep up the positive environment!',
};

export default function ResultScreen({ navigation, route }) {
  const { cameraResult, imageUri } = route.params;
  const lvl = LEVEL_CONFIG[cameraResult.anxiety_level] || LEVEL_CONFIG.CALM;

  return (
    <ScrollView style={{ backgroundColor:'#1a1a2e' }} contentContainerStyle={styles.container}>

      <Text style={styles.title}>📊 Face Scan Result</Text>
      <Text style={styles.step}>Step 2 of 3</Text>

      {/* Face image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {/* Anxiety badge */}
      <View style={[styles.badge, { backgroundColor: lvl.color }]}>
        <Text style={styles.badgeEmoji}>{lvl.emoji}</Text>
        <Text style={styles.badgeLabel}>{lvl.label}</Text>
        <Text style={styles.badgeScore}>Anxiety Score: {cameraResult.anxiety_score} / 100</Text>
      </View>

      {/* Detected emotion */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DETECTED EMOTION</Text>
        <Text style={[styles.emotion, { color: EMOTION_COLORS[cameraResult.emotion] || '#fff' }]}>
          {cameraResult.emotion.toUpperCase()}
        </Text>
        <Text style={styles.confidence}>Confidence: {cameraResult.confidence}%</Text>
      </View>

      {/* Emotion bars */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>EMOTION BREAKDOWN</Text>
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

      {/* Recommendation */}
      <View style={[styles.card, { borderLeftWidth:4, borderLeftColor: lvl.color }]}>
        <Text style={styles.cardTitle}>INITIAL RECOMMENDATION</Text>
        <Text style={styles.recText}>{RECOMMENDATIONS[cameraResult.anxiety_level]}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btnGray} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>🔄 Rescan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnGreen}
          onPress={() => navigation.navigate('DrawingScreen', {
            cameraResult,
            cameraImageUri: imageUri,
          })}
        >
          <Text style={styles.btnText}>🎨 Next: Draw →</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container  : { alignItems:'center', padding:16, paddingBottom:40 },
  title      : { fontSize:22, fontWeight:'bold', color:'#fff', marginBottom:4 },
  step       : { fontSize:12, color:'#3498DB', fontWeight:'bold', marginBottom:16 },
  image      : { width:140, height:140, borderRadius:70, marginBottom:16, borderWidth:3, borderColor:'#3498DB' },
  badge      : { width:'100%', borderRadius:16, padding:20, alignItems:'center', marginBottom:14 },
  badgeEmoji : { fontSize:44, marginBottom:6 },
  badgeLabel : { fontSize:22, fontWeight:'bold', color:'#fff' },
  badgeScore : { fontSize:15, color:'rgba(255,255,255,0.88)', marginTop:4 },
  card       : { width:'100%', backgroundColor:'#16213e', borderRadius:14, padding:16, marginBottom:14 },
  cardTitle  : { fontSize:11, color:'#aaa', marginBottom:10, letterSpacing:1.2 },
  emotion    : { fontSize:34, fontWeight:'bold', textAlign:'center' },
  confidence : { color:'#aaa', textAlign:'center', marginTop:4, fontSize:13 },
  barRow     : { flexDirection:'row', alignItems:'center', marginBottom:8 },
  barLabel   : { width:68, color:'#ddd', fontSize:12 },
  barBg      : { flex:1, height:10, backgroundColor:'#0f3460', borderRadius:5, overflow:'hidden', marginHorizontal:8 },
  barFill    : { height:'100%', borderRadius:5 },
  barPct     : { width:38, color:'#aaa', fontSize:11, textAlign:'right' },
  recText    : { color:'#ddd', fontSize:14, lineHeight:22 },
  btnRow     : { flexDirection:'row', gap:12, marginTop:4 },
  btnGreen   : { backgroundColor:'#2ECC71', paddingVertical:13, paddingHorizontal:24, borderRadius:12 },
  btnGray    : { backgroundColor:'#444',    paddingVertical:13, paddingHorizontal:20, borderRadius:12 },
  btnText    : { color:'#fff', fontWeight:'bold', fontSize:15 },
});