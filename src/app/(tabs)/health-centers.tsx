import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { healthCenters } from '@/data/mock-data';
import { Spacing } from '@/constants/theme';

export default function HealthCentersScreen() {
  return (
    <ScreenContainer
      inTabs
      title="Health Centers"
      subtitle="Mock nearby clinics. Maps and live data are not connected.">
      {healthCenters.map((center) => (
        <SectionCard key={center.id} title={center.name}>
          <InfoRow label="Type" value={center.type} />
          <InfoRow label="Distance" value={center.distance} />
          <InfoRow label="Hours" value={center.hours} />
          <PlaceholderButton label="Get directions (placeholder)" />
        </SectionCard>
      ))}

      <Link href="/doctors" asChild>
        <Pressable style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="linkPrimary">See mock doctors</ThemedText>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
    paddingVertical: Spacing.one,
  },
});
