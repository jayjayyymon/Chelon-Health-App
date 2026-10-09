import { StyleSheet, View, Pressable } from 'react-native';
import { useState } from 'react';

import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function WellnessScreen() {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isValid, setIsValid] = useState(false);

  // Define the questionnaire
  const questions = [
    {
      id: 'mood',
      title: 'How would you rate your overall mood today?',
      options: [
        { value: 1, label: 'Very Poor' },
        { value: 2, label: 'Poor' },
        { value: 3, label: 'Fair' },
        { value: 4, label: 'Good' },
        { value: 5, label: 'Excellent' },
      ],
    },
    {
      id: 'stress',
      title: 'How stressed have you felt today?',
      options: [
        { value: 1, label: 'Not at all' },
        { value: 2, label: 'A little' },
        { value: 3, label: 'Moderately' },
        { value: 4, label: 'Quite a bit' },
        { value: 5, label: 'Extremely' },
      ],
    },
    {
      id: 'energy',
      title: 'What is your energy level like right now?',
      options: [
        { value: 1, label: 'Very Low' },
        { value: 2, label: 'Low' },
        { value: 3, label: 'Medium' },
        { value: 4, label: 'High' },
        { value: 5, label: 'Very High' },
      ],
    },
    {
      id: 'sleep',
      title: 'How would you rate the quality of your sleep last night?',
      options: [
        { value: 1, label: 'Very Poor' },
        { value: 2, label: 'Poor' },
        { value: 3, label: 'Fair' },
        { value: 4, label: 'Good' },
        { value: 5, label: 'Excellent' },
      ],
    },
  ];

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Validate that all questions are answered
  const validateForm = () => {
    const allAnswered = questions.every(q => answers[q.id] !== undefined);
    setIsValid(allAnswered);
  };

  // Calculate average score
  const calculateScore = () => {
    const total = questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    return Math.round((total / questions.length) * 10) / 10; // one decimal
  };

  // Get suggestion based on score
  const getSuggestion = (score: number) => {
    if (score >= 4) {
      return 'You\'re doing great! Keep up the healthy habits that are working for you.';
    } else if (score >= 3) {
      return 'You\'re doing okay. Consider small improvements like taking short breaks, staying hydrated, or getting some fresh air.';
    } else {
      return 'You might be having a tough time. Be kind to yourself, reach out to someone you trust, and consider activities that usually help you feel better.';
    }
  };

  // Handle submit
  const handleSubmit = () => {
    setStep('result');
  };

  // Handle retake
  const handleRetake = () => {
    setStep('form');
    setAnswers({});
    setIsValid(false);
  };

  if (step === 'form') {
    return (
      <ScreenContainer subtitle="Reflect on your well-being with this quick check-in.">
        <SectionCard title="Wellness Check-In">
          {questions.map((question) => (
            <View key={question.id} style={styles.questionContainer}>
              <ThemedText type="smallBold">{question.title}</ThemedText>
              <View style={styles.optionsRow}>
                {question.options.map((option) => (
                  <Pressable key={option.value} onPress={() => {
                    handleAnswerChange(question.id, option.value);
                    validateForm();
                  }}>
                    <ThemedView
                      type={answers[question.id] === option.value ? 'backgroundSelected' : 'background'}
                      style={styles.optionChip}
                    >
                      <ThemedText type="small">{option.label}</ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </SectionCard>

        <PlaceholderButton
          label="Submit Check-In"
          onPress={isValid ? handleSubmit : undefined}
        />
        {!isValid && answers && Object.keys(answers).length > 0 && (
          <ThemedText themeColor="textSecondary" style={styles.errorText}>
            Please answer all questions to submit.
          </ThemedText>
        )}
      </ScreenContainer>
    );
  }

  // Result step
  const score = calculateScore();
  const suggestion = getSuggestion(score);

  return (
    <ScreenContainer subtitle="Here's your wellness reflection.">
      <SectionCard title="Your Wellness Check-In">
        <ThemedText type="smallBold">Your Score: {score}/5</ThemedText>
        <ThemedText>{suggestion}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.disclaimer}>
          This check-in is for personal wellness reflection only. It is not a clinical assessment or substitute for professional care. If you are experiencing distress or thoughts of self-harm, please reach out to a trusted person or emergency services immediately.
        </ThemedText>
      </SectionCard>

      <View style={styles.buttonContainer}>
        <PlaceholderButton label="Retake Check-In" onPress={handleRetake} />
        <PlaceholderButton label="Done" onPress={handleRetake} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  questionContainer: {
    marginVertical: Spacing.two,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  optionChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  errorText: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  disclaimer: {
    marginTop: Spacing.two,
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.three,
  },
});