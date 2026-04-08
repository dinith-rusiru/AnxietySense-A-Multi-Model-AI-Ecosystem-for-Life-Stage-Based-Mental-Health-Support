import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, SafeAreaView } from 'react-native';

const QUESTIONS_BY_CATEGORY = {
  default: [
    { id: '1', text: 'Do you often feel nervous or worried?' },
    { id: '2', text: 'Do you have trouble sleeping because of stress?' },
    { id: '3', text: 'Do you find it hard to relax?' },
  ],
  Child: [
    { id: '1', text: 'Do you feel scared or worried a lot?' },
    { id: '2', text: 'Do you have bad dreams or trouble sleeping?' },
    { id: '3', text: 'Do you have tummy aches when you are nervous?' },
  ],
  'Young Elder': [
    { id: '1', text: 'Do you feel anxious about your career or future?' },
    { id: '2', text: 'Do you feel overwhelmed by daily responsibilities?' },
    { id: '3', text: 'Do you have difficulty switching off and relaxing?' },
  ],
  'Pregnant Woman': [
    { id: '1', text: 'Do you feel worried about your pregnancy or baby?' },
    { id: '2', text: 'Do you have trouble sleeping due to anxiety?' },
    { id: '3', text: 'Do you feel emotionally overwhelmed often?' },
  ],
};

export default function QuestionnaireScreen({ route }) {
  const { category } = route.params || {};
  const questions = QUESTIONS_BY_CATEGORY[category] || QUESTIONS_BY_CATEGORY.default;
  const [answers, setAnswers] = useState({});

  const handleAnswer = (qid, ans) => setAnswers({ ...answers, [qid]: ans });

  const handleSubmit = () => {
    const answered = Object.keys(answers).length;
    if (answered < questions.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    const score = Object.values(answers).filter((a) => a === 'Yes').length;
    Alert.alert(
      `${category} Result`,
      `You answered "Yes" to ${score} out of ${questions.length} questions.\n\n${
        score === 0 ? 'You seem to be doing well! 😊'
        : score === 1 ? 'Mild signs detected. Consider relaxation activities.'
        : 'Please consider speaking with a healthcare professional.'
      }`,
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{category} Questionnaire</Text>

        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.questionBox}>
              <Text style={styles.question}>{item.id}. {item.text}</Text>
              <View style={styles.row}>
                {['Yes', 'No'].map((ans) => (
                  <TouchableOpacity
                    key={ans}
                    style={[styles.option, answers[item.id] === ans && styles.selected]}
                    onPress={() => handleAnswer(item.id, ans)}
                  >
                    <Text style={[styles.optionText, answers[item.id] === ans && styles.selectedText]}>{ans}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#EAF4F4' },
  container:    { flex: 1, backgroundColor: '#EAF4F4', padding: 16 },
  title:        { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  questionBox:  { marginBottom: 16, backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  question:     { fontSize: 16, marginBottom: 12, color: '#333', lineHeight: 22 },
  row:          { flexDirection: 'row', justifyContent: 'space-around' },
  option:       { backgroundColor: '#EAF4F4', padding: 12, borderRadius: 8, width: '42%', alignItems: 'center', borderWidth: 1.5, borderColor: '#4C9F70' },
  selected:     { backgroundColor: '#4C9F70' },
  optionText:   { fontSize: 16, color: '#4C9F70', fontWeight: '600' },
  selectedText: { color: '#fff' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#EAF4F4' },
  submitButton: { backgroundColor: '#4C9F70', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText:   { fontSize: 18, color: '#fff', fontWeight: '700' },
});