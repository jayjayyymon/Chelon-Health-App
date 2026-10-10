import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StepsChart } from '@/components/charts/StepsChart';
import { StepsIcon } from '@/components/icons/tracker-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';

const accentGreen = NavigationColors.background;

export default function StepsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const { stepsHistory, setStepsHistory } = useHealthData();
  const { profile } = useProfile();

  const latestSteps = stepsHistory.length > 0 ? stepsHistory[stepsHistory.length - 1] : null;
  const todaySteps = latestSteps?.steps ?? 0;
  const goalSteps = profile.dailyStepGoal;
  const progress = goalSteps > 0 ? Math.min(Math.round((todaySteps / goalSteps) * 100), 100) : 0;
  const calories = Math.round(todaySteps * 0.22);
  const distanceKm = todaySteps * 0.000762;
  const currentDate = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );
  const contentWidth = Math.min(
    Math.max(screenWidth - Spacing.three * 2, 280),
    Math.min(MaxContentWidth, 520),
  );
  const heroTint = isDark ? '#183B2D' : '#C9E8CA';
  const panelGreen = isDark ? '#245C42' : accentGreen;
  const panelText = '#FFFFFF';
  const controlBackground = isDark ? '#17382E' : '#FFFFFF';
  const inkColor = isDark ? '#F1F7F2' : '#113C3B';
  const mutedInk = isDark ? '#C1D4CA' : '#607B70';
  const borderColor = isDark ? '#397258' : '#D9E7DC';
  const chartWidth = Math.max(180, Math.min(480, contentWidth - Spacing.three * 2));

  const canAddSteps = stepsHistory.length > 0 && todaySteps < goalSteps;

  const addSteps = () => {
    if (!canAddSteps) return;

    const newSteps = Math.min(goalSteps, Math.max(0, todaySteps + 500));
    const updatedHistory = [...stepsHistory];
    updatedHistory[updatedHistory.length - 1] = {
      ...updatedHistory[updatedHistory.length - 1],
      steps: newSteps,
    };
    setStepsHistory(updatedHistory);
  };

  return (
    <ThemedView style={styles.root}>
      <View pointerEvents="none" style={[styles.heroBackground, { backgroundColor: heroTint }]} />
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { width: contentWidth }]}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.roundButton, { backgroundColor: controlBackground }, pressed && styles.pressed]}>
                <ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText>
              </Pressable>
              <ThemedText style={[styles.wordmark, { color: inkColor }]}>steps tracker</ThemedText>
              <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.heading}>
              <ThemedText style={[styles.date, { color: mutedInk }]}>{currentDate}</ThemedText>
              <ThemedText style={[styles.headingTitle, { color: inkColor }]}>TODAY&apos;S STEPS</ThemedText>
            </View>

            <View style={styles.artStage}>
              <StepsIcon size={166} />
            </View>

            <View style={[styles.summaryCard, { backgroundColor: panelGreen }]}>
              <View style={styles.progressHeader}>
                <ThemedText style={[styles.progressLabel, { color: panelText }]}>{progress}%</ThemedText>
              </View>
              <View
                accessibilityLabel="Daily step goal progress"
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: progress }}
                style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.compactStatsRow}>
                <CompactMetric label="STEPS" value={todaySteps.toLocaleString()} unit="steps" background={controlBackground} color={inkColor} muted={mutedInk} />
                <CompactMetric label="CALORIES" value={calories.toLocaleString()} unit="kcal" background={controlBackground} color={inkColor} muted={mutedInk} />
                <CompactMetric label="DISTANCE" value={distanceKm.toFixed(1)} unit="km" background={controlBackground} color={inkColor} muted={mutedInk} />
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statTile, { backgroundColor: controlBackground }]}>
                  <ThemedText style={[styles.statCaption, { color: mutedInk }]}>TODAY</ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, { color: inkColor }]}>{todaySteps.toLocaleString()}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>steps</ThemedText>
                  </View>
                </View>
                <View style={[styles.statTile, { backgroundColor: controlBackground }]}>
                  <ThemedText style={[styles.statCaption, { color: mutedInk }]}>GOAL</ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, { color: inkColor }]}>{goalSteps.toLocaleString()}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>steps</ThemedText>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityLabel="Add 500 steps"
                accessibilityRole="button"
                accessibilityState={{ disabled: !canAddSteps }}
                disabled={!canAddSteps}
                onPress={addSteps}
                style={({ pressed }) => [styles.addButton, { backgroundColor: controlBackground, opacity: canAddSteps ? (pressed ? 0.82 : 1) : 0.55 }]}>
                <ThemedText style={[styles.addButtonIcon, { color: inkColor }]}>⊞</ThemedText>
                <ThemedText style={[styles.addButtonText, { color: inkColor }]}>{canAddSteps ? 'ADD STEP' : 'GOAL REACHED'}</ThemedText>
              </Pressable>
            </View>

            <View style={[styles.historyCard, { backgroundColor: theme.background, borderColor }]}>
              <ThemedText style={[styles.sectionTitle, { color: inkColor }]}>Step history</ThemedText>
              <StepsChart
                height={180}
                lineColor={isDark ? '#8BD8C1' : '#2F9D77'}
                textColor={inkColor}
                width={chartWidth}
              />
              <ThemedText style={[styles.sectionSubtitle, { color: mutedInk }]}>
                Latest entry: {latestSteps?.date ?? 'No entry yet'}
              </ThemedText>
            </View>

            <View style={[styles.tipsCard, { backgroundColor: panelGreen }]}>
              <ThemedText style={[styles.tipsTitle, { color: panelText }]}>Keep moving at your own pace</ThemedText>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <ThemedText style={[styles.tipText, { color: panelText }]}>Short walks throughout the day can add up.</ThemedText>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <ThemedText style={[styles.tipText, { color: panelText }]}>Choose a comfortable pace and build consistency over time.</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function CompactMetric({
  label,
  value,
  unit,
  background,
  color,
  muted,
}: {
  label: string;
  value: string;
  unit: string;
  background: string;
  color: string;
  muted: string;
}) {
  return (
    <View style={[styles.compactMetric, { backgroundColor: background }]}>
      <ThemedText style={[styles.compactLabel, { color: muted }]}>{label}</ThemedText>
      <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.compactValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.compactUnit, { color }]}>{unit}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  heroBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.five },
  content: { maxWidth: Math.min(MaxContentWidth, 520), minWidth: 280 },
  topBar: { height: 44, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  roundButton: { alignItems: 'center', borderRadius: 13, elevation: 2, height: 40, justifyContent: 'center', shadowColor: '#173B2D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 5, width: 40 },
  backGlyph: { fontSize: 36, fontWeight: '700', lineHeight: 40, marginTop: -4 },
  topBarSpacer: { height: 40, width: 40 },
  wordmark: { fontSize: 18, fontStyle: 'italic', fontWeight: '900', letterSpacing: -0.7, textTransform: 'lowercase' },
  heading: { alignItems: 'center', gap: Spacing.one, marginTop: Spacing.two },
  date: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  headingTitle: { fontSize: 17, fontWeight: '900', letterSpacing: 0.15, lineHeight: 23, textAlign: 'center' },
  artStage: { alignItems: 'center', height: 180, justifyContent: 'center', marginTop: Spacing.one, zIndex: 2 },
  summaryCard: { borderRadius: 25, elevation: 4, marginTop: -78, paddingBottom: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.five, gap: Spacing.two, shadowColor: '#183B2D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 9 },
  progressHeader: { alignItems: 'flex-end', minHeight: 15 },
  progressLabel: { fontSize: 11, fontWeight: '800' },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.94)', borderColor: 'rgba(255,255,255,0.88)', borderRadius: 9, borderWidth: 2, height: 15, overflow: 'hidden' },
  progressFill: { backgroundColor: '#A9E5BC', borderRadius: 7, height: '100%' },
  compactStatsRow: { flexDirection: 'row', gap: Spacing.one },
  compactMetric: { alignItems: 'center', borderRadius: 10, flex: 1, minHeight: 46, justifyContent: 'center', paddingHorizontal: Spacing.one, paddingVertical: Spacing.one },
  compactLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.2 },
  compactValue: { fontSize: 14, fontWeight: '900', lineHeight: 17 },
  compactUnit: { fontSize: 8, fontWeight: '700', lineHeight: 10 },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statTile: { alignItems: 'center', borderRadius: 17, elevation: 2, flex: 1, justifyContent: 'center', minHeight: 91, paddingHorizontal: Spacing.one, paddingVertical: Spacing.two, shadowColor: '#12392F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statCaption: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  statValueRow: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.one },
  statValue: { fontSize: 32, fontWeight: '900', lineHeight: 39 },
  statUnit: { fontSize: 13, fontWeight: '700' },
  addButton: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: Spacing.two, justifyContent: 'center', minHeight: 46, paddingHorizontal: Spacing.three },
  addButtonIcon: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  addButtonText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  historyCard: { borderRadius: 20, borderWidth: 1, gap: Spacing.two, marginTop: Spacing.three, padding: Spacing.three },
  sectionTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  sectionSubtitle: { fontSize: 12, lineHeight: 18 },
  tipsCard: { borderRadius: 20, gap: Spacing.two, marginTop: Spacing.three, padding: Spacing.three },
  tipsTitle: { fontSize: 15, fontWeight: '800', marginBottom: Spacing.one },
  tipRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.two },
  tipDot: { backgroundColor: '#C8EDCE', borderRadius: 3, height: 6, marginTop: 7, width: 6 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.75 },
});
