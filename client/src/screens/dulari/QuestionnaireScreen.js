import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getAnxietyLevelFromScore(score, totalQuestions) {
  if (!Number.isFinite(score) || !Number.isFinite(totalQuestions) || totalQuestions <= 0) return 'Minimal';
  const ratio = score / totalQuestions;
  if (ratio >= 0.75) return 'Severe';
  if (ratio >= 0.5) return 'Moderate';
  if (ratio >= 0.25) return 'Mild';
return 'Minimal';
}

export default function QuestionnaireScreen({ route, navigation }) {
  const { category } = route.params;


  const questions = [
    { id: '1', text: 'Do you often feel nervous or worried?' },
    { id: '2', text: 'Do you have trouble sleeping because of stress?' },
    { id: '3', text: 'Do you find it hard to relax?' },
  ];

  const [answers, setAnswers] = useState({});
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);

  const categoryKey = `questionnaire_last_filled_${String(category || 'general').toLowerCase().replace(/\s+/g, '_')}`;

  const handleAnswer = (qid, ans) => {
    setAnswers({ ...answers, [qid]: ans });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    const score = Object.values(answers).filter(a => a === 'Yes').length;
    const now = Date.now();

    try {
      const lastFilledRaw = await AsyncStorage.getItem(categoryKey);
      const lastFilledTs = lastFilledRaw ? new Date(lastFilledRaw).getTime() : NaN;
      const answeredThisWeek = Number.isFinite(lastFilledTs) && (now - lastFilledTs) < ONE_WEEK_MS;

      if (answeredThisWeek) {
        setPendingScore(score);
        setShowWeeklyModal(true);
        return;
      }

      await AsyncStorage.setItem(categoryKey, new Date(now).toISOString());
      await AsyncStorage.setItem(`${categoryKey}_last_score`, String(score));
    } catch (e) {
      console.warn('Failed to read/write questionnaire timestamp:', e?.message || e);
    }

    Alert.alert(
      `${category} Result`,
      `You answered "Yes" to ${score} out of ${questions.length} questions.`
    );
  };

  const handleContinueToActivities = () => {
    setShowWeeklyModal(false);
    const anxietyLevel = getAnxietyLevelFromScore(pendingScore, questions.length);
    navigation.navigate('RecommendedActivities', {
      anxietyLevel,
      totalScore: pendingScore,
      predictedSongs: [],
    });
  };

  const handleAnswerAgain = () => {
    setShowWeeklyModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category} Questionnaire</Text>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questionBox}>
            <Text style={styles.question}>{item.text}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.option,
                  answers[item.id] === 'Yes' && styles.selected,
                ]}
                onPress={() => handleAnswer(item.id, 'Yes')}
              >
                <Text style={styles.optionText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  answers[item.id] === 'No' && styles.selected,
                ]}
                onPress={() => handleAnswer(item.id, 'No')}
              >
                <Text style={styles.optionText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      <Modal
        visible={showWeeklyModal}
        transparent
        animationType="fade"
        onRequestClose={handleAnswerAgain}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Already answered this week</Text>
            <Text style={styles.modalText}>You already answered this questionnaire this week.</Text>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleContinueToActivities}>
              <Text style={styles.modalPrimaryText}>Continue to Activities</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={handleAnswerAgain}>
              <Text style={styles.modalSecondaryText}>Answer Questions Again</Text>
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
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionBox: {
    marginBottom: 20,
    backgroundColor: '#EAF4F4',
    padding: 15,
    borderRadius: 10,
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  option: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#4C9F70',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#4C9F70',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#223',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: '#4C9F70',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  modalPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalSecondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4C9F70',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalSecondaryText: {
    color: '#4C9F70',
    fontWeight: '700',
    fontSize: 16,
  },
});
