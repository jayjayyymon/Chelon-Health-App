import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { stepsToday } from '@/data/mock-data';
import { useState } from 'react';

export default function StepsScreen() {
  const [steps, setSteps] = useState(stepsToday.count);
  const GOAL = 10000;

  const addSteps = () => {
    setSteps(prev => Math.max(0, prev + 500));
  };

  // Calculate progress percentage
  const progressPercent = Math.min((steps / GOAL) * 100, 100);

  return (
    <ScreenContainer subtitle="Simulated step count. Sensors are not connected.">
      <SectionCard title="Today">
        <InfoRow label="Steps" value={steps.toLocaleString()} />
        <InfoRow label="Goal" value={GOAL.toLocaleString()} />
        <InfoRow label="Progress" value={`${progressPercent.toFixed(0)}%`} />
        <InfoRow label="Distance" value={`${stepsToday.distanceKm} km`} />
        <InfoRow label="Active time" value={`${stepsToday.activeMinutes} min`} />
      </SectionCard>

      <PlaceholderButton label="Add 500 steps" onPress={addSteps} />
    </ScreenContainer>
  );
}