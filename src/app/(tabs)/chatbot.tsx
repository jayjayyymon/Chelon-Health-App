import { StyleSheet } from 'react-native';

import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { chatbotMessages } from '@/data/mock-data';
import { Spacing } from '@/constants/theme';
import { TextInput } from 'react-native';
import { useState } from 'react';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState(chatbotMessages);
  const [inputText, setInputText] = useState('');

  // Simple rule-based responses
  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase().trim();

    // Greetings
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return 'Hello! How can I help you with your health today?';
    }

    // Water intake
    if (lowerInput.includes('water') || lowerInput.includes('drink') || lowerInput.includes('hydration')) {
      return 'Your daily water goal is 2.5 L. Make sure to stay hydrated throughout the day!';
    }

    // Weight
    if (lowerInput.includes('weight') || lowerInput.includes('weigh')) {
      return 'Your current weight is 70.4 kg and your goal is 68 kg. Keep tracking your progress!';
    }

    // Sleep
    if (lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('rest')) {
      return 'You slept 7.2 hours last night. Aim for 7-9 hours of quality sleep for optimal recovery.';
    }

    // Steps/Exercise
    if (lowerInput.includes('step') || lowerInput.includes('walk') || lowerInput.includes('exercise') || lowerInput.includes('activity')) {
      return 'You\'ve taken 6,240 steps today toward your goal of 8,000. Every step counts!';
    }

    // Diet/Food
    if (lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('meal') || lowerInput.includes('calorie') || lowerInput.includes('diet')) {
      return 'You\'ve consumed 1,010 kcal from 3 meals today. Remember to balance your meals with protein, veggies, and whole grains.';
    }

    // Wellness/Mood
    if (lowerInput.includes('mood') || lowerInput.includes('feel') || lowerInput.includes('stress') || lowerInput.includes('anxiety') || lowerInput.includes('wellness')) {
      return 'Your wellness check-in today was \"Okay\". Consider taking short breaks to relax and practice deep breathing if you\'re feeling stressed.';
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
      return 'Your goals are: Weight 68 kg, Water 2.5 L/day, Steps 8,000/day. You\'re making great progress!';
    }

    // Help
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return 'I can help you with questions about your water intake, weight, sleep, steps, diet, wellness, doctors appointments, and nearby health centers. Just ask!';
    }

    // Default response
    return 'I\'m here to help with your health questions! Try asking about your water, weight, sleep, steps, meals, or wellness.';
  };

  const handleSendMessage = () => {
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

      <ThemedView type="backgroundSelected" style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          onSubmitEditing={handleSendMessage}
        />
        <PlaceholderButton label="Send" onPress={handleSendMessage} />
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
    borderColor: 'border',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});