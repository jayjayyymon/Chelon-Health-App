import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PlaceholderButtonProps = {
  label: string;
};

export function PlaceholderButton({ label }: PlaceholderButtonProps) {
  return (
    <ThemedView type="backgroundSelected" style={styles.button}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
});
