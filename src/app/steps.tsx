import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { stepsToday } from '@/data/mock-data';

export default function StepsScreen() {
  return (
    <ScreenContainer subtitle="Simulated step count. Sensors are not connected.">
      <SectionCard title="Today">
        <InfoRow label="Steps" value={`${stepsToday.count}`} />
        <InfoRow label="Goal" value={`${stepsToday.goal}`} />
        <InfoRow label="Distance" value={`${stepsToday.distanceKm} km`} />
        <InfoRow label="Active time" value={`${stepsToday.activeMinutes} min`} />
      </SectionCard>

      <PlaceholderButton label="Refresh steps (placeholder)" />
    </ScreenContainer>
  );
}
