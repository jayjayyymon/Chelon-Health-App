import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { userProfile } from '@/data/mock-data';
import { useHealthData } from '@/context/HealthDataContext';

export default function StepsScreen() {
  const { stepsHistory, setStepsHistory } = useHealthData();
  const todaySteps = stepsHistory.length > 0 ? stepsHistory[stepsHistory.length - 1].steps : 0;
  const GOAL = userProfile.dailyStepGoal;

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
    <ScreenContainer subtitle="Simulated step count. Sensors are not connected.">
      <SectionCard title="Today">
        <InfoRow label="Steps" value={todaySteps.toLocaleString()} />
        <InfoRow label="Goal" value={GOAL.toLocaleString()} />
        <InfoRow label="Progress" value={`${progressPercent.toFixed(0)}%`} />
        <InfoRow label="Distance" value={`${(todaySteps * 0.000762).toFixed(2)} km`} /> // Assuming average stride length
        <InfoRow label="Active time" value={`${Math.floor(todaySteps / 100)} min`} /> // Rough estimate
      </SectionCard>

      <PlaceholderButton label="Add 500 steps" onPress={addSteps} />
    </ScreenContainer>
  );
}