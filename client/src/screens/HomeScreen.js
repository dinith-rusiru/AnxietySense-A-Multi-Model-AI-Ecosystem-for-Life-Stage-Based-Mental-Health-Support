import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const BUTTONS = [
  {
    label: '👶 Child',
    sub: 'Child anxiety detection',
    color: '#3498DB',
    screen: 'Home',          // → dinth/HomeScreen
    question: 'Is the person under 14 years old?',
  },
  {
    label: '🧑 Adult',
    sub: 'Adult anxiety detection',
    color: '#E74C3C',
    screen: 'Welcome', // → chathumi/WelcomeScreen
    question: 'Is the person between 18 and 30 years old?',
  },
  {
    label: '🤰 Pregnant',
    sub: 'Pregnancy anxiety',
    color: '#9B59B6',
    screen: 'WelcomeScreen',       // → nadun/WelcomeScreen
    question: 'Is the person currently pregnant?',
  },
  {
    label: '👴 Elder',
    sub: 'Elder anxiety detection',
    color: '#2ECC71',
    screen: 'ElderView',     // → dulari/ElderViewScreen
    question: 'Is the person 60 years or older?',
  },
];

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeBtn, setActiveBtn]       = useState(null);

  const handlePress = (btn) => {
    setActiveBtn(btn);
    setModalVisible(true);
  };

  const handleOK = () => {
    setModalVisible(false);
    navigation.navigate(activeBtn.screen);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setActiveBtn(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Anxiety Detection</Text>
      <Text style={styles.subtitle}>Select a category to begin</Text>

      <View style={styles.grid}>
        {BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={[styles.button, { backgroundColor: btn.color }]}
            onPress={() => handlePress(btn)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnLabel}>{btn.label}</Text>
            <Text style={styles.btnSub}>{btn.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Simple confirmation popup */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupIcon}>{activeBtn?.label?.split(' ')[0]}</Text>
            <Text style={styles.popupQuestion}>{activeBtn?.question}</Text>
            <View style={styles.popupBtnRow}>
              <TouchableOpacity
                style={[styles.popupBtn, { backgroundColor: activeBtn?.color || '#4C9F70' }]}
                onPress={handleOK}
              >
                <Text style={styles.popupBtnText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupBtnCancel}
                onPress={handleCancel}
              >
                <Text style={styles.popupBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:     { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle:  { fontSize: 14, color: '#aaa', marginBottom: 40, textAlign: 'center' },
  grid:      { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  button:    { width: '47%', height: 130, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 12, elevation: 6 },
  btnLabel:  { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  btnSub:    { color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center', marginTop: 6 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  popup: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28,
    width: '100%', maxWidth: 360, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 10,
  },
  popupIcon:          { fontSize: 48, marginBottom: 14 },
  popupQuestion:      { fontSize: 17, color: '#222', textAlign: 'center', lineHeight: 26, marginBottom: 24, fontWeight: '500' },
  popupBtnRow:        { flexDirection: 'row', gap: 12, width: '100%' },
  popupBtn:           { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  popupBtnText:       { color: '#fff', fontWeight: '700', fontSize: 16 },
  popupBtnCancel:     { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: '#f0f0f0' },
  popupBtnCancelText: { color: '#888', fontWeight: '600', fontSize: 16 },
});