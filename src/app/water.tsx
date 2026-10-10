import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WaterIcon } from '@/components/icons/tracker-icons';
import { Colors, MaxContentWidth, NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';

const glassAmountMl = 250;
const accentGreen = NavigationColors.background;

export default function WaterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { waterGlasses, setWaterGlasses } = useHealthData();
  const { profile } = useProfile();

  const totalMl = waterGlasses.reduce((sum, glass) => sum + glass.amountMl, 0);
  const todayL = totalMl / 1000;
  const goalL = profile.dailyWaterGoalL;
  const goalMl = Math.round(goalL * 1000);
  const progress = goalMl > 0 ? Math.min(100, Math.max(0, (totalMl / goalMl) * 100)) : 0;
  const canAddGlass = totalMl < goalMl;
  const currentDate = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );
  const recentGlasses = waterGlasses.slice(-3).reverse();
  const heroTint = isDark ? '#183b2d' : '#c9e8ca';
  const panelGreen = isDark ? '#245c42' : accentGreen;
  const panelText = '#ffffff';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const tileColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';

  const addGlass = () => {
    setWaterGlasses(prev => {
      const currentMl = prev.reduce((sum, glass) => sum + glass.amountMl, 0);
      const remainingMl = Math.max(0, goalMl - currentMl);
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
    <ThemedView style={styles.root}>
      <View pointerEvents="none" style={[styles.heroBackground, { backgroundColor: heroTint }]} />
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
                <ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText>
              </Pressable>
              <ThemedText style={[styles.wordmark, { color: inkColor }]}>water tracker</ThemedText>
              <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.heading}>
              <ThemedText style={[styles.date, { color: mutedInk }]}>{currentDate}</ThemedText>
              <ThemedText style={[styles.headingTitle, { color: inkColor }]}>TODAY&apos;S WATER INTAKE</ThemedText>
            </View>

            <View style={styles.dropStage}>
              <WaterIcon size={166} />
            </View>

            <View style={[styles.progressCard, { backgroundColor: panelGreen }]}>
              <View style={styles.progressHeader}>
                <ThemedText style={[styles.progressLabel, { color: panelText }]}>DAILY PROGRESS</ThemedText>
                <ThemedText style={[styles.progressPercent, { color: panelText }]}>{Math.round(progress)}%</ThemedText>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel="Daily water goal progress"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
                style={[styles.progressTrack, { borderColor: 'rgba(255,255,255,0.88)' }]}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statTile, { backgroundColor: tileColor }]}>
                  <ThemedText style={[styles.statLabel, { color: mutedInk }]}>TODAY</ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText style={[styles.statValue, { color: inkColor }]}>{Math.floor(totalMl / glassAmountMl)}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>cups</ThemedText>
                  </View>
                  <ThemedText style={[styles.statDetail, { color: mutedInk }]}>{todayL.toFixed(1)} L</ThemedText>
                </View>
                <View style={[styles.statTile, { backgroundColor: tileColor }]}>
                  <ThemedText style={[styles.statLabel, { color: mutedInk }]}>GOAL</ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText style={[styles.statValue, { color: inkColor }]}>{Math.round(goalMl / glassAmountMl)}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>cups</ThemedText>
                  </View>
                  <ThemedText style={[styles.statDetail, { color: mutedInk }]}>{goalL} L</ThemedText>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add ${Math.min(glassAmountMl, Math.max(0, goalMl - totalMl))} milliliters of water`}
                disabled={!canAddGlass}
                onPress={addGlass}
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: tileColor, opacity: canAddGlass ? (pressed ? 0.82 : 1) : 0.55 },
                ]}>
                <ThemedText style={[styles.addGlyph, { color: inkColor }]}>＋</ThemedText>
                <ThemedText style={[styles.addButtonText, { color: inkColor }]}>ADD WATER</ThemedText>
              </Pressable>
              <ThemedText style={[styles.addHint, { color: panelText }]}>Up to 250 ml per glass</ThemedText>
            </View>

            <View style={[styles.recentCard, { backgroundColor: theme.background, borderColor }]}>
              <View style={styles.recentHeadingRow}>
                <View>
                  <ThemedText style={[styles.sectionTitle, { color: inkColor }]}>Recent glasses</ThemedText>
                  <ThemedText style={[styles.sectionSubtitle, { color: mutedInk }]}>Your latest water entries</ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Undo last glass"
                  accessibilityState={{ disabled: waterGlasses.length === 0 }}
                  disabled={waterGlasses.length === 0}
                  onPress={removeGlass}
                  style={({ pressed }) => [
                    styles.undoButton,
                    { borderColor, opacity: waterGlasses.length === 0 ? 0.45 : (pressed ? 0.7 : 1) },
                  ]}>
                  <ThemedText style={[styles.undoText, { color: inkColor }]}>Undo last</ThemedText>
                </Pressable>
              </View>
              {recentGlasses.length > 0 ? recentGlasses.map(glass => (
                <View key={glass.id} style={[styles.glassRow, { borderTopColor: borderColor }]}>
                  <ThemedText style={[styles.glassTime, { color: mutedInk }]}>{glass.time}</ThemedText>
                  <ThemedText style={[styles.glassAmount, { color: inkColor }]}>{glass.amountMl} ml</ThemedText>
                </View>
              )) : (
                <ThemedText style={[styles.emptyText, { color: mutedInk }]}>No glasses logged yet.</ThemedText>
              )}
            </View>

            <View style={[styles.tipsCard, { backgroundColor: panelGreen }]}>
              <ThemedText style={[styles.tipsTitle, { color: panelText }]}>A gentle hydration rhythm</ThemedText>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <ThemedText style={[styles.tipText, { color: panelText }]}>Keep water nearby and sip throughout the day.</ThemedText>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <ThemedText style={[styles.tipText, { color: panelText }]}>A refill after activity can help you stay on track.</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: Math.min(MaxContentWidth, 520),
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#173b2c',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backGlyph: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    marginTop: -4,
  },
  wordmark: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.7,
  },
  topBarSpacer: {
    width: 40,
  },
  heading: {
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headingTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  dropStage: {
    height: 137,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transform: [{ translateY: 22 }],
    zIndex: 2,
    marginTop: Spacing.one,
  },
  progressCard: {
    borderRadius: 25,
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
    marginTop: -Spacing.four,
    gap: Spacing.two,
    elevation: 4,
    shadowColor: '#183b2c',
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 15,
    borderWidth: 2,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.94)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#a9e5bc',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    flex: 1,
    minHeight: 91,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    elevation: 2,
    shadowColor: '#12392f',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '700',
  },
  statDetail: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  addGlyph: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  addHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: Spacing.one,
  },
  recentCard: {
    marginTop: Spacing.three,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  recentHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  undoButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
  },
  undoText: {
    fontSize: 12,
    fontWeight: '800',
  },
  glassRow: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  glassTime: {
    fontSize: 13,
  },
  glassAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    paddingVertical: Spacing.two,
  },
  tipsCard: {
    marginTop: Spacing.three,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: '#c8edce',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.75,
  },
});
