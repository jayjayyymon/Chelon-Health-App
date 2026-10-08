import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { userProfile } from '@/data/mock-data';

export default function ProfileScreen() {
  return (
    <ScreenContainer inTabs title="Profile" subtitle="Local mock user. No authentication is used.">
      <SectionCard title="Account">
        <InfoRow label="Name" value={userProfile.name} />
        <InfoRow label="Age" value={`${userProfile.age}`} />
        <InfoRow label="Height" value={`${userProfile.heightCm} cm`} />
      </SectionCard>

      <SectionCard title="Goals">
        <InfoRow label="Weight" value={`${userProfile.goalWeightKg} kg`} />
        <InfoRow label="Water" value={`${userProfile.dailyWaterGoalL} L / day`} />
        <InfoRow label="Steps" value={`${userProfile.dailyStepGoal}`} />
      </SectionCard>

      <PlaceholderButton label="Edit profile (placeholder)" />
    </ScreenContainer>
  );
}
