import { StyleSheet } from 'react-native';

import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { chatbotMessages } from '@/data/mock-data';
import { Spacing } from '@/constants/theme';

export default function ChatbotScreen() {
  return (
    <ScreenContainer inTabs title="Health Chatbot" subtitle="Placeholder conversation. Sending is not enabled yet.">
      {chatbotMessages.map((message) => (
        <ThemedView
          key={message.id}
          type={message.from === 'bot' ? 'backgroundElement' : 'backgroundSelected'}
          style={[styles.bubble, message.from === 'user' && styles.userBubble]}>
          <ThemedText type="smallBold">{message.from === 'bot' ? 'Helper' : 'You'}</ThemedText>
          <ThemedText>{message.text}</ThemedText>
        </ThemedView>
      ))}
      <PlaceholderButton label="Type a message (coming later)" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bubble: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
});
