import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { userProfile, weightHistory } from '@/data/mock-data';

const latest = weightHistory[weightHistory.length - 1];

export default function WeightScreen() {
  return (
    <ScreenContainer subtitle={`Latest mock weight is ${latest.kg} kg. Goal is ${userProfile.goalWeightKg} kg.`}>
      <SectionCard title="Current">
        <InfoRow label="Latest" value={`${latest.kg} kg`} />
        <InfoRow label="Goal" value={`${userProfile.goalWeightKg} kg`} />
        <InfoRow label="Date" value={latest.date} />
      </SectionCard>

      <SectionCard title="History">
        {weightHistory.map((entry) => (
          <InfoRow key={entry.id} label={entry.date} value={`${entry.kg} kg`} />
        ))}
      </SectionCard>

      <PlaceholderButton label="Log weight (placeholder)" />
    </ScreenContainer>
  );
}
