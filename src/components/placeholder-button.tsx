import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PlaceholderButtonProps = {
  label: string;
  onPress?: () => void;
};

export function PlaceholderButton({ label, onPress }: PlaceholderButtonProps) {
  const ButtonComponent = onPress ? TouchableOpacity : ThemedView;

  return (
    <ButtonComponent
      type="backgroundSelected"
      style={styles.button}
      onPress={onPress}
    >
      <ThemedText type="smallBold">{label}</ThemedText>
    </ButtonComponent>
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