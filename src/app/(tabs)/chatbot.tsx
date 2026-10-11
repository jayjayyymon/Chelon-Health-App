import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChelonHeader from '@/components/chelon-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FloatingTabBarInset, MaxContentWidth, NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';
import { getLocalDateKey } from '@/utils/dietStorage';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const messagesRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const isDark = colorScheme === 'dark';

  // Get current health data from context
  const {
    weightHistory,
    waterGlasses,
    sleepHistory,
    stepsHistory,
    dietMeals
  } = useHealthData();
  const { profile, loading: profileLoading } = useProfile();

  const panelGreen = isDark ? '#245c42' : NavigationColors.background;
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const assistantBubble = isDark ? '#17382e' : '#ffffff';
  const userBubble = isDark ? '#245c42' : '#dcefe0';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const composerColor = isDark ? '#17382e' : '#ffffff';

  useEffect(() => {
    messagesRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Helper function to calculate today's water intake in liters
  const getTodayWaterIntakeL = (): number => {
    const totalMl = waterGlasses.reduce((sum, glass) => sum + glass.amountMl, 0);
    return totalMl / 1000;
  };

  // Helper function to get latest weight entry
  const getLatestWeight = (): { id: string; date: string; kg: number } | null => {
    return weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  };

  // Helper function to get latest sleep entry
  const getLatestSleep = (): { id: string; date: string; hours: number } | null => {
    return sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;
  };

  // Helper function to get latest steps entry
  const getLatestSteps = (): { id: string; date: string; steps: number } | null => {
    return stepsHistory.length > 0 ? stepsHistory[stepsHistory.length - 1] : null;
  };

  // Helper function to calculate today's total calories from meals
  const getTodayMeals = () => {
    const todayKey = getLocalDateKey();
    return dietMeals.filter(meal => (meal.dateKey ?? todayKey) === todayKey);
  };

  // Helper function to calculate today's total calories from meals
  const getTodayTotalCalories = (): number => {
    return getTodayMeals().reduce((sum, meal) => sum + meal.calories, 0);
  };

  // Helper function to get today's meal count
  const getTodayMealCount = (): number => {
    return getTodayMeals().length;
  };

  // Simple rule-based responses using live data
  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase().trim();

    // Greetings
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return 'Hello! How can I help you with your health today?';
    }

    // Water intake
    if (lowerInput.includes('water') || lowerInput.includes('drink') || lowerInput.includes('hydration')) {
      const todayL = getTodayWaterIntakeL();
      const goalL = profile.dailyWaterGoalL;
      return `You've logged ${todayL.toFixed(1)} L of water today out of your ${goalL} L goal. Keep drinking!`;
    }

    // Weight
    if (lowerInput.includes('weight') || lowerInput.includes('weigh')) {
      const latest = getLatestWeight();
      if (latest) {
        const currentWeight = latest.kg;
        const goalWeight = profile.goalWeightKg;
        const weightDiff = currentWeight - goalWeight;
        if (weightDiff > 0) {
          return `Your current weight is ${currentWeight} kg, which is ${weightDiff.toFixed(1)} kg above your goal of ${goalWeight} kg.`;
        } else if (weightDiff < 0) {
          return `Your current weight is ${currentWeight} kg, which is ${Math.abs(weightDiff).toFixed(1)} kg below your goal of ${goalWeight} kg. Great progress!`;
        } else {
          return `Congratulations! You've reached your goal weight of ${goalWeight} kg!`;
        }
      } else {
        return 'No weight data recorded yet. Start tracking your weight to see your progress!';
      }
    }

    // Sleep
    if (lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('rest')) {
      const latest = getLatestSleep();
      if (latest) {
        const sleepHours = latest.hours;
        return `You slept ${sleepHours} hours last night. Aim for 7-9 hours of quality sleep for optimal recovery.`;
      } else {
        return 'No sleep data recorded yet. Try logging your sleep to see your patterns!';
      }
    }

    // Steps/Exercise
    if (lowerInput.includes('step') || lowerInput.includes('walk') || lowerInput.includes('exercise') || lowerInput.includes('activity')) {
      const latest = getLatestSteps();
      if (latest) {
        const todaySteps = latest.steps;
        const goalSteps = profile.dailyStepGoal;
        return `You've taken ${todaySteps.toLocaleString()} steps today toward your goal of ${goalSteps.toLocaleString()} steps. Keep building your daily movement routine.`;
      } else {
        return 'No step data recorded yet. Try adding some steps to see your progress!';
      }
    }

    // Diet/Food
    if (lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('meal') || lowerInput.includes('calorie') || lowerInput.includes('diet')) {
      const totalCalories = getTodayTotalCalories();
      const mealCount = getTodayMealCount();
      if (mealCount > 0) {
        return `You've consumed ${totalCalories} kcal from ${mealCount} meal${mealCount !== 1 ? 's' : ''} today. Remember to balance your meals with protein, veggies, and whole grains.`;
      } else {
        return 'No meals logged yet. Start tracking your food intake to see your nutrition!';
      }
    }

    // Wellness/Mood
    if (lowerInput.includes('mood') || lowerInput.includes('feel') || lowerInput.includes('stress') || lowerInput.includes('anxiety') || lowerInput.includes('wellness')) {
      const latestStatus = profile.wellnessStatus ?? 'not completed';
      return `Your latest wellness check-in is ${latestStatus}. You can take another check-in whenever you want to reflect on how you are feeling.`;
    }

    // Doctors
    if (lowerInput.includes('doctor') || lowerInput.includes('appointment') || lowerInput.includes('consultation')) {
      return 'You have 3 doctors available for consultation. Would you like to book an appointment?';
    }

    // Health centers
    if (lowerInput.includes('clinic') || lowerInput.includes('hospital') || lowerInput.includes('health center') || lowerInput.includes('nearby')) {
      return 'There are 3 nearby health centers. The closest is Riverside Clinic at 0.8 km away.';
    }

    // Profile/Goals
    if (lowerInput.includes('goal') || lowerInput.includes('target') || lowerInput.includes('profile')) {
      return `Your health goals are: Weight ${profile.goalWeightKg} kg, Water ${profile.dailyWaterGoalL} L/day, Steps ${profile.dailyStepGoal.toLocaleString()}/day.`;
    }

    // Help
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return 'I can help you with questions about your water intake, weight, sleep, steps, meals, wellness, doctors appointments, and nearby health centers. Just ask about any of your health data!';
    }

    // Default response
    return 'I\'m here to help with your health questions! Try asking about your water, weight, sleep, steps, meals, or wellness.';
  };

  const handleSendMessage = () => {
    if (profileLoading) return;

    const text = inputText.trim();
    if (text === '') return;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      from: 'user' as const,
      text,
    };

    setMessages(prev => [...prev, userMessage]);

    // Get bot response
    const botResponse = getBotResponse(text);
    const botMessage = {
      id: `msg-${Date.now() + 1}`,
      from: 'bot' as const,
      text: botResponse,
    };

    // Add bot message after a short delay for better UX
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    // Clear input
    setInputText('');
  };

  return (
    <ThemedView style={styles.root}>
      <View pointerEvents="none" style={[styles.heroBackground, { backgroundColor: isDark ? '#183b2d' : '#c9e8ca' }]} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.keyboardArea}>
          <View style={styles.content}>
            <ChelonHeader />

            <View style={styles.heading}>
              <ThemedText style={[styles.headingTitle, { color: inkColor }]}>HEALTH CHATBOT</ThemedText>
              <ThemedText style={[styles.headingSubtitle, { color: mutedInk }]}>Ask me about your health data and goals</ThemedText>
            </View>

            <ScrollView
              ref={messagesRef}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.messages}>
              {messages.map(message => {
                const bubble = (
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: message.from === 'bot' ? assistantBubble : userBubble,
                        borderColor: message.from === 'bot' ? borderColor : 'transparent',
                      },
                      message.from === 'user' && styles.userBubble,
                      message.from === 'bot' && styles.assistantBubble,
                    ]}>
                    <ThemedText style={[styles.sender, { color: message.from === 'bot' ? panelGreen : inkColor }]}>
                      {message.from === 'bot' ? 'CHELON' : 'YOU'}
                    </ThemedText>
                    <ThemedText style={[styles.messageText, { color: inkColor }]}>{message.text}</ThemedText>
                  </View>
                );

                if (message.from === 'user') {
                  return <View key={message.id}>{bubble}</View>;
                }

                return (
                  <View key={message.id} style={styles.assistantMessageRow}>
                    <View style={[styles.avatarFrame, { backgroundColor: isDark ? '#245c42' : '#e5f3e5', borderColor }]}>
                      <Image
                        accessibilityLabel="CHELON turtle mascot"
                        source={require('../../../assets/images/turtle-avatar.png')}
                        resizeMode="contain"
                        style={styles.avatarImage}
                      />
                    </View>
                    {bubble}
                  </View>
                );
              })}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'web' ? undefined : 'position'}
              keyboardVerticalOffset={0}
              style={styles.composerAvoiding}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: composerColor,
                    borderColor,
                    marginBottom: keyboardVisible ? 45 : FloatingTabBarInset - Spacing.two,
                  },
                ]}>
                <TextInput
                  placeholder={profileLoading ? 'Loading your health goals...' : 'Type a message...'}
                  value={inputText}
                  onChangeText={setInputText}
                  style={[styles.input, { color: inkColor, borderColor }]}
                  placeholderTextColor={mutedInk}
                  onSubmitEditing={handleSendMessage}
                  editable={!profileLoading}
                  returnKeyType="send"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  accessibilityState={{ disabled: profileLoading }}
                  disabled={profileLoading}
                  onPress={handleSendMessage}
                  style={({ pressed }) => [
                    styles.sendButton,
                    { backgroundColor: panelGreen, opacity: profileLoading ? 0.5 : pressed ? 0.75 : 1 },
                  ]}>
                  <ThemedText style={styles.sendText}>SEND</ThemedText>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  composerAvoiding: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Math.min(MaxContentWidth, 520),
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 190,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heading: {
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  headingTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  headingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  assistantMessageRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
  avatarFrame: {
    width: 40,
    height: 40,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarImage: {
    position: 'absolute',
    width: 100,
    height: 100,
    left: -30,
    top: -47,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 20,
    borderBottomLeftRadius: 7,
    elevation: 2,
    shadowColor: '#173b2c',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  assistantBubble: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 7,
  },
  sender: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#173b2c',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  input: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  sendButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 13,
  },
  sendText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
