import { StyleSheet, View } from 'react-native';

import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { wellnessCheck } from '@/data/mock-data';
import { Spacing } from '@/constants/theme';

export default function WellnessScreen() {
  return (
    <ScreenContainer subtitle="Mock mood check-in. Saving answers is not implemented.">
      <SectionCard title="How are you feeling?">
        <View style={styles.moods}>
          {wellnessCheck.moods.map((mood) => (
            <ThemedView
              key={mood}
              type={mood === wellnessCheck.selectedMood ? 'backgroundSelected' : 'background'}
              style={styles.moodChip}>
              <ThemedText type="small">{mood}</ThemedText>
            </ThemedView>
          ))}
        </View>
        <ThemedText themeColor="textSecondary">{wellnessCheck.note}</ThemedText>
      </SectionCard>

      <PlaceholderButton label="Save check-in (placeholder)" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  moods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  moodChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
