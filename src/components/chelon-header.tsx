import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ChelonHeaderProps = {
  accessibilityLabel?: string;
  onPress?: () => void;
  style?: any;
};

export default function ChelonHeader({
  accessibilityLabel = 'Open settings',
  onPress,
  style,
}: ChelonHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.header, style]}>
      <ThemedText style={styles.wordmark}>CHELON</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [
          settingsButtonStyle(isDark),
          pressed && styles.settingsPressed,
        ]}>
        <ThemedView type="backgroundElement" style={styles.settingsButton}>
          <ThemedText style={styles.settingsIcon}>⚙</ThemedText>
        </ThemedView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  wordmark: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.3,
    flexShrink: 0,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsPressed: {
    opacity: 0.7,
  },
  settingsIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
});

// Helper to get proper button styles based on color scheme
function settingsButtonStyle(isDark: boolean) {
  return {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    backgroundColor: isDark ? '#212225' : '#F0F0F3', // backgroundElement
  };
}