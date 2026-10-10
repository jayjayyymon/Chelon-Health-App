import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeightChart } from '@/components/charts/WeightChart';
import { WeightIcon } from '@/components/icons/tracker-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';

const accentGreen = NavigationColors.background;

export default function WeightScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const { weightHistory, addWeight } = useHealthData();
  const { profile } = useProfile();
  const [inputWeight, setInputWeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const latest = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const currentWeight = latest?.kg ?? null;
  const currentDate = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );
  const heroTint = isDark ? '#183b2d' : '#c9e8ca';
  const panelGreen = isDark ? '#245c42' : accentGreen;
  const panelText = '#ffffff';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const tileColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';

  const bmi = currentWeight !== null && profile.heightCm > 0
    ? currentWeight / ((profile.heightCm / 100) ** 2)
    : null;
  const bmiStatus = bmi === null
    ? 'Not available'
    : bmi < 18.5
      ? 'Underweight'
      : bmi < 25
        ? 'Normal'
        : bmi < 30
          ? 'Overweight'
          : 'Obesity range';
  const chartWidth = Math.max(180, Math.min(480, windowWidth - Spacing.three * 4));

  const handleWeightChange = (text: string) => {
    setInputWeight(text);
    setError(null);
  };

  const validateWeight = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === '') return 'Please enter a weight';
    if (trimmed.startsWith('-')) return 'Please enter a positive weight';
    if (!/^\d+(?:\.\d)?$/.test(trimmed)) {
      return 'Please enter a valid weight (up to one decimal place)';
    }
    const numericValue = Number(trimmed);
    if (numericValue < 1 || numericValue > 500) return 'Weight must be between 1 kg and 500 kg';
    return null;
  };

  const handleLogWeight = () => {
    const validationError = validateWeight(inputWeight);
    if (validationError) {
      setError(validationError);
      return;
    }

    const weightValue = Number(inputWeight.trim());
    addWeight({
      id: `wt${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      kg: weightValue,
    });
    setInputWeight('');
    setError(null);
    setShowInput(false);
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
              <ThemedText style={[styles.wordmark, { color: inkColor }]}>weight tracker</ThemedText>
              <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.heading}>
              <ThemedText style={[styles.date, { color: mutedInk }]}>{currentDate}</ThemedText>
              <ThemedText style={[styles.headingTitle, { color: inkColor }]}>WEIGHT</ThemedText>
            </View>

            <View style={styles.artStage}>
              <WeightIcon size={166} />
            </View>

            <View style={[styles.summaryCard, { backgroundColor: panelGreen }]}>
              <View style={[styles.bmiRow, { backgroundColor: tileColor }]}>
                <ThemedText style={[styles.metricLabel, { color: mutedInk }]}>BMI</ThemedText>
                <ThemedText style={[styles.bmiValue, { color: inkColor }]}>
                  {bmi === null ? '--' : bmi.toFixed(2)}
                </ThemedText>
                <ThemedText style={[styles.bmiStatus, { backgroundColor: isDark ? '#397258' : '#63b789', color: panelText }]}>
                  {bmiStatus.toUpperCase()}
                </ThemedText>
                <ThemedText style={[styles.metricArrow, { color: inkColor }]}>›</ThemedText>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statTile, { backgroundColor: tileColor }]}>
                  <ThemedText style={[styles.statLabel, { color: mutedInk }]}>CURRENT</ThemedText>
                  <View style={styles.valueRow}>
                    <ThemedText style={[styles.statValue, { color: inkColor }]}>{currentWeight ?? '--'}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>kg</ThemedText>
                  </View>
                </View>
                <View style={[styles.statTile, { backgroundColor: tileColor }]}>
                  <ThemedText style={[styles.statLabel, { color: mutedInk }]}>TARGET</ThemedText>
                  <View style={styles.valueRow}>
                    <ThemedText style={[styles.statValue, { color: inkColor }]}>{profile.goalWeightKg}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>kg</ThemedText>
                  </View>
                </View>
              </View>

              {showInput ? (
                <View style={styles.inputArea}>
                  <TextInput
                    accessibilityLabel="Weight in kilograms"
                    autoFocus
                    keyboardType="decimal-pad"
                    onChangeText={handleWeightChange}
                    placeholder="Enter weight in kg"
                    placeholderTextColor={mutedInk}
                    style={[styles.input, { backgroundColor: tileColor, borderColor, color: inkColor }]}
                    value={inputWeight}
                  />
                  {error ? <ThemedText style={[styles.error, { color: '#ffd0d0' }]}>{error}</ThemedText> : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Save weight"
                    onPress={handleLogWeight}
                    style={({ pressed }) => [styles.saveButton, { backgroundColor: tileColor }, pressed && styles.pressed]}>
                    <ThemedText style={[styles.addButtonText, { color: inkColor }]}>SAVE WEIGHT</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add weight"
                  onPress={() => setShowInput(true)}
                  style={({ pressed }) => [styles.addButton, { backgroundColor: tileColor, opacity: pressed ? 0.82 : 1 }]}>
                  <ThemedText style={[styles.addGlyph, { color: inkColor }]}>⊞</ThemedText>
                  <ThemedText style={[styles.addButtonText, { color: inkColor }]}>ADD WEIGHT</ThemedText>
                </Pressable>
              )}
            </View>

            <View style={[styles.historyCard, { backgroundColor: theme.background, borderColor }]}>
                <View>
                  <ThemedText style={[styles.sectionTitle, { color: inkColor }]}>Weight history</ThemedText>
                  <ThemedText style={[styles.sectionSubtitle, { color: mutedInk }]}>Your saved entries and trend</ThemedText>
                </View>
                <WeightChart
                  height={180}
                  lineColor={isDark ? '#8bd8c1' : '#2f9d77'}
                  textColor={inkColor}
                  width={chartWidth}
                />
                {weightHistory.length > 0 ? weightHistory.slice().reverse().map(entry => (
                  <View key={entry.id} style={[styles.historyRow, { borderTopColor: borderColor }]}>
                    <ThemedText style={[styles.historyDate, { color: mutedInk }]}>{entry.date}</ThemedText>
                    <ThemedText style={[styles.historyValue, { color: inkColor }]}>{entry.kg.toFixed(1)} kg</ThemedText>
                  </View>
                )) : (
                  <ThemedText style={[styles.sectionSubtitle, { color: mutedInk }]}>No weight entries yet.</ThemedText>
                )}
              </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  heroBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  content: { width: '100%', maxWidth: Math.min(MaxContentWidth, 520) },
  topBar: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundButton: {
    width: 40,
    height: 40,
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
  backGlyph: { fontSize: 36, lineHeight: 40, fontWeight: '700', marginTop: -4 },
  topBarSpacer: { width: 40 },
  wordmark: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.7 },
  heading: { alignItems: 'center', marginTop: Spacing.two, gap: Spacing.one },
  date: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  headingTitle: { fontSize: 17, lineHeight: 23, fontWeight: '900', letterSpacing: 0.15 },
  artStage: {
    height: 137,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: 22 }],
    zIndex: 2,
    marginTop: Spacing.one,
  },
  summaryCard: {
    borderRadius: 25,
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
  bmiRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  metricLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  bmiValue: { flex: 1, fontSize: 20, lineHeight: 25, fontWeight: '900' },
  bmiStatus: { borderRadius: 10, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, fontSize: 9, fontWeight: '900' },
  metricArrow: { fontSize: 24, lineHeight: 24, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
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
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.one },
  statValue: { fontSize: 32, lineHeight: 39, fontWeight: '900' },
  statUnit: { fontSize: 13, fontWeight: '700' },
  addButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: 13, paddingHorizontal: Spacing.three },
  addGlyph: { fontSize: 20, lineHeight: 22, fontWeight: '700' },
  addButtonText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  inputArea: { gap: Spacing.two },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 13, paddingHorizontal: Spacing.three, fontSize: 16 },
  saveButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  error: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  historyCard: { marginTop: Spacing.three, borderWidth: 1, borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  sectionTitle: { fontSize: 16, lineHeight: 22, fontWeight: '800' },
  sectionSubtitle: { fontSize: 12, lineHeight: 18 },
  historyRow: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.two },
  historyDate: { fontSize: 13 },
  historyValue: { fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
