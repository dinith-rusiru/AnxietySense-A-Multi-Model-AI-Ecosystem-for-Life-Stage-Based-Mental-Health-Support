import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AccessibleButton from '../components/AccessibleButton';

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

const AssessmentScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<number[]>(Array(GAD7_QUESTIONS.length).fill(-1));

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // In a real app, you would save the assessment results
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>GAD-7 Assessment</Text>
        {GAD7_QUESTIONS.map((question, qIndex) => (
          <View key={qIndex} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question}</Text>
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
                onPress={() => handleAnswer(qIndex, oIndex)}
                isChecked={answers[qIndex] === oIndex}
                // Accessibility for the checkbox
                accessibilityLabel={`${question}: ${option}`}
              />
            ))}
          </View>
        ))}
        <AccessibleButton
          title="Submit"
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#3C3C43',
  },
});

export default AssessmentScreen;
