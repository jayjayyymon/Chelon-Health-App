import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChelonHeader from '@/components/chelon-header';
import { SleepChart } from '@/components/charts/SleepChart';
import { StepsChart } from '@/components/charts/StepsChart';
import { WaterChart } from '@/components/charts/WaterChart';
import { WeightChart } from '@/components/charts/WeightChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  FloatingTabBarInset,
  MaxContentWidth,
  NavigationColors,
  Spacing,
} from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { getLocalDateKey } from '@/utils/dietStorage';
import { Appointment, getAppointments, removeAppointment } from '@/utils/appointmentStorage';
import { useProfile } from '@/hooks/useProfile';
import { useAlert } from '@/hooks/use-alert';

const profileImage = require('../../../assets/images/profile-picture.jpg');

function EmptyStateIcon({ color }: { color: string }) {
  return (
    <View style={[styles.emptyIcon, { borderColor: color }]} accessibilityElementsHidden>
      <View style={[styles.emptyIconSlash, { backgroundColor: color }]} />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const isDark = colorScheme === 'dark';
  const { profile, loading: profileLoading } = useProfile();
  const {
    dietMeals,
    sleepHistory,
    stepsHistory,
    waterGlasses,
    weightHistory,
  } = useHealthData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [selectedTracker, setSelectedTracker] = useState<TrackerKey>('calories');

  const [alertVisible, showAlert, hideAlert, AlertComponent] = useAlert();

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const savedAppointments = await getAppointments();
      const sorted = [...savedAppointments].sort((a, b) => a.timestamp - b.timestamp);
      setAppointments(sorted);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAppointments();
    }, [loadAppointments]),
  );

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const latestSleep = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;
  const latestSteps = stepsHistory.length > 0 ? stepsHistory[stepsHistory.length - 1] : null;
  const todayMeals = useMemo(() => {
    const todayKey = getLocalDateKey();
    return dietMeals.filter(meal => (meal.dateKey ?? todayKey) === todayKey);
  }, [dietMeals]);
  const totalCalories = todayMeals.reduce((total, meal) => total + meal.calories, 0);
  const totalWaterL = waterGlasses.reduce((total, glass) => total + glass.amountMl, 0) / 1000;

  const panelGreen = isDark ? '#245c42' : NavigationColors.background;
  const summaryGreen = isDark ? '#1b4633' : '#c4e8bf';
  const progressGreen = isDark ? '#245c42' : '#b6dfb0';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const cardColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const softShadow = isDark ? '#07150e' : '#173b2c';
  const name = profile.name.trim() || 'Your profile';
  const age = Number.isFinite(profile.age) ? `${profile.age}` : '--';
  const height = Number.isFinite(profile.heightCm) ? `${profile.heightCm} cm` : '--';
  const currentWeight = latestWeight ? `${latestWeight.kg} kg` : '-- kg';
  const goalWeight = Number.isFinite(profile.goalWeightKg) ? `${profile.goalWeightKg} kg` : '-- kg';
  const waterGoal = Number.isFinite(profile.dailyWaterGoalL) ? `${profile.dailyWaterGoalL} L / day` : '--';
  const stepGoal = Number.isFinite(profile.dailyStepGoal)
    ? `${profile.dailyStepGoal.toLocaleString()} / day`
    : '--';
  const calorieGoal = Number.isFinite(profile.dailyCalorieGoal)
    ? `${profile.dailyCalorieGoal.toLocaleString()} kcal / day`
    : '--';
  const sleepGoal = Number.isFinite(profile.dailySleepGoalHours)
    ? `${profile.dailySleepGoalHours.toFixed(1)} hrs / night`
    : '--';
  const primaryGoalLabel = profile.primaryHealthGoal
    ? ({ improve_fitness: 'Improve fitness', maintain_weight: 'Maintain weight', lose_weight: 'Lose weight', gain_weight: 'Gain weight', improve_sleep: 'Improve sleep' } as const)[profile.primaryHealthGoal]
    : 'Not set';
  const hasSummary = waterGlasses.length > 0 || todayMeals.length > 0 || latestSleep !== null || latestSteps !== null;
  const maxContentWidth = Math.min(MaxContentWidth, 520);
  const chartWidth = Math.max(180, Math.min(480, windowWidth - Spacing.three * 4));
  const selectedTrackerOption = trackerOptions.find(option => option.key === selectedTracker) ?? trackerOptions[0];
  const chartLineColor = isDark ? '#8bd8c1' : '#2f9d77';
  const chartTextColor = inkColor;
  const hasCalorieHistory = todayMeals.length > 0;

  const handleCancelAppointment = async (id: string) => {
    showAlert({
      title: 'Cancel appointment?',
      message: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
      type: 'confirmation',
      onConfirm: async () => {
        try {
          await removeAppointment(id);
          await loadAppointments();
        } catch (error) {
          showAlert({
            title: 'Error cancelling appointment',
            message: 'Failed to cancel appointment. Please try again.',
            type: 'error',
          });
          console.error('Failed to cancel appointment:', error);
        }
      },
      cancelText: 'Cancel',
      confirmText: 'Yes, cancel',
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ThemedView style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
            <View style={[styles.content, { maxWidth: maxContentWidth }]}>
              <ChelonHeader />

              <View style={[styles.profileHero, { backgroundColor: panelGreen, shadowColor: softShadow }]}>
                <Image
                  accessibilityLabel={`${name}'s profile picture`}
                  source={profileImage}
                  resizeMode="cover"
                  style={styles.profileImage}
                />
                <View style={styles.profileDetails}>
                  <ThemedText numberOfLines={1} style={styles.profileName}>
                    {profileLoading ? 'Loading profile…' : name}
                  </ThemedText>
                  {!profileLoading && (
                    <>
                      <ThemedText style={styles.profileMeta}>{age} years old · {height}</ThemedText>
                      <ThemedText style={styles.profileMeta}>Current weight: {currentWeight}</ThemedText>
                    </>
                  )}
                  <Pressable
                    accessibilityLabel="Edit profile"
                    accessibilityRole="button"
                    onPress={() => router.push('/edit-profile')}
                    style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
                    <ThemedText style={styles.heroButtonText}>EDIT PROFILE</ThemedText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.sectionHeading}>
                <ThemedText style={[styles.sectionLabel, { color: inkColor }]}>DAILY SUMMARY</ThemedText>
                <View style={[styles.sectionRule, { backgroundColor: borderColor }]} />
              </View>
              <View style={[styles.summaryCard, { backgroundColor: summaryGreen, shadowColor: softShadow }]}>
                {hasSummary ? (
                  <View style={styles.summaryGrid}>
                    <SummaryMetric label="WATER" value={`${totalWaterL.toFixed(1)} L`} color={inkColor} mutedColor={mutedInk} />
                    <SummaryMetric
                      label="CALORIES"
                      value={`${totalCalories.toLocaleString()} kcal`}
                      color={inkColor}
                      mutedColor={mutedInk}
                    />
                    <SummaryMetric
                      label="SLEEP"
                      value={latestSleep ? `${latestSleep.hours.toFixed(1)} hrs` : '--'}
                      color={inkColor}
                      mutedColor={mutedInk}
                    />
                    <SummaryMetric
                      label="STEPS"
                      value={latestSteps ? latestSteps.steps.toLocaleString() : '--'}
                      color={inkColor}
                      mutedColor={mutedInk}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <EmptyStateIcon color={inkColor} />
                    <ThemedText style={[styles.emptyTitle, { color: inkColor }]}>No Daily Summary Yet</ThemedText>
                    <ThemedText style={[styles.emptySubtitle, { color: mutedInk }]}>Keep tracking your health activities to generate your daily summary.</ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.sectionHeading}>
                <ThemedText style={[styles.sectionLabel, { color: inkColor }]}>PROGRESS</ThemedText>
                <View style={[styles.sectionRule, { backgroundColor: borderColor }]} />
                <ThemedText style={[styles.calendarIcon, { color: panelGreen }]}>▣</ThemedText>
              </View>
              <View style={[styles.progressCard, { backgroundColor: progressGreen, shadowColor: softShadow }]}>
                <ScrollView
                  contentContainerStyle={styles.trackerSelector}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {trackerOptions.map(option => {
                    const isSelected = option.key === selectedTracker;
                    return (
                      <Pressable
                        key={option.key}
                        accessibilityLabel={`Show ${option.label.toLowerCase()} progress`}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => setSelectedTracker(option.key)}
                        style={({ pressed }) => [
                          styles.trackerTab,
                          {
                            backgroundColor: isSelected ? panelGreen : cardColor,
                            borderColor: isSelected ? panelGreen : borderColor,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <ThemedText style={[styles.trackerTabText, { color: isSelected ? '#ffffff' : inkColor }]}>
                          {option.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={styles.chartHeader}>
                  <View style={styles.chartHeadingText}>
                    <ThemedText style={[styles.chartTitle, { color: inkColor }]}>{selectedTrackerOption.label} progress</ThemedText>
                    <ThemedText style={[styles.chartSubtitle, { color: mutedInk }]}>
                      {selectedTracker === 'calories'
                        ? 'Today\'s logged meals only'
                        : selectedTracker === 'water'
                          ? 'Current session intake'
                          : `History shown in ${selectedTrackerOption.unit}`}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.chartLatestValue, { color: inkColor }]}>
                    {selectedTracker === 'calories'
                      ? `${totalCalories.toLocaleString()} kcal`
                      : selectedTracker === 'weight'
                        ? currentWeight
                        : selectedTracker === 'water'
                          ? `${totalWaterL.toFixed(1)} L`
                          : selectedTracker === 'sleep'
                            ? latestSleep ? `${latestSleep.hours.toFixed(1)} hrs` : '--'
                            : latestSteps ? latestSteps.steps.toLocaleString() : '--'}
                  </ThemedText>
                </View>
                <View style={styles.chartFrame}>
                  {selectedTracker === 'calories' ? (
                    <View style={styles.chartEmptyState}>
                      <EmptyStateIcon color={inkColor} />
                      <ThemedText style={[styles.chartEmptyTitle, { color: inkColor }]}>
                        {hasCalorieHistory ? `${totalCalories.toLocaleString()} kcal logged today` : 'No calorie history yet'}
                      </ThemedText>
                      <ThemedText style={[styles.chartEmptySubtitle, { color: mutedInk }]}>
                        {hasCalorieHistory ? 'Add meals from the Diet tracker to update this total.' : 'Log a meal to see today\'s calorie total here.'}
                      </ThemedText>
                    </View>
                  ) : selectedTracker === 'weight' ? (
                    <WeightChart
                      height={180}
                      lineColor={chartLineColor}
                      showLabel={false}
                      showValue={false}
                      textColor={chartTextColor}
                      width={chartWidth}
                    />
                  ) : selectedTracker === 'water' ? (
                    <WaterChart
                      height={180}
                      lineColor={isDark ? '#75d7c2' : '#2f9d77'}
                      showLabel={false}
                      showValue={false}
                      textColor={chartTextColor}
                      width={chartWidth}
                    />
                  ) : selectedTracker === 'sleep' ? (
                    <SleepChart
                      height={180}
                      lineColor={isDark ? '#c7a6ff' : '#8554a8'}
                      showLabel={false}
                      showValue={false}
                      textColor={chartTextColor}
                      width={chartWidth}
                    />
                  ) : (
                    <StepsChart
                      height={180}
                      lineColor={chartLineColor}
                      showLabel={false}
                      showValue={false}
                      textColor={chartTextColor}
                      width={chartWidth}
                    />
                  )}
                </View>
              </View>

              <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor, shadowColor: softShadow }]}>
                <View style={styles.cardHeadingRow}>
                  <View style={styles.cardHeadingText}>
                    <ThemedText style={[styles.cardTitle, { color: inkColor }]}>HEALTH GOALS</ThemedText>
                    <ThemedText style={[styles.cardSubtitle, { color: mutedInk }]}>Your saved daily targets</ThemedText>
                  </View>
                  <Pressable
                    accessibilityLabel="Edit goals"
                    accessibilityRole="button"
                    onPress={() => router.push('/edit-goals')}
                    style={({ pressed }) => [styles.outlineButton, { borderColor: panelGreen }, pressed && styles.pressed]}>
                    <ThemedText style={[styles.outlineButtonText, { color: panelGreen }]}>EDIT</ThemedText>
                  </Pressable>
                </View>
                {profileLoading ? (
                  <ThemedText style={{ color: mutedInk }}>Loading goals...</ThemedText>
                ) : (
                  <View style={styles.goalRows}>
                    <GoalRow label="Primary focus" value={primaryGoalLabel} color={inkColor} mutedColor={mutedInk} />
                    <GoalRow label="Goal weight" value={goalWeight} color={inkColor} mutedColor={mutedInk} />
                    <GoalRow label="Water" value={waterGoal} color={inkColor} mutedColor={mutedInk} />
                    <GoalRow label="Steps" value={stepGoal} color={inkColor} mutedColor={mutedInk} />
                    <GoalRow label="Calories" value={calorieGoal} color={inkColor} mutedColor={mutedInk} />
                    <GoalRow label="Sleep" value={sleepGoal} color={inkColor} mutedColor={mutedInk} />
                  </View>
                )}
              </View>

              <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor, shadowColor: softShadow }]}>
                <View style={styles.cardHeadingRow}>
                  <View style={styles.cardHeadingText}>
                    <ThemedText style={[styles.cardTitle, { color: inkColor }]}>APPOINTMENTS</ThemedText>
                    <ThemedText style={[styles.cardSubtitle, { color: mutedInk }]}>Your consultation schedule</ThemedText>
                  </View>
                  <Pressable
                    accessibilityLabel="Browse doctors"
                    accessibilityRole="button"
                    onPress={() => router.push('/doctors')}
                    style={({ pressed }) => [styles.outlineButton, { borderColor: panelGreen }, pressed && styles.pressed]}>
                    <ThemedText style={[styles.outlineButtonText, { color: panelGreen }]}>BOOK</ThemedText>
                  </Pressable>
                </View>
                {appointmentsLoading ? (
                  <ThemedText style={{ color: mutedInk }}>Loading appointments...</ThemedText>
                ) : appointments.length === 0 ? (
                  <ThemedText style={[styles.emptyText, { color: mutedInk }]}>No upcoming appointments</ThemedText>
                ) : (
                  <View>
                    {appointments.map((appointment, index) => (
                      <View
                        key={appointment.id}
                        style={[
                          styles.appointmentRow,
                          index > 0 && { borderTopWidth: 1, borderTopColor: borderColor },
                        ]}>
                        <View style={styles.appointmentDetails}>
                          <ThemedText numberOfLines={1} style={[styles.appointmentDoctor, { color: inkColor }]}>{appointment.doctorName}</ThemedText>
                          <ThemedText numberOfLines={1} style={[styles.appointmentSpecialty, { color: mutedInk }]}>{appointment.specialty}</ThemedText>
                          <ThemedText style={[styles.appointmentDate, { color: inkColor }]}>{appointment.date} · {appointment.time}</ThemedText>
                        </View>
                        <Pressable
                          accessibilityLabel={`Cancel appointment with ${appointment.doctorName}`}
                          accessibilityRole="button"
                          onPress={() => handleCancelAppointment(appointment.id)}
                          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                          <ThemedText style={styles.cancelText}>CANCEL</ThemedText>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </ThemedView>
      <AlertComponent />
    </View>
  );
}

type MetricProps = {
  label: string;
  value: string;
  color: string;
  mutedColor: string;
};

type TrackerKey = 'calories' | 'sleep' | 'steps' | 'water' | 'weight';

const trackerOptions: { key: TrackerKey; label: string; unit: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'sleep', label: 'Sleep', unit: 'hours' },
  { key: 'steps', label: 'Step', unit: 'steps' },
  { key: 'water', label: 'Water', unit: 'L' },
  { key: 'weight', label: 'Weight', unit: 'kg' },
];

function SummaryMetric({ label, value, color, mutedColor }: MetricProps) {
  return (
    <View style={styles.summaryMetric}>
      <ThemedText style={[styles.summaryMetricLabel, { color: mutedColor }]}>{label}</ThemedText>
      <ThemedText numberOfLines={1} adjustsFontSizeToFit style={[styles.summaryMetricValue, { color }]}>{value}</ThemedText>
    </View>
  );
}

function GoalRow({ label, value, color, mutedColor }: MetricProps) {
  return (
    <View style={styles.goalRow}>
      <ThemedText style={[styles.goalLabel, { color: mutedColor }]}>{label}</ThemedText>
      <ThemedText style={[styles.goalValue, { color }]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: FloatingTabBarInset + Spacing.four,
  },
  safeArea: { width: '100%' },
  content: {
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  profileHero: {
    minHeight: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 26,
    elevation: 4,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 92,
    height: 92,
    flexShrink: 0,
    borderWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 46,
  },
  profileDetails: { flex: 1, minWidth: 0, gap: 1 },
  profileName: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
  },
  profileMeta: { color: 'rgba(255,255,255,0.86)', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  heroButtonText: { color: '#2f8258', fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.one },
  sectionLabel: { fontSize: 16, lineHeight: 21, fontWeight: '800', letterSpacing: 0.7 },
  sectionRule: { height: 1, flex: 1 },
  calendarIcon: { fontSize: 20, lineHeight: 22, fontWeight: '700' },
  summaryCard: {
    minHeight: 146,
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: 22,
    elevation: 3,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.three },
  summaryMetric: { width: '50%', gap: 2, paddingHorizontal: Spacing.one },
  summaryMetricLabel: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.5 },
  summaryMetricValue: { fontSize: 22, lineHeight: 28, fontWeight: '900' },
  emptyState: { alignItems: 'center', paddingHorizontal: Spacing.three },
  emptyIcon: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 1.8, borderRadius: 22, transform: [{ rotate: '-45deg' }] },
  emptyIconSlash: { width: 52, height: 1.8 },
  emptyTitle: { marginTop: Spacing.two, fontSize: 16, lineHeight: 21, fontWeight: '800' },
  emptySubtitle: { maxWidth: 280, marginTop: 2, textAlign: 'center', fontSize: 12, lineHeight: 17 },
  progressCard: {
    minHeight: 290,
    padding: Spacing.three,
    borderRadius: 22,
    elevation: 3,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  trackerSelector: { gap: Spacing.one, paddingBottom: Spacing.two },
  trackerTab: {
    minWidth: 58,
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    borderRadius: 10,
  },
  trackerTabText: { fontSize: 13, lineHeight: 18, fontWeight: '800' },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  chartHeadingText: { flex: 1, minWidth: 0 },
  chartTitle: { fontSize: 17, lineHeight: 22, fontWeight: '900' },
  chartSubtitle: { marginTop: 2, fontSize: 12, lineHeight: 17 },
  chartLatestValue: { flexShrink: 1, fontSize: 20, lineHeight: 25, fontWeight: '900', textAlign: 'right' },
  chartFrame: { alignItems: 'center', minHeight: 180, marginTop: Spacing.two },
  chartEmptyState: { alignItems: 'center', justifyContent: 'center', minHeight: 180, paddingHorizontal: Spacing.three },
  chartEmptyTitle: { marginTop: Spacing.two, fontSize: 15, lineHeight: 20, fontWeight: '800', textAlign: 'center' },
  chartEmptySubtitle: { marginTop: Spacing.one, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  infoCard: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 20,
    elevation: 2,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  cardHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  cardHeadingText: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '800', letterSpacing: 0.6 },
  cardSubtitle: { marginTop: 1, fontSize: 13, lineHeight: 18 },
  outlineButton: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderWidth: 1, borderRadius: 8 },
  outlineButtonText: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.5 },
  goalRows: { gap: Spacing.two },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  goalLabel: { fontSize: 14, lineHeight: 20 },
  goalValue: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '800', textAlign: 'right' },
  emptyText: { fontSize: 15, lineHeight: 21 },
  appointmentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  appointmentDetails: { flex: 1, minWidth: 0, gap: 1 },
  appointmentDoctor: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  appointmentSpecialty: { fontSize: 13, lineHeight: 18 },
  appointmentDate: { marginTop: 3, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  cancelButton: { padding: Spacing.one, borderRadius: 6 },
  cancelText: { color: '#c94b4b', fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 0.4 },
  pressed: { opacity: 0.65 },
});