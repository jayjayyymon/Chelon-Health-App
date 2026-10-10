import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';

export default function WaterScreen() {
  const { waterGlasses, setWaterGlasses } = useHealthData();
  const { profile } = useProfile();

  const glassAmountMl = 250;
  const totalMl = waterGlasses.reduce((sum, glass) => sum + glass.amountMl, 0);
  const todayL = totalMl / 1000;
  const goalL = profile.dailyWaterGoalL;

  const addGlass = () => {
    setWaterGlasses(prev => {
      const currentMl = prev.reduce((sum, glass) => sum + glass.amountMl, 0);
      const remainingMl = Math.max(0, Math.round(goalL * 1000) - currentMl);
      if (remainingMl === 0) return prev;

      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amountMl: Math.min(glassAmountMl, remainingMl),
        },
      ];
    });
  };

  const removeGlass = () => {
    if (waterGlasses.length > 0) {
      setWaterGlasses(prev => prev.slice(0, -1));
    }
  };

  return (
    <ScreenContainer subtitle={`${todayL.toFixed(1)} L of ${goalL} L logged today`}>
      <SectionCard title="Today">
        <InfoRow label="Intake" value={`${todayL.toFixed(1)} L`} />
        <InfoRow label="Goal" value={`${goalL} L`} />
      </SectionCard>

      <SectionCard title="Recent glasses">
        {waterGlasses.map((glass) => (
          <InfoRow key={glass.id} label={glass.time} value={`${glass.amountMl} ml`} />
        ))}
      </SectionCard>

      <ThemedView type="backgroundSelected" style={{flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.two}}>
        <TouchableOpacity onPress={removeGlass} style={{paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.two, marginRight: Spacing.one}}>
          <ThemedText type="smallBold">−</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={addGlass} style={{paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.two, marginLeft: Spacing.one}}>
          <ThemedText type="smallBold">+</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScreenContainer>
  );
}