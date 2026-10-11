import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type TrackerActionButtonProps = {
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  backgroundColor: string;
  color: string;
  icon?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityState?: PressableProps['accessibilityState'];
  style?: StyleProp<ViewStyle>;
};

export function TrackerActionButton({
  label,
  onPress,
  backgroundColor,
  color,
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityState,
  style,
}: TrackerActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.55 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      {icon ? <ThemedText style={[styles.icon, { color }]}>{icon}</ThemedText> : null}
      <ThemedText style={[styles.label, { color }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  icon: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
