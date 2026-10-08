import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { waterSummary } from '@/data/mock-data';

export default function WaterScreen() {
  return (
    <ScreenContainer subtitle={`${waterSummary.todayL} L of ${waterSummary.goalL} L logged today (mock).`}>
      <SectionCard title="Today">
        <InfoRow label="Intake" value={`${waterSummary.todayL} L`} />
        <InfoRow label="Goal" value={`${waterSummary.goalL} L`} />
      </SectionCard>

      <SectionCard title="Recent glasses">
        {waterSummary.glasses.map((entry) => (
          <InfoRow key={entry.id} label={entry.time} value={`${entry.amountMl} ml`} />
        ))}
      </SectionCard>

      <PlaceholderButton label="Add water (placeholder)" />
    </ScreenContainer>
  );
}
