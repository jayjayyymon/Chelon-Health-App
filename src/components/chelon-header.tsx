import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

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
  const router = useRouter();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.wordmarkContainer}>
        <ThemedText numberOfLines={1} style={styles.wordmark}>CHELON</ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        onPress={onPress ?? (() => router.push('/settings'))}
        style={({ pressed }) => pressed && styles.settingsPressed}>
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
  wordmarkContainer: {
    minWidth: 124,
    minHeight: 32,
    justifyContent: 'center',
    overflow: 'visible',
  },
  wordmark: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.3,
  },
  settingsButton: {
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
  },
  settingsPressed: {
    opacity: 0.7,
  },
  settingsIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
});
