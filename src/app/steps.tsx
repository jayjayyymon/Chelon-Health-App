import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { useProfile } from '@/hooks/useProfile';
import { useHealthData } from '@/context/HealthDataContext';

export default function StepsScreen() {
  const { stepsHistory, setStepsHistory } = useHealthData();
  const { profile } = useProfile();
  const todaySteps = stepsHistory.length > 0 ? stepsHistory[stepsHistory.length - 1].steps : 0;
  const GOAL = profile.dailyStepGoal;

  const addSteps = () => {
    const newSteps = Math.max(0, todaySteps + 500);
    const updatedHistory = [...stepsHistory];
    updatedHistory[updatedHistory.length - 1] = {
      ...updatedHistory[updatedHistory.length - 1],
      steps: newSteps
    };
    setStepsHistory(updatedHistory);
  };

  // Calculate progress percentage
  const progressPercent = Math.min((todaySteps / GOAL) * 100, 100);

  return (
    <ScreenContainer subtitle="Keep moving toward your daily goal.">
      <SectionCard title="Today">
        <InfoRow label="Steps" value={todaySteps.toLocaleString()} />
        <InfoRow label="Goal" value={GOAL.toLocaleString()} />
        <InfoRow label="Progress" value={`${progressPercent.toFixed(0)}%`} />
        <InfoRow label="Distance" value={`${(todaySteps * 0.000762).toFixed(2)} km`} />
        <InfoRow label="Active time" value={`${Math.floor(todaySteps / 100)} min`} />
      </SectionCard>

      <PlaceholderButton label="Add 500 steps" onPress={addSteps} />
    </ScreenContainer>
  );
}