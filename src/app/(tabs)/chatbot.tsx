import { StyleSheet, TextInput } from 'react-native';

import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useState } from 'react';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/use-theme';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');

  // Get current health data from context
  const {
    weightHistory,
    waterGlasses,
    sleepHistory,
    stepsHistory,
    dietMeals
  } = useHealthData();
  const { profile, loading: profileLoading } = useProfile();
  const theme = useTheme();

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
  const getTodayTotalCalories = (): number => {
    return dietMeals.reduce((sum: number, meal: { calories: number }) => sum + meal.calories, 0);
  };

  // Helper function to get today's meal count
  const getTodayMealCount = (): number => {
    return dietMeals.length;
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
    <ScreenContainer inTabs title="Health Chatbot" subtitle="Ask me about your health data and goals">
      <ThemedView style={{flex: 1}}>
        {messages.map((message) => (
          <ThemedView
            key={message.id}
            type={message.from === 'bot' ? 'backgroundElement' : 'backgroundSelected'}
            style={[styles.bubble, message.from === 'user' && styles.userBubble]}>
            <ThemedText type="smallBold">{message.from === 'bot' ? 'Helper' : 'You'}</ThemedText>
            <ThemedText>{message.text}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView
        type="backgroundSelected"
        style={[styles.inputContainer, { borderColor: theme.textSecondary }]}
      >
        <TextInput
          placeholder={profileLoading ? 'Loading your health goals...' : 'Type a message...'}
          value={inputText}
          onChangeText={setInputText}
          style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
          placeholderTextColor={theme.textSecondary}
          onSubmitEditing={handleSendMessage}
          editable={!profileLoading}
        />
        <PlaceholderButton
          label="Send"
          onPress={profileLoading ? undefined : handleSendMessage}
        />
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bubble: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginBottom: Spacing.one,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.two,
    borderTopWidth: 1,
    borderColor: '#888',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});