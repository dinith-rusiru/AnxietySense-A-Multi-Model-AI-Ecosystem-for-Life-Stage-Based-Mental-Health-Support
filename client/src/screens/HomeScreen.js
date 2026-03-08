import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


export default function HomeScreen({ navigation }) {
  const buttons = [
      { label:'👶 Child',    sub:'Child anxiety detection',  color:'#3498DB', screen:'ChildScreen' },
  { label:'🧑 Adult',    sub:'Adult anxiety detection',  color:'#E74C3C', screen:'Home'        }, // placeholder, update if you have AdultScreen
  { label:'🤰 Pregnant', sub:'Pregnancy anxiety',        color:'#9B59B6', screen:'WelcomeScreen'     },
  { label:'👴 Elder',    sub:'Elder anxiety detection',  color:'#2ECC71', screen:'Home'        }, // placeholder, update if you have ElderScreen
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Anxiety Detection</Text>
      <Text style={styles.subtitle}>Select a category to begin</Text>
      <View style={styles.grid}>
        {buttons.map(btn => (
          <TouchableOpacity
            key={btn.label}
            style={[styles.button, { backgroundColor: btn.color }]}
            onPress={() => navigation.navigate(btn.screen)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnLabel}>{btn.label}</Text>
            <Text style={styles.btnSub}>{btn.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container : { flex:1, backgroundColor:'#1a1a2e', alignItems:'center', justifyContent:'center', padding:24 },
  title     : { fontSize:28, fontWeight:'bold', color:'#fff', marginBottom:8, textAlign:'center' },
  subtitle  : { fontSize:14, color:'#aaa', marginBottom:40, textAlign:'center' },
  grid      : { width:'100%', flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', gap:16 },
  button    : { width:'47%', height:130, borderRadius:18, alignItems:'center', justifyContent:'center', padding:12, elevation:6 },
  btnLabel  : { color:'#fff', fontSize:18, fontWeight:'bold', textAlign:'center' },
  btnSub    : { color:'rgba(255,255,255,0.8)', fontSize:11, textAlign:'center', marginTop:6 },
});