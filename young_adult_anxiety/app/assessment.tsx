import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AccessibleButton from '../components/AccessibleButton';
import { Stack, router } from 'expo-router';

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const GAD7_OPTIONS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

const ENCOURAGING_MESSAGES = [
  "Great job!",
  "Keep it up!",
  "You're doing great!",
  "Almost there!",
  "Nice work!",
];

const AssessmentScreen = () => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<number[]>(Array(GAD7_QUESTIONS.length).fill(-1));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [message, setMessage] = useState('');

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
    setMessage(ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < GAD7_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setMessage('');
    } else {
      const totalScore = answers.reduce((acc, val) => acc + val, 0);
      let anxietyLevel = '';
      if (totalScore <= 4) {
        anxietyLevel = 'Minimal anxiety';
      } else if (totalScore <= 9) {
        anxietyLevel = 'Mild anxiety';
      } else if (totalScore <= 14) {
        anxietyLevel = 'Moderate anxiety';
      } else {
        anxietyLevel = 'Severe anxiety';
      }
      router.push({ pathname: '/results', params: { score: totalScore, level: anxietyLevel } });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setMessage('');
    }
  };

  const isLastQuestion = currentQuestionIndex === GAD7_QUESTIONS.length - 1;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Assessment' }} />
        <Text style={styles.title}>GAD-7 Assessment</Text>
        <Text style={styles.helperText}>Over the last 2 weeks, how often have you been bothered by the following problems?</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / GAD7_QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{`Question ${currentQuestionIndex + 1} of ${GAD7_QUESTIONS.length}`}</Text>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{GAD7_QUESTIONS[currentQuestionIndex]}</Text>
          {GAD7_OPTIONS.map((option, oIndex) => (
            <BouncyCheckbox
              key={oIndex}
              size={25}
              fillColor="#007AFF"
              unFillColor="#FFFFFF"
              text={option}
              iconStyle={{ borderColor: '#007AFF' }}
              innerIconStyle={{ borderWidth: 2 }}
              textStyle={{ textDecorationLine: "none", fontSize: 16 }}
              onPress={() => handleAnswer(oIndex)}
              isChecked={answers[currentQuestionIndex] === oIndex}
              // Accessibility for the checkbox
              accessibilityLabel={`${GAD7_QUESTIONS[currentQuestionIndex]}: ${option}`}
            />
          ))}
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
        <View style={styles.navigationContainer}>
          <AccessibleButton
            title="Previous"
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          />
          <AccessibleButton
            title={isLastQuestion ? "Submit" : "Next"}
            onPress={handleNext}
          />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F5F7'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  helperText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#6C6C6E',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#6C6C6E',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#3C3C43',
  },
  message: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    marginBottom: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
});

export default AssessmentScreen;
