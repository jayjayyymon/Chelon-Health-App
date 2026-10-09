import { StyleSheet, View } from 'react-native';

import { NavCard } from '@/components/nav-card';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { careShortcuts, trackerShortcuts, userProfile } from '@/data/mock-data';
import { WeightChart } from '@/components/charts/WeightChart';
import { WaterChart } from '@/components/charts/WaterChart';
import { SleepChart } from '@/components/charts/SleepChart';
import { StepsChart } from '@/components/charts/StepsChart';

export default function DashboardScreen() {
  return (
    <ScreenContainer
      inTabs
      title="Dashboard"
      subtitle={`Welcome back, ${userProfile.name}. Today's mock summary is ready.`}>
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
        {trackerShortcuts.map((item) => (
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