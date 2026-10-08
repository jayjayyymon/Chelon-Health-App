import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { sleepLastNight } from '@/data/mock-data';

export default function SleepScreen() {
  return (
    <ScreenContainer subtitle={`Last night: ${sleepLastNight.hours} hours (mock).`}>
      <SectionCard title={sleepLastNight.date}>
        <InfoRow label="Duration" value={`${sleepLastNight.hours} hrs`} />
        <InfoRow label="Bedtime" value={sleepLastNight.bedtime} />
        <InfoRow label="Wake" value={sleepLastNight.wakeTime} />
        <InfoRow label="Quality" value={sleepLastNight.quality} />
      </SectionCard>

      <PlaceholderButton label="Log sleep (placeholder)" />
    </ScreenContainer>
  );
}
