import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChelonHeader from '@/components/chelon-header';
import { DashboardTrackerCard } from '@/components/dashboard-tracker-card';
import {
  DietIcon,
  SleepIcon,
  StepsIcon,
  WaterIcon,
  WeightIcon,
} from '@/components/icons/tracker-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DashboardColors, FloatingTabBarInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { trackerShortcuts } from '@/data/mock-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfile } from '@/hooks/useProfile';
import { getLocalDateKey } from '@/utils/dietStorage';

const trackerPresentation = {
  '/diet': { title: 'Diet', icon: DietIcon, color: 'calorie' },
  '/sleep': { title: 'Sleep', icon: SleepIcon, color: 'sleep' },
  '/steps': { title: 'Steps', icon: StepsIcon, color: 'steps' },
  '/water': { title: 'Water', icon: WaterIcon, color: 'water' },
  '/weight': { title: 'Weight', icon: WeightIcon, color: 'weight' },
  '/wellness': { title: 'Wellness', icon: '💚', color: 'wellness' },
} as const;

export default function DashboardScreen() {
  const { weightHistory, waterGlasses, sleepHistory, stepsHistory, dietMeals } = useHealthData();
  const { profile } = useProfile();
  const scheme = useColorScheme();
  const dashboardColors = DashboardColors[scheme === 'dark' ? 'dark' : 'light'];

  const todayKey = getLocalDateKey();
  const latestWeightEntry = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const latestSleepEntry = sleepHistory.find(entry => (entry.dateKey ?? entry.date) === todayKey) ?? null;
  const latestStepsEntry = stepsHistory.find(entry => (entry.dateKey ?? entry.date) === todayKey) ?? null;
  const totalMl = waterGlasses
    .filter(glass => (glass.dateKey ?? todayKey) === todayKey)
    .reduce((sum, glass) => sum + glass.amountMl, 0);
  const totalL = totalMl / 1000;
  const todayMeals = dietMeals.filter(meal => (meal.dateKey ?? todayKey) === todayKey);
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);

  const dynamicTrackerShortcuts = trackerShortcuts.map((item) => {
    const presentation = trackerPresentation[item.href];
    const tracker = {
      ...item,
      ...presentation,
      detail: item.detail,
    };

    switch (item.href) {
      case '/water':
        tracker.value = `${totalL.toFixed(1)} L`;
        tracker.detail = `Goal ${profile.dailyWaterGoalL} L`;
        break;
      case '/weight':
        tracker.value = latestWeightEntry ? `${latestWeightEntry.kg.toFixed(1)} kg` : '-- kg';
        tracker.detail = latestWeightEntry ? 'Latest entry' : 'No data';
        break;
      case '/sleep':
        tracker.value = latestSleepEntry ? `${latestSleepEntry.hours.toFixed(1)} hrs` : '-- hrs';
        tracker.detail = latestSleepEntry ? 'Last night' : 'No sleep data';
        break;
      case '/steps':
        tracker.value = latestStepsEntry ? latestStepsEntry.steps.toLocaleString() : '0';
        tracker.detail = `Goal ${profile.dailyStepGoal} steps`;
        break;
      case '/diet':
        tracker.value = `${totalCalories.toLocaleString()} kcal`;
        tracker.detail = `${todayMeals.length} meals logged`;
        break;
      case '/wellness':
        tracker.value = profile.wellnessStatus ?? 'Not completed';
        tracker.detail = 'Today’s check-in';
        break;
    }

    return {
      ...tracker,
      color: dashboardColors[tracker.color],
    };
  });

  const orderedTrackers = ['/water', '/sleep', '/weight', '/steps', '/diet', '/wellness'];
  const orderedShortcuts = orderedTrackers
    .map((href) => dynamicTrackerShortcuts.find((item) => item.href === href))
    .filter((item) => item !== undefined);
  const trackerRows = [
    orderedShortcuts.slice(0, 2),
    orderedShortcuts.slice(2, 4),
    orderedShortcuts.slice(4, 5),
  ];

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          <View style={styles.content}>
            <ChelonHeader />

            <ThemedView type="backgroundElement" style={styles.greetingCard}>
              <View style={styles.greetingText}>
                <ThemedText type="small">Hello,</ThemedText>
                <ThemedText numberOfLines={1} style={styles.greetingName}>
                  {profile.name}! 👋
                </ThemedText>
              </View>
              <View style={styles.mascotFrame}>
                <Image
                  source={require('../../../assets/images/turtle-avatar.png')}
                  accessibilityLabel="Friendly turtle mascot"
                  resizeMode="contain"
                  style={styles.mascotImage}
                />
              </View>
            </ThemedView>

            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>TRACKERS</ThemedText>
            </View>

            <View style={styles.trackerGrid}>
              {trackerRows.map((row, rowIndex) => (
                <View key={`tracker-row-${rowIndex}`} style={styles.trackerRow}>
                  {row.map((item) => (
                    <View key={item.href} style={styles.trackerCell}>
                      <DashboardTrackerCard
                        href={item.href}
                        title={item.title}
                        icon={item.icon}
                        color={item.color}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: FloatingTabBarInset + Spacing.four,
  },
  safeArea: {
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  greetingCard: {
    minHeight: 76,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  greetingText: {
    flex: 1,
    gap: 1,
  },
  greetingName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  mascotFrame: {
    width: 72,
    height: 72,
    marginLeft: Spacing.two,
    overflow: 'hidden',
  },
  mascotImage: {
    position: 'absolute',
    width: 180,
    height: 180,
    left: -38,
    top: -86,
  },
  sectionHeader: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#858585',
  },
  trackerGrid: {
    width: '100%',
    gap: Spacing.three,
  },
  trackerRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  trackerCell: {
    flex: 1,
    minWidth: 0,
  },
});
