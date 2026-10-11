import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PlaceholderButtonProps = {
  label: string;
  onPress?: () => void;
};

export function PlaceholderButton({ label, onPress }: PlaceholderButtonProps) {
  if (!onPress) {
    return (
      <ThemedView type="backgroundSelected" style={styles.button}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});