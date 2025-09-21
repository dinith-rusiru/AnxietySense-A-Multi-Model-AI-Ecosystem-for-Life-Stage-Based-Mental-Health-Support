import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';

export default function QuestionnaireScreen({ route }) {
  const { category } = route.params;

  // Example questions
  const questions = [
    { id: '1', text: 'Do you often feel nervous or worried?' },
    { id: '2', text: 'Do you have trouble sleeping because of stress?' },
    { id: '3', text: 'Do you find it hard to relax?' },
  ];

  const [answers, setAnswers] = useState({});

  const handleAnswer = (qid, ans) => {
    setAnswers({ ...answers, [qid]: ans });
  };

  const handleSubmit = () => {
    let score = Object.values(answers).filter(a => a === 'Yes').length;
    Alert.alert(
      `${category} Result`,
      `You answered "Yes" to ${score} out of ${questions.length} questions.`
    );
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
});
