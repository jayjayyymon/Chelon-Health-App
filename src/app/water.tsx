import { useState } from 'react';
import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function WaterScreen() {
  const [glasses, setGlasses] = useState<Array<{id: string; time: string; amountMl: number}>>([]);

  const glassAmountMl = 250;
  const goalGlasses = 8;
  const totalMl = glasses.length * glassAmountMl;
  const todayL = totalMl / 1000;
  const goalL = (goalGlasses * glassAmountMl) / 1000; // 2.0 L

  const addGlass = () => {
    if (glasses.length < goalGlasses) {
      const newGlass = {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        amountMl: glassAmountMl,
      };
      setGlasses(prev => [...prev, newGlass]);
    }
  };

  const removeGlass = () => {
    if (glasses.length > 0) {
      setGlasses(prev => prev.slice(0, -1));
    }
  };

  return (
    <ScreenContainer subtitle={`${todayL.toFixed(1)} L of ${goalL} L logged today`}>
      <SectionCard title="Today">
        <InfoRow label="Intake" value={`${todayL.toFixed(1)} L`} />
        <InfoRow label="Goal" value={`${goalL} L`} />
      </SectionCard>

      <SectionCard title="Recent glasses">
        {glasses.map((glass) => (
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