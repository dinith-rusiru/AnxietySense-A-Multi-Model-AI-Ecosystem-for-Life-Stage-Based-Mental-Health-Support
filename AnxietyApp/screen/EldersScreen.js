import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';

const OPTIONS = ['Minimal', 'Moderate', 'Severe'];
const SCORES = { Minimal: 0, Moderate: 1, Severe: 2 };

function QuestionCard({ index, text, value, onSelect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{text}</Text>
      <View style={styles.optionsRow}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, value === opt && styles.optionSelected]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function EldersScreen({ navigation }) {
  const questions = useMemo(() => ([
    // Cognitive / Worry-Based Anxiety (1-10)
    'Do you worry that your health may get worse?',
    'Do you feel nervous when thinking about your future?',
    'Do you worry that you may become a burden to your family?',
    'Do you feel tense or unable to relax even when resting?',
    'Do you worry about being alone or feeling lonely?',
    'Do you feel upset or stressed when your daily routine changes?',
    'Do you feel that something bad might happen unexpectedly?',
    'Do you find it hard to stop worrying once you start?',
    'Do you feel mentally overwhelmed even by small tasks?',
    'Do you worry about forgetting things or losing your memory?',
    // Somatic / Physical Anxiety (11-20)
    'Do you feel your heart beating fast even when you are not active?',
    'Do you feel short of breath when you feel stressed or worried?',
    'Do you have trouble sleeping because of worry or fear?',
    'Do you feel shaky, restless, or unable to stay calm?',
    'Do you feel tightness or discomfort in your chest when anxious?',
    'Do you feel dizzy or lightheaded when you are worried?',
    'Do you get tired easily because of stress or tension?',
    'Do you get stomach discomfort when you feel anxious?',
    'Do you sweat more than usual when stressed or worried?',
    'Do you feel physical tension in your shoulders, neck, or face?',
    // Affective / Emotional Anxiety (21-30)
    'Do you feel frightened or scared without a clear reason?',
    'Do you feel irritated or easily upset?',
    'Do you feel sad when you think too much about your problems?',
    'Do you feel nervous when meeting new people or going outside?',
    'Do you avoid activities because you feel scared or uncomfortable?',
    'Do you feel emotionally overwhelmed?',
    'Do you feel uneasy when you are in crowded or noisy places?',
    'Do you feel lonely or unsupported emotionally?',
    'Do you feel anxious when thinking about past experiences?',
    'Do you feel distressed when you cannot control a situation?',
  ]), []);

  const [answers, setAnswers] = useState(Array(30).fill(null));
  const [page, setPage] = useState(0); // 0,1,2
  const [showModal, setShowModal] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const sliceStart = page * 10;
  const sliceEnd = sliceStart + 10;
  const currentQuestions = questions.slice(sliceStart, sliceEnd);

  const sectionTitle = page === 0
    ? 'Cognitive / Worry-Based Anxiety'
    : page === 1
    ? 'Somatic / Physical Anxiety'
    : 'Affective / Emotional Anxiety';

  const handleSelect = (globalIndex, value) => {
    const next = [...answers];
    next[globalIndex] = value;
    setAnswers(next);
  };

  const allAnsweredCurrentPage = currentQuestions.every((_, i) => answers[sliceStart + i] !== null);
  const isLastPage = page === 2;
  const btnLabel = isLastPage ? 'Submit' : 'Next';

  const onPressNext = () => {
    if (!allAnsweredCurrentPage) return;
    if (isLastPage) {
      
      const total = answers.reduce((acc, val) => acc + (val ? SCORES[val] : 0), 0);
      setTotalScore(total);
      setShowModal(true);
    } else {
      setPage(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elders Questionnaire</Text>
      <Text style={styles.section}>{sectionTitle}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentQuestions.map((q, i) => {
          const globalIndex = sliceStart + i;
          return (
            <QuestionCard
              key={globalIndex}
              index={globalIndex}
              text={q}
              value={answers[globalIndex]}
              onSelect={(val) => handleSelect(globalIndex, val)}
            />
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !allAnsweredCurrentPage && styles.buttonDisabled]}
          onPress={onPressNext}
          disabled={!allAnsweredCurrentPage}
        >
          <Text style={styles.buttonText}>{btnLabel}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>GAS Score</Text>
            <Text style={styles.modalScore}>{totalScore}</Text>
            <Text style={styles.modalNote}>Thank you for completing the questionnaire.</Text>

            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => {
                setShowModal(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4F4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    fontSize: 16,
    color: '#4C9F70',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4C9F70',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: '#F6FBF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#4C9F70',
    borderColor: '#4C9F70',
  },
  optionText: {
    color: '#4C9F70',
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#EAF4F4',
  },
  button: {
    backgroundColor: '#4C9F70',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalScore: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4C9F70',
    marginBottom: 8,
  },
  modalNote: {
    fontSize: 14,
    color: '#555',
  },
});
