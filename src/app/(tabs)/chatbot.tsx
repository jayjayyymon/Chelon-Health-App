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
import Constants from 'expo-constants';
import MarkdownDisplay from 'react-native-markdown-display';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
};

type BackendMessage = {
  role: string;
  content: string;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const messagesRef = useRef<ScrollView>(null);
  const pendingReplyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    return () => {
      if (pendingReplyRef.current) clearTimeout(pendingReplyRef.current);
    };
  }, []);

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
    const todayKey = getLocalDateKey();
    const totalMl = waterGlasses
      .filter(glass => (glass.dateKey ?? todayKey) === todayKey)
      .reduce((sum, glass) => sum + glass.amountMl, 0);
    return totalMl / 1000;
  };

  // Helper function to get latest weight entry
  const getLatestWeight = (): { id: string; date: string; kg: number } | null => {
    return weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  };

  // Helper function to get latest sleep entry
  const getLatestSleep = (): { id: string; date: string; hours: number } | null => {
    const todayKey = getLocalDateKey();
    return sleepHistory.find(entry => (entry.dateKey ?? entry.date) === todayKey) ?? null;
  };

  // Helper function to get latest steps entry
  const getLatestSteps = (): { id: string; date: string; steps: number } | null => {
    const todayKey = getLocalDateKey();
    return stepsHistory.find(entry => (entry.dateKey ?? entry.date) === todayKey) ?? null;
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

  // Generate a brief health summary string
  const getHealthSummary = (): string => {
    const todayL = getTodayWaterIntakeL();
    const goalL = profile.dailyWaterGoalL;
    const latestWeight = getLatestWeight();
    const latestSleep = getLatestSleep();
    const latestSteps = getLatestSteps();
    const totalCalories = getTodayTotalCalories();
    const mealCount = getTodayMealCount();
    const wellnessStatus = profile.wellnessStatus ?? 'not completed';

    let summary = `Today's health summary: `;
    summary += `Water ${todayL.toFixed(1)}L/${goalL}L. `;
    if (latestWeight) {
      summary += `Weight ${latestWeight.kg}kg. `;
    }
    if (latestSleep) {
      summary += `Sleep ${latestSleep.hours}hrs. `;
    }
    if (latestSteps) {
      summary += `Steps ${latestSteps.steps}. `;
    }
    summary += `Calories ${totalCalories}kcal from ${mealCount} meals. `;
    summary += `Wellness: ${wellnessStatus}.`;

    return summary;
  };

  const handleSendMessage = async () => {
    if (profileLoading) return;

    const text = inputText.trim();
    if (text === '') return;

    // Prevent empty messages
    if (text.length === 0) {
      return;
    }

    // Add user message to chat state immediately
    const userMessage = {
      id: `msg-${Date.now()}`,
      from: 'user' as const,
      text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Get Supabase URL and anon key from Expo constants
      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
      const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration not found. Please set supabaseUrl and supabaseAnonKey in app.json extra.');
      }

      // Prepare conversation history to send to backend
      // Map existing messages to backend format (role, content)
      const existingMessagesAsBackend: BackendMessage[] = messages.map(msg => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      // Limit conversation history to most recent 10 messages to avoid exceeding limits
      const recentMessages = existingMessagesAsBackend.slice(-10);

      // Create health summary system message
      const healthSummary = getHealthSummary();
      const healthMessage: BackendMessage = {
        role: 'system',
        content: healthSummary,
      };

      // Current user message as backend message
      const currentUserMessage: BackendMessage = {
        role: 'user',
        content: text,
      };

      // Combine: [health summary, recent messages, current user message]
      // Note: The edge function will prepend its own system instruction
      const backendMessages = [healthMessage, ...recentMessages, currentUserMessage];

      // Call the Supabase Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/chelon-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          messages: backendMessages,
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        let errorMessage = 'Failed to get response from AI service';
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `AI service error: ${errorData.error.message}`;
          }
        } catch {
          errorMessage = `AI service error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessageText = data.message;

      if (!assistantMessageText) {
        throw new Error('No response generated from AI service');
      }

      // Add bot response to chat state
      const botMessage = {
        id: `msg-${Date.now() + 1}`,
        from: 'bot' as const,
        text: assistantMessageText,
      };

      // Add bot message after a short delay for better UX (to match previous behavior)
      if (pendingReplyRef.current) clearTimeout(pendingReplyRef.current);
      pendingReplyRef.current = setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        pendingReplyRef.current = null;
        setLoading(false);
      }, 500);
    } catch (error: unknown) {
      console.error('Error in chatbot:', error);
      // Add an error message as a bot message
      const errorMessage = error instanceof Error ? `Error: ${error.message}. Please try again.` : 'An unknown error occurred. Please try again.';
      const botMessage = {
        id: `msg-${Date.now() + 1}`,
        from: 'bot' as const,
        text: errorMessage,
      };

      // Add error message after a short delay
      if (pendingReplyRef.current) clearTimeout(pendingReplyRef.current);
      pendingReplyRef.current = setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        pendingReplyRef.current = null;
        setLoading(false);
      }, 500);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <View pointerEvents="none" style={[styles.heroBackground, { backgroundColor: isDark ? '#183b2d' : '#ffffff' }]} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.keyboardArea}>
          <View style={styles.content}>
            <ChelonHeader />

            <View style={styles.heading}>
              <ThemedText style={ [styles.headingTitle, { color: inkColor, marginTop: -20 }] }>HEALTH CHATBOT</ThemedText>
              <ThemedText style={ [styles.headingSubtitle, { color: mutedInk }] }>Ask me about your health data and goals</ThemedText>
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
                    <ThemedText style={ [styles.sender, { color: message.from === 'bot' ? panelGreen : inkColor } ]}>
                      {message.from === 'bot' ? 'CHELON' : 'YOU'}
                    </ThemedText>
                    {message.from === 'bot' ? (
                      <MarkdownDisplay>
                        {message.text}
                      </MarkdownDisplay>
                    ) : (
                      <ThemedText style={ [styles.messageText, { color: inkColor } ]}>{message.text}</ThemedText>
                    )}
                  </View>
                );

                if (message.from === 'user') {
                  return <View key={message.id}>{bubble}</View>;
                }

                return (
                  <View key={message.id} style={styles.assistantMessageRow}>
                    <View style={ [styles.avatarFrame, { backgroundColor: isDark ? '#245c42' : '#e5f3e5', borderColor } ]}>
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
                  style={ [styles.input, { color: inkColor, borderColor } ]}
                  placeholderTextColor={mutedInk}
                  onSubmitEditing={handleSendMessage}
                  editable={!profileLoading && !loading}
                  returnKeyType="send"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  accessibilityState={{ disabled: profileLoading || loading }}
                  disabled={profileLoading || loading}
                  onPress={handleSendMessage}
                  style={({ pressed }) => [
                    styles.sendButton,
                    {
                      backgroundColor: panelGreen,
                      opacity: (profileLoading || loading) ? 0.5 : pressed ? 0.75 : 1
                    },
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