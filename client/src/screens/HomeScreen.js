import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  const buttons = [
    { label: '👶 Child',    color: '#3498DB', screen: 'ChildScreen'   },
    { label: '🧑 Adult',    color: '#E74C3C', screen: 'AdultScreen'   },
    { label: '🤰 Pregnant', color: '#9B59B6', screen: 'PregnantScreen'},
    { label: '👴 Elder',    color: '#2ECC71', screen: 'ElderScreen'   },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anxiety Detection System</Text>
      <Text style={styles.subtitle}>Select a category to begin</Text>

      <View style={styles.grid}>
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={[styles.button, { backgroundColor: btn.color }]}
            onPress={() => navigation.navigate(btn.screen)}
          >
            <Text style={styles.buttonText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex           : 1,
    backgroundColor: '#1a1a2e',
    alignItems     : 'center',
    justifyContent : 'center',
    padding        : 20,
  },
  title: {
    fontSize  : 26,
    fontWeight: 'bold',
    color     : '#fff',
    marginBottom: 8,
    textAlign : 'center',
  },
  subtitle: {
    fontSize    : 14,
    color       : '#aaa',
    marginBottom: 40,
  },
  grid: {
    width         : '100%',
    flexDirection : 'row',
    flexWrap      : 'wrap',
    justifyContent: 'space-between',
    gap           : 16,
  },
  button: {
    width        : '47%',
    height       : 120,
    borderRadius : 16,
    alignItems   : 'center',
    justifyContent: 'center',
    elevation    : 5,
    shadowColor  : '#000',
    shadowOffset : { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius : 6,
  },
  buttonText: {
    color     : '#fff',
    fontSize  : 18,
    fontWeight: 'bold',
    textAlign : 'center',
  },
});