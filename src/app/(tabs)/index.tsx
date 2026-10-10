import { StyleSheet, View } from 'react-native';

import { NavCard } from '@/components/nav-card';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { careShortcuts, trackerShortcuts, userProfile } from '@/data/mock-data';
import { WeightChart } from '@/components/charts/WeightChart';
import { WaterChart } from '@/components/charts/WaterChart';
import { SleepChart } from '@/components/charts/SleepChart';
import { StepsChart } from '@/components/charts/StepsChart';
import { useHealthData } from '@/context/HealthDataContext';

export default function DashboardScreen() {
  const { weightHistory, waterGlasses, sleepHistory, stepsHistory } = useHealthData();

  // Compute latest weight
  const latestWeightEntry = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const latestWeight = latestWeightEntry ? latestWeightEntry.kg : null;

  // Compute water intake
  const totalMl = waterGlasses.reduce((sum, glass) => sum + glass.amountMl, 0);
  const totalL = totalMl / 1000;
  const goalL = userProfile.dailyWaterGoalL;

  // Compute latest sleep
  const latestSleepEntry = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;
  const latestSleepHours = latestSleepEntry ? latestSleepEntry.hours : null;

  // Compute latest steps
  const latestStepsEntry = stepsHistory.length > 0 ? stepsHistory[stepsHistory.length - 1] : null;
  const latestSteps = latestStepsEntry ? latestStepsEntry.steps : 0;

  // Build dynamic tracker shortcuts
  const dynamicTrackerShortcuts = trackerShortcuts.map(item => {
    // We'll create a new object based on the original, but override value and detail for dynamic ones
    const newItem = { ...item };
    switch (item.href) {
      case '/water':
        newItem.value = `${totalL.toFixed(1)} L`;
        newItem.detail = `Goal ${goalL} L`;
        break;
      case '/weight':
        newItem.value = latestWeight !== null ? `${latestWeight.toFixed(1)} kg` : '-- kg';
        newItem.detail = latestWeight !== null ? 'Latest entry' : 'No data';
        break;
      case '/sleep':
        newItem.value = latestSleepHours !== null ? `${latestSleepHours.toFixed(1)} hrs` : '-- hrs';
        newItem.detail = latestSleepHours !== null ? 'Last night' : 'No sleep data';
        break;
      case '/steps':
        newItem.value = latestSteps.toLocaleString();
        newItem.detail = `Goal ${userProfile.dailyStepGoal} steps`;
        break;
      // For diet and wellness, we keep the original values from mock data
      default:
        break;
    }
    return newItem;
  });

  // Subtitle: greeting and note that data is current
  const subtitle = `Welcome back, ${userProfile.name}. Your health data is up to date.`;

  return (
    <ScreenContainer
      inTabs
      title="Dashboard"
      subtitle={subtitle}
    >
      <ThemedText type="smallBold">Charts</ThemedText>
      <View style={styles.chartsGrid}>
        <View style={styles.chartItem}>
          <WeightChart width={140} height={100} showLabel={false} />
        </View>
        <View style={styles.chartItem}>
          <WaterChart width={140} height={100} showLabel={false} />
        </View>
        <View style={styles.chartItem}>
          <SleepChart width={140} height={100} showLabel={false} />
        </View>
        <View style={styles.chartItem}>
          <StepsChart width={140} height={100} showLabel={false} />
        </View>
      </View>

      <ThemedText type="smallBold">Trackers</ThemedText>
      <View style={styles.grid}>
        {dynamicTrackerShortcuts.map((item) => (
          <View key={item.href} style={styles.gridItem}>
            <NavCard {...item} />
          </View>
        ))}
      </View>

      <ThemedText type="smallBold">Care</ThemedText>
      <View style={styles.stack}>
        {careShortcuts.map((item) => (
          <NavCard key={item.href} {...item} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  chartItem: {
    width: '48%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    flexGrow: 1,
  },
  stack: {
    gap: 12,
  },
});