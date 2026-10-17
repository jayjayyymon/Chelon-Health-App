import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackerActionButton } from '@/components/tracker-action-button';
import { Colors, NavigationColors, Spacing } from '@/constants/theme';
import { useAlert } from '@/hooks/use-alert';
import { useProfile } from '@/hooks/useProfile';

export default function WellnessScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, saveProfile: saveProfileToStorage } = useProfile();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const [, showAlert, , AlertComponent] = useAlert();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const panelGreen = isDark ? '#245c42' : NavigationColors.background;
  const panelText = '#ffffff';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const tileColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';

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
      <ScreenContainer>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: tileColor, opacity: pressed ? 0.78 : 1 },
            ]}>
            <ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText>
          </Pressable>
          <ThemedText style={[styles.wordmark, { color: inkColor }]}>wellness tracker</ThemedText>
          <View style={styles.topBarSpacer} />
        </View>
        <ThemedText themeColor="textSecondary" style={styles.headerDescription}>
          Reflect on your well-being with this quick check-in.
        </ThemedText>

        <SectionCard title="">
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <ThemedText themeColor="textSecondary" style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </ThemedText>
            <View style={[styles.progressTrack, { backgroundColor: tileColor, borderColor }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    backgroundColor: panelGreen,
                  },
                ]}
              />
            </View>
          </View>

          {/* Current question */}
          <ThemedView
            type="backgroundElement"
            key={currentQuestion.id}
            style={[styles.questionCard, { backgroundColor: tileColor, borderColor }]}>
            <ThemedText type="smallBold" style={styles.questionTitle}>
              {currentQuestion.title}
            </ThemedText>
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityLabel={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: answers[currentQuestion.id] === option.value }}
                  onPress={() => handleAnswerChange(option.value)}
                  style={({ pressed }) => [
                    styles.optionButton,
                    {
                      backgroundColor: tileColor,
                      borderColor: answers[currentQuestion.id] === option.value ? panelGreen : borderColor,
                    },
                    pressed && styles.optionButtonPressed,
                  ]}>
                  <ThemedText type="small" style={[styles.optionLabel, { color: inkColor }]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        </SectionCard>

        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {currentQuestionIndex > 0 && (
            <TrackerActionButton
              backgroundColor={tileColor}
              color={inkColor}
              label="BACK"
              onPress={handleBack}
              style={[styles.secondaryAction, { borderColor }]}
            />
          )}
          <TrackerActionButton
            backgroundColor={panelGreen}
            color={panelText}
            label={currentQuestionIndex < totalQuestions - 1 ? 'NEXT' : 'FINISH'}
            onPress={handleNextOrSubmit}
            style={styles.primaryAction}
          />
        </View>

        {/* Validation message */}
        {attemptedContinue && !isCurrentQuestionAnswered && (
          <ThemedText themeColor="textSecondary" style={[styles.errorText, { color: mutedInk }]}>
            Please answer the current question to continue.
          </ThemedText>
        )}
      </ScreenContainer>
    );
  }

  // Result step: show summary of answers with suggestions
  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: tileColor, opacity: pressed ? 0.78 : 1 },
            ]}>
            <ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText>
          </Pressable>
          <ThemedText style={[styles.wordmark, { color: inkColor }]}>wellness tracker</ThemedText>
          <View style={styles.topBarSpacer} />
        </View>
        <ThemedText themeColor="textSecondary" style={styles.headerDescription}>
          Here&apos;s your wellness reflection.
        </ThemedText>

        <SectionCard title="">
          {/* Friendly header */}
          <ThemedText type="smallBold" style={styles.resultHeader}>
            Thanks for checking in! Here&apos;s what you shared:
          </ThemedText>

          {/* Answers summary */}
          <View style={styles.summaryContainer}>
            {questions.map((question) => (
              <ThemedView
                type="backgroundSelected"
                key={question.id}
                style={[styles.summaryItem, { backgroundColor: tileColor, borderColor }]}>
                <ThemedText type="smallBold" style={styles.summaryQuestion}>
                  {question.title}
                </ThemedText>
                <ThemedText style={styles.summaryAnswer}>
                  {(answers[question.id] !== undefined
                    ? questions.find(q => q.id === question.id)?.options.find(o => o.value === answers[question.id])?.label
                    : 'Not answered')}
                </ThemedText>
              </ThemedView>
            ))}
          </View>

          {/* Suggestions section */}
          {(suggestions.length > 0 && (
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
          ))}

          {/* Disclaimer */}
          <ThemedText themeColor="textSecondary" style={styles.disclaimer}>
            This check-in is for personal wellness reflection only. It is not a clinical assessment or substitute for professional care. If you are experiencing distress or thoughts of self-harm, please reach out to a trusted person or emergency services immediately.
          </ThemedText>
        </SectionCard>

        <View style={styles.buttonContainer}>
          <TrackerActionButton
            backgroundColor={tileColor}
            color={inkColor}
            label="RETAKE"
            onPress={handleRetake}
            style={[styles.secondaryAction, { borderColor }]}
          />
          <TrackerActionButton
            backgroundColor={panelGreen}
            color={panelText}
            label="DONE"
            onPress={() => {
              // Navigate to dashboard (tabs index)
              router.replace('../(tabs)');
            }}
            style={styles.primaryAction}
          />
        </View>
      </ScreenContainer>
      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#173b2c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  backGlyph: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    marginTop: -4,
  },
  wordmark: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: -0.7,
    fontStyle: 'italic',
  },
  topBarSpacer: {
    width: 40,
  },
  headerDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: Spacing.one,
  },
  progressContainer: {
    marginBottom: Spacing.two,

  },
  progressText: {
    marginTop: -25,
    marginBottom: Spacing.one,
    textAlign: 'center',
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questionCard: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  optionsContainer: {
    marginTop: Spacing.one,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: 'transparent',
    marginBottom: Spacing.one,
  },
  optionSurface: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  optionButtonPressed: {
    opacity: 0.78,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
  },
  errorText: {
    marginTop: Spacing.one,
    textAlign: 'center',
    fontSize: 13,
  },
  resultHeader: {
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: Spacing.two,
  },
  summaryItem: {
    marginVertical: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.half,
  },
  summaryAnswer: {
    fontSize: 14,
  },
  suggestionsSection: {
    marginVertical: Spacing.two,
  },
  suggestionsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  suggestionText: {
    fontSize: 14,
    marginLeft: Spacing.two,
    marginBottom: Spacing.one,
  },
  disclaimer: {
    marginTop: Spacing.two,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});