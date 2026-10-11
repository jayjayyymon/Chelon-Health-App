import { StyleSheet, View, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import { useAlert } from '@/hooks/use-alert';

export default function WellnessScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, saveProfile: saveProfileToStorage } = useProfile();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const [alertVisible, showAlert, hideAlert, AlertComponent] = useAlert();

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

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer change for the current question
  const handleAnswerChange = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    setAttemptedContinue(false);
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = answers[currentQuestion.id] !== undefined;

  // Handle going to next question or submitting
  const handleNextOrSubmit = async () => {
    if (!isCurrentQuestionAnswered) {
      setAttemptedContinue(true);
      return;
    }

    setAttemptedContinue(false);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return;
    }

    if (profileLoading) {
      showAlert({
        title: 'Please wait',
        message: 'Your profile is still loading. Try submitting again in a moment.',
        type: 'information',
      });
      return;
    }

    const moodOption = questions[0].options.find(option => option.value === answers.mood);
    const wellnessStatus = moodOption?.label ?? 'Completed';
    const saved = await saveProfileToStorage({ ...profile, wellnessStatus });
    if (!saved) {
      showAlert({
        title: 'Unable to save check-in',
        message: 'Please try again.',
        type: 'error',
      });
      return;
    }

    setStep('result');
  };

  // Handle going back to previous question
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle retake (reset everything)
  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAttemptedContinue(false);
    setStep('form');
  };

  // Generate wellness suggestions based on answers
  const getSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const moodVal = answers.mood;
    const stressVal = answers.stress;
    const energyVal = answers.energy;
    const sleepVal = answers.sleep;

    // Helper to add suggestion if not already similar
    const addIfUnique = (text: string) => {
      if (!suggestions.some(s => s.toLowerCase().includes(text.toLowerCase().slice(0, 20)))) {
        suggestions.push(text);
      }
    };

    // Mood-based suggestions
    if (moodVal !== undefined) {
      if (moodVal <= 2) {
        addIfUnique('Try doing something you enjoy to lift your mood, like listening to music or talking to a friend.');
      } else if (moodVal >= 4) {
        addIfUnique('You\'re in a great mood! Keep doing what\'s working for you.');
      }
    }

    // Stress-based suggestions
    if (stressVal !== undefined) {
      if (stressVal >= 4) {
        addIfUnique('Consider taking short breaks to relax and practice deep breathing.');
      } else if (stressVal <= 2) {
        addIfUnique('Your stress levels are low. Notice what helps you stay calm and relaxed.');
      }
    }

    // Energy-based suggestions
    if (energyVal !== undefined) {
      if (energyVal <= 2) {
        addIfUnique('Stay hydrated and consider light activity like stretching to boost your energy.');
      } else if (energyVal >= 4) {
        addIfUnique('You have plenty of energy! Consider channeling it into activities you enjoy.');
      }
    }

    // Sleep-based suggestions
    if (sleepVal !== undefined) {
      if (sleepVal <= 2) {
        addIfUnique('Aim for a consistent sleep schedule and avoid screens before bedtime.');
      } else if (sleepVal >= 4) {
        addIfUnique('You\'re getting good sleep! Keep up your healthy bedtime routine.');
      }
    }

    // If no specific suggestions (all medium or missing), add a general one
    if (suggestions.length === 0) {
      suggestions.push('Take a moment to appreciate how you\'re feeling right now.');
    }

    // Limit to 3 suggestions to avoid overwhelming
    return suggestions.slice(0, 3);
  };

  const suggestions = step === 'result' ? getSuggestions() : [];

  if (step === 'form') {
    return (
      <ScreenContainer subtitle="Reflect on your well-being with this quick check-in.">
        <SectionCard title="Wellness Check-In">
          {/* Progress indicator */}
          <ThemedText themeColor="textSecondary" style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </ThemedText>

          {/* Current question */}
          <View key={currentQuestion.id} style={styles.questionContainer}>
            <ThemedText type="smallBold">{currentQuestion.title}</ThemedText>
            <View style={styles.optionsRow}>
              {currentQuestion.options.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityLabel={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: answers[currentQuestion.id] === option.value }}
                  onPress={() => handleAnswerChange(option.value)}
                >
                  <ThemedView
                    type={answers[currentQuestion.id] === option.value ? 'backgroundSelected' : 'background'}
                    style={styles.optionChip}
                  >
                    <ThemedText type="small">{option.label}</ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
          </View>
        </SectionCard>

        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {currentQuestionIndex > 0 && (
            <PlaceholderButton label="Back" onPress={handleBack} />
          )}
          {currentQuestionIndex < totalQuestions - 1 ? (
            <PlaceholderButton
              label="Next"
              onPress={handleNextOrSubmit}
            />
          ) : (
            <PlaceholderButton
              label="Submit"
              onPress={handleNextOrSubmit}
            />
          )}
        </View>

        {/* Validation message */}
        {attemptedContinue && !isCurrentQuestionAnswered && (
          <ThemedText themeColor="textSecondary" style={styles.errorText}>
            Please answer the current question to continue.
          </ThemedText>
        )}
      </ScreenContainer>
    );
  }

  // Result step: show summary of answers with suggestions
  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer subtitle="Here's your wellness reflection.">
        <SectionCard title="Your Wellness Check-In">
        {/* Friendly header */}
        <ThemedText type="smallBold" style={styles.resultHeader}>
          Thanks for checking in! Here&apos;s what you shared:
        </ThemedText>

        {/* Answers summary */}
        {questions.map((question) => (
          <View key={question.id} style={styles.summaryItem}>
            <ThemedText type="smallBold">{question.title}</ThemedText>
            <ThemedText>
              {answers[question.id] !== undefined
                ? questions.find(q => q.id === question.id)?.options.find(o => o.value === answers[question.id])?.label
                : 'Not answered'}
            </ThemedText>
          </View>
        ))}

        {/* Suggestions section */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <ThemedText type="smallBold" style={styles.suggestionsHeader}>
              Friendly suggestions:
            </ThemedText>
            {suggestions.map((suggestion, index) => (
              <ThemedText key={index} style={styles.suggestionText}>
                • {suggestion}
              </ThemedText>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <ThemedText themeColor="textSecondary" style={styles.disclaimer}>
          This check-in is for personal wellness reflection only. It is not a clinical assessment or substitute for professional care. If you are experiencing distress or thoughts of self-harm, please reach out to a trusted person or emergency services immediately.
        </ThemedText>
      </SectionCard>

      <View style={styles.buttonContainer}>
        <PlaceholderButton label="Retake" onPress={handleRetake} />
        <PlaceholderButton
          label="Done"
          onPress={() => {
            // Navigate to dashboard (tabs index)
            router.replace('../(tabs)');
          }}
        />
        </View>
      </ScreenContainer>
      <AlertComponent />
    </View>
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
  progressText: {
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  summaryItem: {
    marginVertical: Spacing.one,
  },
  resultHeader: {
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  suggestionsSection: {
    marginVertical: Spacing.two,
  },
  suggestionsHeader: {
    marginBottom: Spacing.one,
  },
  suggestionText: {
    marginLeft: Spacing.two,
    marginBottom: Spacing.one,
  },
});